import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkLimit } from '@/lib/subscription';
import { assignLeadToSalesman } from '@/lib/lead-assignment';
import { publicLeadSubmissionSchema } from '@/lib/validation';

export async function POST(req: NextRequest) {
	try {
		const json = await req.json();
		const parsed = publicLeadSubmissionSchema.safeParse(json);
		if (!parsed.success) return NextResponse.json({ error: 'Invalid submission data' }, { status: 400 });

		const { formId, answers, customerName, customerEmail, customerPhone } = parsed.data;
		const supabase = createAdminClient();

		const { data: form } = await supabase.from('leads_forms').select('user_id, company_id').eq('id', formId).single();
		if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 });

		let score = 50;
		if (customerEmail && customerPhone && (customerName || '').length > 3) score = 75;
		if ((customerEmail || '').includes('business') || (customerEmail || '').includes('company')) score = 85;

		// Enforce subscription limit for leads
		try {
			const limit = await checkLimit(form.company_id, 'leads');
			if (!limit.canCreate) {
				console.warn('[LEAD LIMIT REACHED]', form.company_id, limit);
				return NextResponse.json({ error: `Lead limit reached (${limit.limit}). Upgrade your plan to receive more leads.` }, { status: 403 });
			}
		} catch (e) {
			console.error('[LIMIT CHECK ERROR]', e);
			// If limit check fails, proceed cautiously but allow creation to avoid losing leads
		}

		const { data: lead, error: leadError } = await supabase.from('leads').insert({
			user_id: form.user_id,
			company_id: form.company_id,
			form_id: formId,
			customer_name: customerName ?? null,
			customer_email: customerEmail ?? null,
			customer_phone: customerPhone ?? null,
			score,
			status: 'new',
			answers: answers || null,
		}).select().single();

		if (leadError || !lead) {
			console.error('[CREATE LEAD ERROR]', leadError);
			return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
		}

		try { await assignLeadToSalesman(lead.id, form.user_id); } catch (e) { console.error('[ASSIGN LEAD ERROR]', e); }

		try {
			const webhookUrl = process.env.ZAPIER_WEBHOOK_URL;
			const webhookSecret = process.env.ZAPIER_WEBHOOK_SECRET;
			if (webhookUrl) {
				await fetch(webhookUrl, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						...(webhookSecret ? { Authorization: `Bearer ${webhookSecret}` } : {}),
					},
					body: JSON.stringify({ leadId: lead.id }),
				});
			}
		} catch (e) { console.error('[ZAPIER WEBHOOK ERROR]', e); }

		return NextResponse.json({ lead }, { status: 201 });
	} catch (e) {
		console.error('[LEADS POST ERROR]', e);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}

export async function GET(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

		const companyId = (session.user as any).companyId;
		const supabase = createAdminClient();
		const { data: leads, error } = await supabase.from('leads').select('*, form:leads_forms(*)').eq('company_id', companyId).order('created_at', { ascending: false });
		if (error) throw error;
		return NextResponse.json({ leads });
	} catch (e) {
		console.error('[GET LEADS ERROR]', e);
		return NextResponse.json({ error: 'Server error' }, { status: 500 });
	}
}
