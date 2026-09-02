import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin-auth';
export async function GET() { const admin = await getAdminUser(); if (!admin) return NextResponse.json({ authenticated:false }, { status:401 }); return NextResponse.json({ authenticated:true, user:{ id:admin.user.id,email:admin.profile.email,display_name:admin.profile.display_name,role:admin.profile.role } }); }
