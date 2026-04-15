'use client';
import dynamic from 'next/dynamic';

const RegistBook = dynamic(() => import('@/app/book_regist/book_regist'), {
  ssr: false // サーバーサイドレンダリングを無効化
});

export default function Home() {
  return (
    <div>
      <RegistBook />
    </div>
  );
}
