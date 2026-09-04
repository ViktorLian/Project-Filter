export const dynamic = 'force-dynamic';
import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email';
import { isAuthorizedCron } from '@/lib/cron-auth';

const appUrl=process.env.NEXT_PUBLIC_APP_URL||'https://flowpilot.no';
export async function GET(req:NextRequest){
 if(!isAuthorizedCron(req)) return NextResponse.json({error:'Unauthorized'},{status:401});
 const db=createAdminClient();
 const {data:settings}=await db.from('review_automation_settings').select('*').eq('enabled',true).eq('email_enabled',true);
 let sent=0, failed=0;
 for(const setting of settings||[]){
  const cutoff=new Date(Date.now()-setting.delay_hours*3600000).toISOString();
  const {data:jobs}=await db.from('jobs').select('id,job_title,customer_id,company_id,customer:customers(name,email)')
   .eq('company_id',setting.company_id).eq('status','completed').eq('review_email_sent',false).lte('completed_at',cutoff).limit(50);
  const {data:company}=await db.from('leads_companies').select('name,google_review_url').eq('id',setting.company_id).maybeSingle();
  for(const job of jobs||[]){
   const customer=job.customer as any;
   if(!customer?.email) continue;
   const token=randomUUID();
   const {data:survey,error}=await db.from('feedback_surveys').upsert({
    job_id:job.id,customer_id:job.customer_id,company_id:job.company_id,survey_token:token,
    google_review_url:setting.google_review_url||company?.google_review_url||null,delivery_channel:'email',delivery_status:'pending'
   },{onConflict:'job_id'}).select('id,survey_token').single();
   if(error||!survey){failed++;continue;}
   const result=await sendEmail(customer.email,`Hvordan var opplevelsen med ${company?.name||'oss'}?`,
    `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto"><h2>Vi ønsker din ærlige tilbakemelding</h2><p>Hei ${customer.name||'der'}. Det tar under ett minutt.</p><p><a href="${appUrl}/survey/${survey.survey_token}" style="display:inline-block;background:#1e40af;color:white;padding:13px 22px;border-radius:8px;text-decoration:none;font-weight:700">Gi tilbakemelding</a></p><p style="font-size:12px;color:#64748b">Sendt via FlowPilot.</p></div>`);
   await db.from('feedback_surveys').update({sent_at:result.sent?new Date().toISOString():null,delivery_status:result.sent?'sent':'configuration_required',delivery_error:result.sent?null:result.reason}).eq('id',survey.id);
   if(result.sent){await db.from('jobs').update({review_email_sent:true}).eq('id',job.id).eq('company_id',job.company_id);sent++;}else failed++;
  }
 }
 return NextResponse.json({sent,failed});
}
