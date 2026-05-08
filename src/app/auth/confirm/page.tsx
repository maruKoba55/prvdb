'use client';
import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/Client';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ConfirmPage() {
  const supabase = supabaseClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    const code = searchParams.get('code');
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        // パスワード更新画面などへ遷移
        router.push('/update-password');
        return;
      }
      alert('エラーが発生しました: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1>パスワード再設定の確認</h1>
      <p>下のボタンを押して手続きを続行してください。</p>
      <button onClick={handleVerify} disabled={loading} className="px-4 py-2 bg-blue-500 text-white rounded">
        {loading ? '処理中...' : 'パスワードを再設定する'}
      </button>
    </div>
  );
}
