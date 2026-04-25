'use client';
import dynamic from 'next/dynamic';

const RegistNote = dynamic(() => import('@/app/MyBooks/note_regist/regist_note'), {
  ssr: false // サーバーサイドレンダリングを無効化
});

export default function Home() {
  return (
    <div>
      <RegistNote />
    </div>
  );
}
