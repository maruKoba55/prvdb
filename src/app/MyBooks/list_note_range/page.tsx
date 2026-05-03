'use client';
import dynamic from 'next/dynamic';

const ListNoteRange = dynamic(() => import('@/app/MyBooks/list_note_range/list_note_range'), {
  ssr: false // サーバーサイドレンダリングを無効化
});

export default function Home() {
  return (
    <div>
      <ListNoteRange />
    </div>
  );
}
