export const dynamic='force-dynamic';
import { createHmac,timingSafeEqual,randomUUID } from 'crypto';
import { NextRequest,NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
function valid(raw:string,signature:string|null){const secret=process.env.ORDER_WEBHOOK_SECRET;if(!secret||!signature)return false;const expected=createHmac('sha256',secret).update(raw).digest('hex');const a=Buffer.from(expected),b=Buffer.from(signature);return a.length===b.length&&timingSafeEqual(a,b);}
export async function POST(req:NextRequest){
 const raw=await req.text();if(!valid(raw,req.headers.get('x-flowpilot-signature')))return NextResponse.json({error:'Ugyldig signatur'},{status:401});
 let body:any;try{body=JSON.parse(raw)}catch{return NextResponse.json({error:'Ugyldig JSON'},{status:400})}
 const {companyId,orderId,customerName,customerEmail,customerPhone,completedAt}=body;
 if(!companyId||!orderId||!customerName||(!customerEmail&&!customerPhone))return NextResponse.json({error:'Påkrevde felt mangler'},{status:400});
 const db=createAdminClient();
 const {data:company}=await db.from('leads_companies').select('id').eq('id',companyId).maybeSingle();
 if(!company)return NextResponse.json({error:'Ukjent bedrift'},{status:404});
 const normalizedEmail=customerEmail?String(customerEmail).trim().toLowerCase():null;
 let customerQuery=db.from('customers').select('id').eq('company_id',companyId);
 customerQuery=normalizedEmail?customerQuery.eq('email',normalizedEmail):customerQuery.eq('phone',String(customerPhone));
 let {data:customer}=await customerQuery.maybeSingle();
 if(!customer){const created=await db.from('customers').insert({company_id:companyId,name:String(customerName).slice(0,200),email:normalizedEmail,phone:customerPhone||null}).select('id').single();customer=created.data;if(created.error||!customer)return NextResponse.json({error:'Kunne ikke lagre kunde'},{status:500});}
 const externalId=String(orderId).slice(0,200);
 const {error}=await db.from('jobs').upsert({company_id:companyId,customer_id:customer.id,external_order_id:externalId,job_title:`Ordre ${externalId}`,status:'completed',completed_at:completedAt||new Date().toISOString(),review_email_sent:false},{onConflict:'company_id,external_order_id'});
 if(error)return NextResponse.json({error:'Kunne ikke registrere fullført ordre'},{status:500});
 return NextResponse.json({accepted:true,requestId:randomUUID()},{status:202});
}
