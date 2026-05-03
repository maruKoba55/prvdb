'use client';
import dynamic from 'next/dynamic';

const ListNoteBook = dynamic(() => import('@/app/MyBooks/list_note_book/list_note_book'), {
  ssr: false // サーバーサイドレンダリングを無効化
});

export default function Home() {
  return (
    <div>
      <ListNoteBook />
    </div>
  );
}
