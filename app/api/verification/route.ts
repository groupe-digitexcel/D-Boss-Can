import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const schema = z.object({
  token: z.string().min(20).max(100),
  guarantor: z.object({name:z.string().trim().min(2).max(120),phone:z.string().trim().min(8).max(30),relationship:z.string().trim().min(2).max(80),address:z.string().trim().min(3).max(250),consentConfirmed:z.boolean()}).optional(),
  reference: z.object({name:z.string().trim().min(2).max(120),phone:z.string().trim().min(8).max(30),relationship:z.string().trim().min(2).max(80)}).optional()
});

async function findCandidate(token:string){
  return getSupabaseAdmin().from('candidate_applications').select('id,applicant_id,name,phone,review_status,preliminary_score,pre_screening_status,identity_status,phone_status,address_status,licence_status,guarantor_status,reference_status,interview_status,field_verification_status,final_decision,created_at').eq('verification_token',token).single();
}

export async function GET(req:NextRequest){
  const t=new URL(req.url).searchParams.get('token');
  if(!t) return NextResponse.json({error:'Missing token'},{status:400});
  const {data,error}=await findCandidate(t);
  if(error||!data) return NextResponse.json({error:'Invalid or expired verification link.'},{status:404});
  const sb=getSupabaseAdmin();
  const {data:docs}=await sb.from('candidate_verification_documents').select('document_type,status,uploaded_at').eq('candidate_id',data.id).order('uploaded_at',{ascending:false});
  const {data:g}=await sb.from('candidate_guarantors').select('name,phone,relationship,address,consent_confirmed').eq('candidate_id',data.id).limit(1).maybeSingle();
  const {data:r}=await sb.from('candidate_references').select('name,phone,relationship').eq('candidate_id',data.id).limit(1).maybeSingle();
  return NextResponse.json({data:{...data,documents:docs||[],guarantor:g,reference:r}});
}

export async function POST(req:NextRequest){
  try{
    const body=schema.parse(await req.json());
    const sb=getSupabaseAdmin();
    const {data:c,error:e}=await sb.from('candidate_applications').select('id').eq('verification_token',body.token).single();
    if(e||!c) return NextResponse.json({error:'Invalid verification link.'},{status:404});
    if(body.guarantor){
      if(!body.guarantor.consentConfirmed) return NextResponse.json({error:'Le consentement du garant est obligatoire.'},{status:422});
      await sb.from('candidate_guarantors').delete().eq('candidate_id',c.id);
      const ins=await sb.from('candidate_guarantors').insert({candidate_id:c.id,name:body.guarantor.name,phone:body.guarantor.phone,relationship:body.guarantor.relationship,address:body.guarantor.address,consent_confirmed:true});
      if(ins.error) throw ins.error;
      await sb.from('candidate_applications').update({guarantor_status:'PENDING'}).eq('id',c.id);
    }
    if(body.reference){
      await sb.from('candidate_references').delete().eq('candidate_id',c.id);
      const ins=await sb.from('candidate_references').insert({candidate_id:c.id,...body.reference});
      if(ins.error) throw ins.error;
      await sb.from('candidate_applications').update({reference_status:'PENDING'}).eq('id',c.id);
    }
    await sb.from('candidate_audit_log').insert({candidate_id:c.id,actor:'CANDIDATE',action:'VERIFICATION_DATA_SUBMITTED'});
    return NextResponse.json({ok:true});
  }catch(e:any){return NextResponse.json({error:e?.issues?.[0]?.message||e?.message||'Invalid data.'},{status:400});}
}
