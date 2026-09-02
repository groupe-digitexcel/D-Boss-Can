import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/admin-auth';
export async function POST() { const supabase = await getSupabaseServerClient(); await supabase.auth.signOut(); return NextResponse.json({ ok: true }); }
