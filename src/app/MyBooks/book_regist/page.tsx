'use client';
import dynamic from 'next/dynamic';

const RegistBook = dynamic(() => import('@/app/MyBooks/book_regist/regist_book'), {
  ssr: false // サーバーサイドレンダリングを無効化
});

export default function Home() {
  return (
    <div>
      <RegistBook />
    </div>
  );
}
