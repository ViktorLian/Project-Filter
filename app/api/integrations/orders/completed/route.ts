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
 const {data:customer,error:customerError}=await db.from('customers').upsert({company_id:companyId,name:String(customerName).slice(0,200),email:customerEmail||null,phone:customerPhone||null},{onConflict:'company_id,email'}).select('id').single();
 if(customerError||!customer)return NextResponse.json({error:'Kunne ikke lagre kunde'},{status:500});
 const {error}=await db.from('jobs').upsert({company_id:companyId,customer_id:customer.id,job_title:`Ordre ${String(orderId).slice(0,100)}`,status:'completed',completed_at:completedAt||new Date().toISOString(),review_email_sent:false,notes:`Ekstern ordre-ID: ${String(orderId).slice(0,200)}`},{onConflict:'company_id,external_order_id'});
 if(error)return NextResponse.json({error:'Integrasjonen er ikke ferdig konfigurert'},{status:503});
 return NextResponse.json({accepted:true,requestId:randomUUID()},{status:202});
}
