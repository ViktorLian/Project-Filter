import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { leadId, content } = await req.json();
    const userId = (session.user as any).id;
    const companyId = (session.user as any).companyId;

    const lead = await prisma.lead.findFirst({
      where: { id: leadId, companyId },
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const note = await prisma.note.create({
      data: {
        leadId,
        userId,
        content,
      },
      include: { user: true },
    });

    return NextResponse.json(note);
  } catch (e) {
    console.error('[CREATE NOTE ERROR]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
