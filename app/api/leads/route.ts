import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
// Prisma removed - using Supabase client
import { publicLeadSubmissionSchema } from '@/lib/validation';
import { runLeadScoringAndAutomation } from '@/lib/automation';
import { notifyNewLead } from '@/lib/notifications';

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = publicLeadSubmissionSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid submission data' },
        { status: 400 }
      );
    }

    const { formId, answers, customerName, customerEmail, customerPhone } =
      parsed.data;

    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: {
        company: { include: { users: true } },
        questions: true,
      },
    });

    if (!form || !form.isActive) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    const lead = await prisma.lead.create({
      data: {
        companyId: form.companyId,
        formId: form.id,
        customerName: customerName ?? null,
        customerEmail: customerEmail ?? null,
        customerPhone: customerPhone ?? null,
        answers: {
          create: answers.map((a) => ({
            questionId: a.questionId,
            value: a.value,
          })),
        },
      },
    });

    const updatedLead = await runLeadScoringAndAutomation(lead.id);

    const owners = form.company.users.filter((u) => u.role === 'OWNER');
    await Promise.all(
      owners.map((owner) =>
        notifyNewLead(owner.email, updatedLead.id, form.company.name)
      )
    );

    return NextResponse.json({ success: true, leadId: updatedLead.id });
  } catch (e) {
    console.error('[LEAD SUBMISSION ERROR]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = (session.user as any).companyId;

    const leads = await prisma.lead.findMany({
      where: { companyId },
      include: { score: true, form: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json(leads);
  } catch (e) {
    console.error('[GET LEADS ERROR]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
