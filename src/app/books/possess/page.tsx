'use client';
import dynamic from 'next/dynamic';

const InsertPossess = dynamic(() => import('@/app/books/possess/insert_possess'), {
  ssr: false // サーバーサイドレンダリングを無効化
});

export default function Home() {
  return (
    <div>
      <InsertPossess />
    </div>
  );
}
