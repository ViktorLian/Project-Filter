import { supabaseAdmin } from '@/lib/supabase';

interface LeadAssignment {
  salesman: string;
  confidence: number;
  reason: string;
}

interface HistoricalData {
  [key: string]: {
    totalLeads: number;
    conversions: number;
    conversionRate: number;
    avgScore: number;
    preferredSources: string[];
  };
}

/**
 * AI-powered lead assignment algorithm
 * Matches new leads to the salesman with highest historical conversion rate
 * for similar lead types
 */
export async function predictBestSalesman(
  lead: any,
  userId: string
): Promise<LeadAssignment> {
  try {
    // Fetch all leads for this user to analyze patterns
    const { data: allLeads } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('user_id', userId);

    if (!allLeads || allLeads.length === 0) {
      return {
        salesman: 'Default Salesman',
        confidence: 0,
        reason: 'No historical data available',
      };
    }

    // Build historical profile by analyzing past conversions
    const historicalData = analyzeHistoricalData(allLeads);

    // Score each salesman based on lead match
    const scores = Object.entries(historicalData).map(([salesman, profile]) => ({
      salesman,
      score: calculateLeadMatch(lead, profile),
      conversionRate: profile.conversionRate,
    }));

    // Sort by match score
    scores.sort((a, b) => b.score - a.score);

    const bestMatch = scores[0];
    const confidence = Math.round(bestMatch.conversionRate * 100);

    return {
      salesman: bestMatch.salesman,
      confidence,
      reason: `${confidence}% historical conversion rate with similar leads`,
    };
  } catch (error) {
    console.error('Error predicting best salesman:', error);
    return {
      salesman: 'Default Salesman',
      confidence: 0,
      reason: 'Error calculating prediction',
    };
  }
}

/**
 * Analyze historical data to build salesman profiles
 */
function analyzeHistoricalData(leads: any[]): HistoricalData {
  const data: HistoricalData = {};

  for (const lead of leads) {
    const salesman = lead.assigned_to || 'Unassigned';

    if (!data[salesman]) {
      data[salesman] = {
        totalLeads: 0,
        conversions: 0,
        conversionRate: 0,
        avgScore: 0,
        preferredSources: [],
      };
    }

    data[salesman].totalLeads++;

    // Track conversions
    if (lead.status === 'converted') {
      data[salesman].conversions++;
    }

    // Track score
    data[salesman].avgScore =
      (data[salesman].avgScore * (data[salesman].totalLeads - 1) +
        (lead.score || 0)) /
      data[salesman].totalLeads;

    // Track sources
    if (lead.source_id && !data[salesman].preferredSources.includes(lead.source_id)) {
      data[salesman].preferredSources.push(lead.source_id);
    }
  }

  // Calculate conversion rates
  for (const salesman in data) {
    data[salesman].conversionRate =
      data[salesman].totalLeads > 0
        ? data[salesman].conversions / data[salesman].totalLeads
        : 0;
  }

  return data;
}

/**
 * Calculate how well a lead matches a salesman's profile
 */
function calculateLeadMatch(lead: any, profile: any): number {
  let score = 0;

  // Score based on average lead score match (30%)
  const scoreDiff = Math.abs((lead.score || 0) - profile.avgScore);
  score += Math.max(0, 30 - scoreDiff);

  // Score based on source preference (40%)
  if (lead.source_id && profile.preferredSources.includes(lead.source_id)) {
    score += 40;
  }

  // Score based on lead quality threshold (30%)
  if ((lead.score || 0) > 80) {
    score += 30;
  }

  return score;
}

/**
 * Assign a lead to the best salesman and notify via Slack
 */
export async function assignLeadToSalesman(
  leadId: string,
  userId: string
): Promise<void> {
  try {
    // Get lead data
    const { data: lead } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (!lead) return;

    // Predict best salesman
    const assignment = await predictBestSalesman(lead, userId);

    // Update lead with assignment
    await supabaseAdmin
      .from('leads')
      .update({
        assigned_to: assignment.salesman,
        assignment_confidence: assignment.confidence,
      })
      .eq('id', leadId);

    // Send Slack notification if webhook is configured
    if (process.env.SLACK_WEBHOOK_URL) {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🎯 New Lead Assignment`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Lead:* ${lead.customer_name}\n*Score:* ${lead.score}\n*Assigned to:* ${assignment.salesman}\n*Confidence:* ${assignment.confidence}%`,
              },
            },
          ],
        }),
      });
    }
  } catch (error) {
    console.error('Error assigning lead:', error);
  }
}
