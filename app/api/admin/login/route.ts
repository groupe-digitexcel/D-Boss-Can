import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json().catch(() => ({ email: '', password: '' }));
  if (!email || !password) return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return NextResponse.json({ error: 'Supabase Auth is not configured.' }, { status: 503 });
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email: String(email).trim().toLowerCase(), password });
  if (error || !data.user) return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  const { data: admin } = await (await import('@/lib/supabase-admin')).getSupabaseAdmin().from('admin_users').select('user_id,active').eq('user_id', data.user.id).maybeSingle();
  if (!admin?.active) { await supabase.auth.signOut(); return NextResponse.json({ error: 'This account is not authorized for the candidate pilot.' }, { status: 403 }); }
  return NextResponse.json({ ok: true });
}
