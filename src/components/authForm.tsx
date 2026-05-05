'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/Client';

export default function AuthForm() {
  const supabase = supabaseClient();
  console.log(window.location.origin);

  const router = useRouter();
  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event: any) => {
      if (event === 'SIGNED_IN') {
        router.refresh(); // サーバーコンポーネント(page.tsx)を再実行させる
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase, router]);

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem' }}>
      <Auth
        supabaseClient={supabase}
        view="sign_in" // 最初に見せる画面（magic_link等も可）
        appearance={{
          theme: ThemeSupa,
          style: {
            button: { borderRadius: '8px' },
            input: { borderRadius: '8px' }
          }
        }}
        providers={['google']}
        // ログイン後のリダイレクト先（location.origin～指定すると、Google認証で404）
        //redirectTo={`${typeof window !== 'undefined' ? location.origin : ''}/auth/callback`}
        localization={{
          variables: {
            sign_in: {
              email_label: 'メールアドレス',
              password_label: 'パスワード',
              button_label: 'ログイン',
              link_text: 'すでにアカウントをお持ちですか？ログイン'
            },
            sign_up: {
              email_label: 'メールアドレス',
              password_label: 'パスワード',
              button_label: 'アカウント作成',
              link_text: 'アカウントをお持ちでないですか？サインアップ'
            },
            forgotten_password: {
              link_text: 'パスワードをお忘れですか？',
              button_label: 'パスワード再設定メールを送信'
            }
          }
        }}
      />
    </div>
  );
}
