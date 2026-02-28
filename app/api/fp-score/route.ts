import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  const companyId = (session?.user as any)?.companyId;
  if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createAdminClient();
  const now = new Date();
  const d30 = new Date(now); d30.setDate(d30.getDate() - 30);
  const d60 = new Date(now); d60.setDate(d60.getDate() - 60);

  const [
    { data: leads30 },
    { data: leads60 },
    { data: pipelineJobs },
    { data: tasks },
    { data: complianceDocs },
    { data: deviations },
    { data: risks },
    { data: inventoryItems },
  ] = await Promise.all([
    supabase.from('leads').select('id,score,created_at').eq('company_id', companyId).gte('created_at', d30.toISOString()),
    supabase.from('leads').select('id,score,created_at').eq('company_id', companyId).gte('created_at', d60.toISOString()).lt('created_at', d30.toISOString()),
    supabase.from('pipeline_jobs').select('id,stage,value').eq('company_id', companyId),
    supabase.from('tasks').select('id,status,due_date').eq('company_id', companyId),
    supabase.from('compliance_documents').select('id,status,expiry_date').eq('company_id', companyId),
    supabase.from('compliance_deviations').select('id,status,severity').eq('company_id', companyId),
    supabase.from('risks').select('id,status,probability,impact').eq('company_id', companyId),
    supabase.from('inventory_items').select('id,quantity,reorder_level').eq('company_id', companyId),
  ]);

  // ── 1. LEAD VELOCITY (0–20)
  const l30 = (leads30 ?? []).length;
  const l60 = (leads60 ?? []).length;
  const avgLeadsQ = l60 > 0 ? l30 / l60 : l30 > 0 ? 2 : 0;
  const leadScore = Math.min(20, Math.round((l30 / Math.max(l30 + l60, 1)) * 20 + (avgLeadsQ > 1 ? 5 : 0)));
  const leadStatus = leadScore >= 15 ? 'green' : leadScore >= 8 ? 'yellow' : 'red';

  // ── 2. PIPELINE HEALTH (0–20)
  const jobs = pipelineJobs ?? [];
  const activeJobs = jobs.filter(j => !['won','lost'].includes(j.stage ?? ''));
  const wonJobs = jobs.filter(j => j.stage === 'won');
  const convRate = jobs.length > 0 ? wonJobs.length / jobs.length : 0;
  const pipelineValue = activeJobs.reduce((s, j) => s + (j.value ?? 0), 0);
  const pipelineScore = Math.min(20, Math.round(convRate * 12 + (pipelineValue > 50000 ? 8 : pipelineValue > 10000 ? 4 : 1)));
  const pipelineStatus = pipelineScore >= 14 ? 'green' : pipelineScore >= 8 ? 'yellow' : 'red';

  // ── 3. TASK EXECUTION (0–15)
  const allTasks = tasks ?? [];
  const doneTasks = allTasks.filter(t => t.status === 'done').length;
  const overdueTasks = allTasks.filter(t => t.status !== 'done' && t.due_date && new Date(t.due_date) < now).length;
  const taskScore = allTasks.length === 0 ? 8
    : Math.min(15, Math.round((doneTasks / allTasks.length) * 15) - overdueTasks * 2);
  const taskStatus = taskScore >= 11 ? 'green' : taskScore >= 6 ? 'yellow' : 'red';

  // ── 4. COMPLIANCE HEALTH (0–15)
  const docs = complianceDocs ?? [];
  const expiredDocs = docs.filter(d => d.status === 'expired').length;
  const expiringDocs = docs.filter(d => d.status === 'expiring').length;
  const openDeviations = (deviations ?? []).filter(d => d.status === 'open' && (d.severity === 'high' || d.severity === 'critical')).length;
  const complianceScore = docs.length === 0 ? 10
    : Math.min(15, 15 - expiredDocs * 3 - expiringDocs * 1 - openDeviations * 2);
  const complianceStatus = complianceScore >= 12 ? 'green' : complianceScore >= 7 ? 'yellow' : 'red';

  // ── 5. RISK MANAGEMENT (0–15)
  const openRisks = (risks ?? []).filter(r => r.status === 'open');
  const criticalRisks = openRisks.filter(r => (r.probability ?? 3) * (r.impact ?? 3) >= 15).length;
  const highRisks = openRisks.filter(r => (r.probability ?? 3) * (r.impact ?? 3) >= 9).length;
  const riskScore = Math.min(15, Math.max(0, 15 - criticalRisks * 5 - highRisks * 2));
  const riskStatus = riskScore >= 12 ? 'green' : riskScore >= 7 ? 'yellow' : 'red';

  // ── 6. OPERATIONAL READINESS (0–15)
  const items = inventoryItems ?? [];
  const lowStock = items.filter(i => (i.quantity ?? 0) <= (i.reorder_level ?? 5)).length;
  const lowStockPct = items.length > 0 ? lowStock / items.length : 0;
  const opsScore = Math.min(15, Math.round(15 - lowStockPct * 10));
  const opsStatus = opsScore >= 12 ? 'green' : opsScore >= 7 ? 'yellow' : 'red';

  const rawTotal = leadScore + pipelineScore + taskScore + complianceScore + riskScore + opsScore;
  const total = Math.min(100, Math.max(0, rawTotal));

  const grade = total >= 85 ? 'A+' : total >= 75 ? 'A' : total >= 65 ? 'B' : total >= 55 ? 'C' : total >= 40 ? 'D' : 'F';
  const gradeColor = total >= 75 ? 'text-emerald-400' : total >= 55 ? 'text-amber-400' : 'text-red-400';

  const dimensions = [
    {
      key: 'leads', label: 'Lead-hastighet', score: leadScore, max: 20, status: leadStatus, icon: 'TrendingUp',
      insight: l30 === 0 ? 'Ingen leads siste 30 dager.' : `${l30} leads siste mnd. ${l30 > l60 ? 'Voksende trend.' : 'Synkende trend — aktiver kampanjer.'}`,
      action: 'Gå til Leads', href: '/dashboard/leads',
    },
    {
      key: 'pipeline', label: 'Pipeline-helse', score: pipelineScore, max: 20, status: pipelineStatus, icon: 'BarChart3',
      insight: jobs.length === 0 ? 'Ingen jobber i pipeline enda.' : `${activeJobs.length} aktive jobber, ${Math.round(convRate * 100)}% konverteringsrate. Verdi: ${pipelineValue.toLocaleString('nb-NO')} kr.`,
      action: 'Åpne Pipeline', href: '/dashboard/pipeline',
    },
    {
      key: 'tasks', label: 'Oppgave-gjennomføring', score: Math.max(0, taskScore), max: 15, status: taskStatus, icon: 'CheckCircle',
      insight: allTasks.length === 0 ? 'Ingen oppgaver registrert.' : `${doneTasks}/${allTasks.length} oppgaver fullfort. ${overdueTasks > 0 ? `${overdueTasks} er forfalne.` : 'Ingen forfalne.'}`,
      action: 'Se oppgaver', href: '/dashboard/operations-hub',
    },
    {
      key: 'compliance', label: 'Compliance', score: Math.max(0, complianceScore), max: 15, status: complianceStatus, icon: 'Shield',
      insight: docs.length === 0 ? 'Ingen dokumenter registrert.' : `${expiredDocs} utlopt, ${expiringDocs} utloper snart. ${openDeviations > 0 ? `${openDeviations} kritiske avvik åpne.` : ''}`,
      action: 'HMS & Compliance', href: '/dashboard/compliance',
    },
    {
      key: 'risk', label: 'Risikostyring', score: Math.max(0, riskScore), max: 15, status: riskStatus, icon: 'Activity',
      insight: openRisks.length === 0 ? 'Ingen åpne risikoer — perfekt.' : `${openRisks.length} åpne risikoer. ${criticalRisks > 0 ? `${criticalRisks} er kritiske!` : 'Ingen kritiske.'}`,
      action: 'Risiko-register', href: '/dashboard/risk',
    },
    {
      key: 'ops', label: 'Driftsberedskap', score: Math.max(0, opsScore), max: 15, status: opsStatus, icon: 'Target',
      insight: items.length === 0 ? 'Ingen lagervarer registrert.' : `${lowStock} av ${items.length} varer under reordrernivå.`,
      action: 'Lager & Ressurser', href: '/dashboard/inventory',
    },
  ];

  return NextResponse.json({ total, grade, gradeColor, dimensions, trend: 3, updatedAt: new Date().toISOString() });
}
