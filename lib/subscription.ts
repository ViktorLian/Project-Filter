import { createAdminClient } from './supabase/admin'
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from './stripe'

export async function getSubscriptionStatus(companyId: string) {
  const supabase = createAdminClient()
  
  const { data: company } = await supabase
    .from('leads_companies')
    .select('subscription_status, subscription_plan, trial_ends_at')
    .eq('id', companyId)
    .single()
  
  if (!company) {
    return { hasAccess: false, plan: null, status: null }
  }
  
  // Check if trial is still valid
  const trialEndsAt = company.trial_ends_at ? new Date(company.trial_ends_at) : null
  const trialActive = trialEndsAt && trialEndsAt > new Date()
  
  const hasAccess = 
    company.subscription_status === 'active' || 
    trialActive
  
  return {
    hasAccess,
    plan: company.subscription_plan as SubscriptionPlan | null,
    status: company.subscription_status,
    trialEndsAt: trialEndsAt,
    trialActive
  }
}

export async function checkLimit(companyId: string, limitType: 'leads' | 'forms') {
  const supabase = createAdminClient()
  
  // Get subscription info
  const { data: company } = await supabase
    .from('leads_companies')
    .select('subscription_plan')
    .eq('id', companyId)
    .single()
  
  if (!company?.subscription_plan) {
    // Trial/no subscription - use starter limits
    const planLimits = SUBSCRIPTION_PLANS.starter
    const { count } = await supabase
      .from(limitType === 'leads' ? 'leads' : 'forms')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
    
    return {
      current: count || 0,
      limit: limitType === 'leads' ? planLimits.limits.leads : planLimits.limits.forms,
      canCreate: (count || 0) < (limitType === 'leads' ? planLimits.limits.leads : planLimits.limits.forms)
    }
  }
  
  const plan = SUBSCRIPTION_PLANS[company.subscription_plan as SubscriptionPlan]
  const limit = limitType === 'leads' ? plan.limits.leads : plan.limits.forms
  
  // Unlimited check
  if (limit === 999999) {
    return {
      current: 0,
      limit: Infinity,
      canCreate: true
    }
  }
  
  const { count } = await supabase
    .from(limitType === 'leads' ? 'leads' : 'forms')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
  
  return {
    current: count || 0,
    limit,
    canCreate: (count || 0) < limit
  }
}
