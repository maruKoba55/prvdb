'use client';

import dynamic from 'next/dynamic';

const EditNote = dynamic(() => import('@/app/book_note/edit_note'), {
  ssr: false // サーバーサイドレンダリングを無効化
});

export default function Home() {
  return (
    <div>
      <EditNote />
    </div>
  );
}
