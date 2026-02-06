import { createAdminClient } from '@/lib/supabase/admin';

interface ScoringCriteria {
  [questionId: string]: {
    type: 'exact' | 'contains' | 'range' | 'greater' | 'less';
    value?: string | number;
    min?: number;
    max?: number;
    points: number; // Points awarded if criteria is met
  };
}

interface ScoreResult {
  score: number; // 0-100
  maxScore: number;
  details: {
    [questionId: string]: {
      earned: number;
      possible: number;
      matched: boolean;
    };
  };
  color: 'red' | 'orange' | 'green';
}

export async function scoreForm(formId: string, answers: Record<string, any>): Promise<ScoreResult> {
  const supabase = createAdminClient();
  
  // Get form with scoring criteria
  const { data: form } = await supabase
    .from('forms')
    .select('scoring_criteria, questions(*)')
    .eq('id', formId)
    .single();

  if (!form || !form.scoring_criteria) {
    return { score: 0, maxScore: 0, details: {}, color: 'red' };
  }

  const criteria: ScoringCriteria = form.scoring_criteria as any;
  let totalEarned = 0;
  let totalPossible = 0;
  const details: ScoreResult['details'] = {};

  // Score each question
  for (const [questionId, rule] of Object.entries(criteria)) {
    const answer = answers[questionId];
    const points = rule.points || 0;
    totalPossible += points;

    let matched = false;

    if (answer !== undefined && answer !== null && answer !== '') {
      switch (rule.type) {
        case 'exact':
          matched = String(answer).toLowerCase() === String(rule.value).toLowerCase();
          break;

        case 'contains':
          matched = String(answer).toLowerCase().includes(String(rule.value).toLowerCase());
          break;

        case 'range':
          const numAnswer = Number(answer);
          matched = !isNaN(numAnswer) && 
                   numAnswer >= (rule.min || 0) && 
                   numAnswer <= (rule.max || Infinity);
          break;

        case 'greater':
          matched = Number(answer) > (rule.value || 0);
          break;

        case 'less':
          matched = Number(answer) < (rule.value || Infinity);
          break;
      }
    }

    details[questionId] = {
      earned: matched ? points : 0,
      possible: points,
      matched,
    };

    if (matched) {
      totalEarned += points;
    }
  }

  // Calculate percentage score (0-100)
  const score = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;

  // Determine color
  let color: 'red' | 'orange' | 'green' = 'red';
  if (score >= 70) color = 'green';
  else if (score >= 40) color = 'orange';

  return {
    score,
    maxScore: totalPossible,
    details,
    color,
  };
}
