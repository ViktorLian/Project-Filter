import { Resend } from 'resend';
import { readEnv } from '@/lib/env';
function getResend(){ return new Resend(readEnv('RESEND_API_KEY')); }
const FROM = readEnv('EMAIL_FROM') || 'FlowPilot <onboarding@resend.dev>';
export type DeliveryResult = { sent: true; id?: string } | { sent: false; reason: string };
export async function sendEmail(to:string,subject:string,html:string):Promise<DeliveryResult>{
  if(!readEnv('RESEND_API_KEY')) return { sent:false, reason:'RESEND_API_KEY mangler' };
  try {
    const {data,error}=await getResend().emails.send({from:FROM,to,subject,html});
    if(error) return { sent:false, reason:error.message };
    return { sent:true, id:data?.id };
  } catch(error){ return { sent:false, reason:error instanceof Error ? error.message : 'Ukjent e-postfeil' }; }
}
export async function sendLeadNotification(lead:{name:string;email:string;company?:string;formName:string;companyOwnerEmail:string}){
 return sendEmail(lead.companyOwnerEmail,`Ny henvendelse: ${lead.name}`,`<h2>Ny henvendelse fra ${lead.formName}</h2><p><strong>Navn:</strong> ${lead.name}</p><p><strong>E-post:</strong> ${lead.email}</p>`);
}
export async function sendInvoiceEmail(to:string,subject:string,html:string,pdfBuffer:Buffer):Promise<DeliveryResult>{
 if(!process.env.RESEND_API_KEY) return {sent:false,reason:'RESEND_API_KEY mangler'};
 try{const {data,error}=await getResend().emails.send({from:FROM,to,subject,html,attachments:[{filename:'faktura.pdf',content:pdfBuffer}]});if(error)return{sent:false,reason:error.message};return{sent:true,id:data?.id};}
 catch(error){return{sent:false,reason:error instanceof Error?error.message:'Ukjent e-postfeil'};}
}
export async function sendTrialWelcomeEmail(to:string,name:string,businessName:string){
 const appUrl=process.env.NEXT_PUBLIC_APP_URL||'https://flowpilot.no';
 return sendEmail(to,'Velkommen til FlowPilot',`<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto"><h2>Velkommen, ${name}</h2><p>Kontoen til ${businessName} er opprettet. Du blir ikke belastet før du selv velger et abonnement i FlowPilot.</p><p><a href="${appUrl}/dashboard">Åpne dashboardet</a></p></div>`);
}
export async function sendTrialExpiryWarningEmail(to:string,name:string,daysLeft:number){
 const appUrl=process.env.NEXT_PUBLIC_APP_URL||'https://flowpilot.no';
 return sendEmail(to,`Prøveperioden utløper om ${daysLeft} dager`,`<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto"><h2>Hei ${name}</h2><p>Prøveperioden utløper om ${daysLeft} dager. Velg abonnement for å beholde tilgangen.</p><p><a href="${appUrl}/dashboard/billing">Se abonnement</a></p></div>`);
}
