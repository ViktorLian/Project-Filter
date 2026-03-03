import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export const dynamic = 'force-dynamic';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkLimit } from '@/lib/subscription';
import { assignLeadToSalesman } from '@/lib/lead-assignment';
import { publicLeadSubmissionSchema } from '@/lib/validation';
import { notifyHighQualityLead, notifyNewLead, sendLeadConfirmation } from '@/lib/notifications';

export async function POST(req: NextRequest) {
	try {
		const json = await req.json();
		const parsed = publicLeadSubmissionSchema.safeParse(json);
		if (!parsed.success) return NextResponse.json({ error: 'Invalid submission data' }, { status: 400 });

		const { formId, answers, customerName, customerEmail, customerPhone } = parsed.data;
		const supabase = createAdminClient();

		const { data: form } = await supabase.from('leads_forms').select('user_id, company_id').eq('id', formId).single();
		if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 });

		// Real per-question scoring
		let score = 50;
		let scoreThreshold = 80;
		try {
			const { data: formConfig } = await supabase
				.from('forms')
				.select('score_threshold, questions(id, points, option_points, question_type)')
				.eq('company_id', form.company_id)
				.eq('id', formId)
				.single();

			if (formConfig && (formConfig.questions?.length ?? 0) > 0) {
				let totalEarned = 0;
				let totalPossible = 0;
				for (const q of (formConfig.questions as any[])) {
					const qPoints = q.points || 0;
					totalPossible += qPoints;
					const ans = (answers || []).find((a: any) => a.questionId === q.id);
					if (!ans?.value) continue;
					if (q.option_points && typeof q.option_points === 'object') {
						totalEarned += q.option_points[ans.value] ?? 0;
					} else {
						totalEarned += qPoints;
					}
				}
				if (totalPossible > 0) score = Math.round((totalEarned / totalPossible) * 100);
			} else {
				// Fallback heuristic if form has no scoring config
				if (customerEmail && customerPhone && (customerName || '').length > 3) score = 70;
			}
			if (formConfig?.score_threshold) scoreThreshold = formConfig.score_threshold;
		} catch (e) { console.error('[SCORING ERROR]', e); }

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

		// Fire per-company webhook (configured in settings)
		try {
			const { data: companyConfig } = await supabase
				.from('leads_companies')
				.select('webhook_url, webhook_secret, webhook_enabled')
				.eq('id', form.company_id)
				.single();

			if (companyConfig?.webhook_enabled && companyConfig?.webhook_url) {
				await fetch(companyConfig.webhook_url, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						...(companyConfig.webhook_secret ? { 'X-Lead-Secret': companyConfig.webhook_secret } : {}),
					},
					body: JSON.stringify({
						event: 'lead.created',
						lead: {
							id: lead.id,
							customer_name: lead.customer_name,
							customer_email: lead.customer_email,
							customer_phone: lead.customer_phone,
							score,
							status: 'new',
							form_id: formId,
							created_at: lead.created_at,
						},
					}),
				});
			}
		} catch (e) { console.error('[COMPANY WEBHOOK ERROR]', e); }

		// Legacy global Zapier webhook (env var fallback)
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

		// Email notification to company owner via Resend
		try {
			const { data: owner } = await supabase
				.from('users')
				.select('email')
				.eq('id', form.user_id)
				.single();
			if (owner?.email) {
				const { data: company } = await supabase
					.from('leads_companies')
					.select('name')
					.eq('id', form.company_id)
					.single();
				const companyName = company?.name ?? 'din bedrift';
				if (score >= scoreThreshold) {
					await notifyHighQualityLead(owner.email, lead.id, companyName, score, customerName, customerEmail, customerPhone);
				} else {
					await notifyNewLead(owner.email, lead.id, companyName);
				}
			}
		} catch (e) { console.error('[RESEND NOTIFICATION ERROR]', e); }

		// Send confirmation email to the customer (non-blocking)
		if (customerEmail) {
			try {
				const { data: company } = await supabase
					.from('leads_companies')
					.select('name')
					.eq('id', form.company_id)
					.single();
				const companyName = company?.name ?? 'bedriften';
				await sendLeadConfirmation(customerEmail, customerName ?? '', companyName);
			} catch (e) { console.error('[CUSTOMER CONFIRMATION EMAIL ERROR]', e); }
		}

		return NextResponse.json({ lead }, { status: 201 });
	} catch (e) {
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
