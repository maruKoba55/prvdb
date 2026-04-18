'use client';

import dynamic from 'next/dynamic';

const EditBook = dynamic(() => import('@/app/book_edit/edit_book'), {
  ssr: false // サーバーサイドレンダリングを無効化
});

export default function Home() {
  return (
    <div>
      <EditBook />
    </div>
  );
}
