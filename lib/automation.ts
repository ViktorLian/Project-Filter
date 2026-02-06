import { LeadStatus } from '@prisma/client';
import { prisma } from './prisma';
import { computeScore } from './scoring';

export async function runLeadScoringAndAutomation(leadId: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      form: { include: { questions: true } },
      answers: true,
    },
  });

  if (!lead) throw new Error('Lead not found');

  const minAcceptedScore = 10;

  const result = computeScore({
    answers: lead.answers,
    questions: lead.form.questions,
    minAcceptedScore,
  });

  const updatedLead = await prisma.lead.update({
    where: { id: lead.id },
    data: {
      status: result.autoRejected
        ? LeadStatus.REJECTED
        : result.highValue
        ? LeadStatus.ACCEPTED
        : LeadStatus.REVIEWED,
      score: {
        upsert: {
          create: {
            totalScore: result.totalScore,
            riskLevel: result.riskLevel,
            profitabilityScore: result.profitabilityScore,
            autoRejected: result.autoRejected,
            highValue: result.highValue,
            suggestedAction: result.suggestedAction,
          },
          update: {
            totalScore: result.totalScore,
            riskLevel: result.riskLevel,
            profitabilityScore: result.profitabilityScore,
            autoRejected: result.autoRejected,
            highValue: result.highValue,
            suggestedAction: result.suggestedAction,
          },
        },
      },
    },
    include: { score: true },
  });

  await prisma.log.create({
    data: {
      companyId: lead.companyId,
      leadId: lead.id,
      type: 'LEAD_AUTOMATION',
      message: `Lead scored: ${result.totalScore}, status: ${updatedLead.status}`,
    },
  });

  return updatedLead;
}
