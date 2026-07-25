// Google（OAuth）ログイン用 callback route
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/Server';

export async function GET(request: Request) {
  const supabase = await supabaseServer();
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.log('exchangeCodeForSession failed');
    console.error(error);
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }
  return NextResponse.redirect(`${origin}/application_select`);
}
