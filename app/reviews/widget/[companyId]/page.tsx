export const dynamic='force-dynamic';
import { createAdminClient } from '@/lib/supabase/admin';
export default async function ReviewWidget({params}:{params:{companyId:string}}){
 const {data}=await createAdminClient().from('feedback_surveys').select('id,question_1_rating,testimonial_display_text,completed_at,customer:customers(name)')
  .eq('company_id',params.companyId).eq('testimonial_approved',true).not('testimonial_display_text','is',null).order('completed_at',{ascending:false}).limit(6);
 return <main style={{fontFamily:'Arial,sans-serif',padding:16,color:'#0f172a'}}><h2 style={{fontSize:20,margin:'0 0 16px'}}>Kundetilbakemeldinger</h2>
 <div style={{display:'grid',gap:12}}>{(data||[]).length===0?<p style={{color:'#64748b'}}>Ingen publiserte tilbakemeldinger ennå.</p>:(data||[]).map((r:any)=><article key={r.id} style={{border:'1px solid #e2e8f0',borderRadius:10,padding:16,background:'#fff'}}>
 <div aria-label={`${r.question_1_rating} av 10`} style={{fontWeight:700,color:'#1e40af'}}>{r.question_1_rating}/10</div><p style={{lineHeight:1.55}}>{r.testimonial_display_text}</p><small style={{color:'#64748b'}}>{r.customer?.name||'Anonym kunde'}</small></article>)}</div></main>;
}
