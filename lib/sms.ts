export type SmsResult={sent:true;id?:string}|{sent:false;reason:string};
export async function sendSms(to:string,body:string):Promise<SmsResult>{
 const sid=process.env.TWILIO_ACCOUNT_SID,token=process.env.TWILIO_AUTH_TOKEN,from=process.env.TWILIO_FROM_NUMBER;
 if(!sid||!token||!from)return{sent:false,reason:'SMS-leverandør er ikke konfigurert'};
 const data=new URLSearchParams({To:to,From:from,Body:body});
 try{const response=await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,{method:'POST',headers:{Authorization:`Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,'Content-Type':'application/x-www-form-urlencoded'},body:data});const result=await response.json();if(!response.ok)return{sent:false,reason:result.message||'SMS kunne ikke sendes'};return{sent:true,id:result.sid};}catch(error){return{sent:false,reason:error instanceof Error?error.message:'Ukjent SMS-feil'}}
}
