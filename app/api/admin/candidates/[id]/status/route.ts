import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const b = await req.json();

  const allowed = [
    'review_status',
    'identity_status',
    'phone_status',
    'address_status',
    'licence_status',
    'guarantor_status',
    'reference_status',
    'interview_status',
    'field_verification_status',
    'final_decision',
    'final_score',
    'verification_notes',
    'reviewer_note',
  ] as const;

  const patch: Record<string, unknown> = {};

  for (const k of allowed) {
    if (b[k] !== undefined) {
      patch[k] = b[k];
    }
  }

  if (b.final_decision === 'APPROVED') {
    const required = [
      'identity_status',
      'phone_status',
      'address_status',
      'licence_status',
      'guarantor_status',
      'reference_status',
      'interview_status',
      'field_verification_status',
    ] as const;

    const { data: c } = await getSupabaseAdmin()
      .from('candidate_applications')
      .select(required.join(','))
      .eq('id', id)
      .single();

    const candidate = c as Record<string, unknown> | null;

    if (
      !candidate ||
      required.some((k) => candidate[k] !== 'VERIFIED')
    ) {
      return NextResponse.json(
        {
          error:
            'Approval blocked: every mandatory verification must be VERIFIED.',
        },
        { status: 422 }
      );
    }

    const { data: docs } = await getSupabaseAdmin()
      .from('candidate_verification_documents')
      .select('document_type,status')
      .eq('candidate_id', id);

    const must = [
      'ID_CARD',
      'DRIVER_LICENSE',
      'RESIDENCE_PROOF',
    ] as const;

    const documents =
      (docs as Array<{
        document_type: string;
        status: string;
      }> | null) ?? [];

    if (
      must.some(
        (t) =>
          !documents.some(
            (d) =>
              d.document_type === t &&
              d.status === 'VERIFIED'
          )
      )
    ) {
      return NextResponse.json(
        {
          error:
            'Approval blocked: ID, licence and residence documents must be uploaded and VERIFIED.',
        },
        { status: 422 }
      );
    }

    patch.verified_at = new Date().toISOString();
  }

  const sb = getSupabaseAdmin();

  const { data, error } = await sb
    .from('candidate_applications')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  await sb.from('candidate_audit_log').insert({
    candidate_id: id,
    actor: 'ADMIN',
    action: 'CANDIDATE_UPDATED',
    details: patch,
  });

  return NextResponse.json({ data });
}
