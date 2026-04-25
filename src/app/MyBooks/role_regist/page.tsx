'use client';
import dynamic from 'next/dynamic';

const RegistRole = dynamic(() => import('@/app/MyBooks/role_regist/regist_role'), {
  ssr: false // サーバーサイドレンダリングを無効化
});

export default function Home() {
  return (
    <div>
      <RegistRole />
    </div>
  );
}
