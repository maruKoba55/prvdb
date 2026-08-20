'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/Client';
import { Eye, EyeOff } from 'lucide-react';
import { CommonButton } from '@/components/ui/button';
import { styleItems } from '@/app/constants';

export default function LoginForm() {
  const supabase = supabaseClient();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function signInGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback-oauth`
      }
    });
  }

  async function signInMail() {
    if (!email || !password) {
      alert('e-mail , password を入力してください。');
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      alert(error.message);
      return;
    }
    location.href = '/application_select';
  }

  async function signUpMail() {
    setMessage('');
    if (!email || !password) {
      alert('e-mail , password を入力してください。');
      return;
    }
    if (password.length < 8) {
      alert('password は8文字以上にしてください。');
      return;
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback-signup`
      }
    });
    if (error) {
      alert(error.message);
      return;
    }
    setMessage('ユーザー登録確認メールを送信しました。登録済みの場合はログインをお試しください。');
  }

  async function forgotPassword() {
    setMessage('');
    if (!email) {
      alert('e-mail を入力してください。');
      return;
    }
    //    console.log('Cookie before sending Email', document.cookie);
    setSending(true);
    const result = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback-recovery`
    });
    //    console.log('resetEmail:', result);
    setSending(false);
    if (result.error) {
      setMessage(result.error.message);
      return;
    }
    //    console.log('Cookie after sending Email', document.cookie);
    setMessage('パスワード再設定メールを送信しました。メールをご確認ください。');
  }

  // パスワードマネージャー等によるログインフォーム書換えを
  // 避けるため、ブラウザ側のコンポーネントマウントを待つ
  useEffect(() => {
    setIsMounted(true);
  }, []);
  if (!isMounted) return null;

  return (
    <div style={{ width: 830 }}>
      <div className="text-center text-3xl font-bold underline bg-cyan-500">私用ＤＢ／ログイン選択</div>
      <div className="flex flex-col border-solid border-2 rounded-lg m-3 p-2">
        <div className="flex text-xl font-bold text-blue-500 m-1">Googleでログイン</div>
        <div className="flex justify-center items-center">
          <CommonButton label="Googleでログイン" variant="outline" onClick={signInGoogle} />
        </div>
      </div>
      <div className="flex flex-col border-solid border-2 rounded-lg m-3 p-2">
        <div className="flex text-xl font-bold text-blue-500 m-1">e-mailでログイン</div>
        <div className="flex justify-center items-center">
          <label htmlFor="email" className="inline-block">
            e-mail：
          </label>
          <input
            id="email"
            className={styleItems}
            type="email"
            size={36}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label htmlFor="password" className="inline-block ml-4">
            password：
          </label>
          <input
            id="password"
            className={styleItems}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={() => setShowPassword((prev) => !prev)}
            className="text-gray-600 hover:text-gray-800 ml-2"
            title={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <div className="flex justify-center items-center mt-2">
          <CommonButton label="e-mailでログイン" variant="outline" onClick={signInMail} />
        </div>
        <div className="flex flex-col border-t border-dotted mt-2 py-2">
          <div className="flex justify-center items-center gap-2">
            password をお忘れですか？ e-mailを指定して
            <CommonButton
              label={sending ? '送信中...' : '再設定メールを送信'}
              variant="outline"
              onClick={forgotPassword}
              disabled={sending}
            />
          </div>
          <div className="flex flex-col border-t border-dotted mt-2 pt-2">
            <div className="flex justify-center items-center gap-2">
              新規ユーザーを作成しますか？ e-mail、passwordを指定して
              <CommonButton label="ユーザー登録" variant="outline" onClick={signUpMail} />
            </div>
          </div>
        </div>
        {message && (
          <div
            style={{
              color: message.includes('送信しました') ? 'green' : 'red'
            }}
            className="flex justify-center items-center border-t border-dotted mt-2 pt-2"
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
