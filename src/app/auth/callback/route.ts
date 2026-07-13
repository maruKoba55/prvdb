import { supabaseServer } from '@/lib/Server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.log('Error at exchangeCodeForSession');
    console.error(error);
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }
  return NextResponse.redirect(`${origin}/auth/post-auth`);
}
