import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json().catch(() => ({
    email: '',
    password: '',
  }));

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required.' },
      { status: 400 }
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return NextResponse.json(
      { error: 'Supabase Auth is not configured.' },
      { status: 503 }
    );
  }

  let response = NextResponse.json({ ok: true });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email: String(email).trim().toLowerCase(),
    password: String(password),
  });

  if (error || !data.user) {
    return NextResponse.json(
      { error: 'Invalid email or password.' },
      { status: 401 }
    );
  }

  const { data: admin, error: adminError } = await getSupabaseAdmin()
    .from('admin_users')
    .select('user_id,active')
    .eq('user_id', data.user.id)
    .maybeSingle();

  if (adminError) {
    return NextResponse.json(
      { error: 'Unable to verify administrator authorization.' },
      { status: 500 }
    );
  }

  if (!admin?.active) {
    await supabase.auth.signOut();

    return NextResponse.json(
      { error: 'This account is not authorized for the candidate pilot.' },
      { status: 403 }
    );
  }

  return response;
}
