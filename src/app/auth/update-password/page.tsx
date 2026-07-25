'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/Client';
import { Eye, EyeOff } from 'lucide-react';
import { CommonButton } from '@/components/ui/button';
import { styleItems } from '@/app/constants';

export default function UpdatePasswordPage() {
  const supabase = supabaseClient();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function updatePassword() {
    setMessage('');
    if (password !== confirm) {
      setMessage('新パスワードが確認用と一致しません。');
      return;
    }
    if (password.length < 8) {
      setMessage('パスワードは8文字以上にしてください。');
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
    router.replace('/');
  }

  return (
    <div style={{ width: 740 }}>
      <div className="text-center text-3xl font-bold underline bg-orange-500">パスワード変更</div>
      <div className="flex flex-col justify-center items-center mt-3 gap-3">
        <div className="flex justify-center items-center">
          <label htmlFor="password" className="inline-block w-24">
            新パスワード
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
        <div className="flex justify-center items-center">
          <label htmlFor="confirm" className="inline-block w-24">
            新パスワード
            <br />
            （確認用）
          </label>
          <input
            id="confirm"
            className={styleItems}
            type={showConfirm ? 'text' : 'password'}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <button
            onClick={() => setShowConfirm((prev) => !prev)}
            className="text-gray-600 hover:text-gray-800 ml-2"
            title={showConfirm ? 'パスワードを隠す' : 'パスワードを表示'}
          >
            {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <CommonButton
          label={loading ? '変更中...' : 'パスワードを変更する'}
          variant="orange"
          onClick={updatePassword}
          disabled={loading}
        />
        <div className="text-red-500 mt-2">{message}</div>
      </div>
    </div>
  );
}
