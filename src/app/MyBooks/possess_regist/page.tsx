'use client';
import dynamic from 'next/dynamic';

const RegistPossess = dynamic(() => import('@/app/MyBooks/possess_regist/regist_possess'), {
  ssr: false // サーバーサイドレンダリングを無効化
});

export default function Home() {
  return (
    <div>
      <RegistPossess />
    </div>
  );
}
