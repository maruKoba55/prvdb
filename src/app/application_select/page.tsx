// 将来的にアプリケーション選択画面を用意する。
// 現状は無条件に書籍管理（MyBooks）に遷移。
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/Client';

export default function ApplicationSelectPage() {
  const supabase = supabaseClient();
  const router = useRouter();
  //  ユーザー取得
  const [user, setUser] = useState<string | null>(null);
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data && data.user) setUser(data.user.id);
    };
    fetchUser();
  }, []);
  //  userの取得後、書籍管理（MyBooks）に遷移
  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams({
      user: user
    });
    router.push(`/MyBooks/?${params.toString()}`);
  }, [user, router]);

  return <div>読み込み中...</div>;
}
