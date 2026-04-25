'use client';
import dynamic from 'next/dynamic';

const ViewBook = dynamic(() => import('@/app/MyBooks/book_view/view_book'), {
  ssr: false // サーバーサイドレンダリングを無効化
});

export default function Home() {
  return (
    <div>
      <ViewBook />
    </div>
  );
}
