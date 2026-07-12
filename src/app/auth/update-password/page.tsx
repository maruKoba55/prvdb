'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/Client';

export default function UpdatePasswordPage() {
  const supabase = supabaseClient();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function updatePassword() {
    setMessage('');
    if (password !== confirm) {
      setMessage('パスワードが一致しません。');
      return;
    }
    if (password.length < 8) {
      setMessage('8文字以上入力してください。');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password
    });
    setLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    alert('パスワードを変更しました。');
    router.replace('/MyBooks');
  }

  return (
    <main
      style={{
        maxWidth: 400,
        margin: '50px auto'
      }}
    >
      <h1>パスワード変更</h1>
      <input
        type="password"
        placeholder="新パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <br />
      <input
        type="password"
        placeholder="新パスワード（確認用）"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />
      <br />
      <br />
      <button disabled={loading} onClick={updatePassword}>
        {loading ? '更新中...' : '変更する'}
      </button>
      <p>{message}</p>
    </main>
  );
}
