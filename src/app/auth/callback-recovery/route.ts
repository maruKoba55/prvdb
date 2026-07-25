// パスワード再設定 callback route
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/Server';

export async function GET(request: Request) {
  //  console.log('request-url:', request.url);
  const supabase = await supabaseServer();
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // codeがある場合
  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      console.error('exchangeCodeForSession failed');
      console.error(exchangeError);
      return NextResponse.redirect(`${origin}/auth/auth-code-error`);
    }
    return NextResponse.redirect(`${origin}/auth/update-password`);
  }

  //  code が無く access_denied の場合（リンク二度押し等）
  if (error === 'access_denied') {
    const {
      data: { session }
    } = await supabase.auth.getSession();
    if (session) {
      console.log('Recovery session already exists. Continue.');
      return NextResponse.redirect(`${origin}/auth/update-password`);
    }
  }

  // その他の場合
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
