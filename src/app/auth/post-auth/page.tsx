'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/Client';

export default function PostAuthPage() {
  const router = useRouter();
  const supabase = supabaseClient();

  useEffect(() => {
    let finished = false;

    const go = (path: string) => {
      if (finished) return;
      finished = true;
      router.replace(path);
    };

    // PASSWORD_RECOVERY を監視
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      console.log('Auth Event:', event);
      console.log(session);
      if (finished) return;

      switch (event) {
        case 'PASSWORD_RECOVERY':
          go('/auth/update-password');
          break;

        case 'SIGNED_IN':
          if (session) {
            go('/app/Mybooks');
          }
          break;
      }
    });

    // イベントが来ない場合の保険
    const timer = setTimeout(async () => {
      if (finished) return;

      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session) {
        go('/');
        return;
      }

      go('/app/Mybooks');
    }, 800);

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  return (
    <main
      style={{
        maxWidth: 400,
        margin: '80px auto',
        textAlign: 'center'
      }}
    >
      <h2>認証処理中...</h2>
      <p>しばらくお待ちください。</p>
    </main>
  );
}
