'use client';
import dynamic from 'next/dynamic';

const ListNote = dynamic(() => import('@/app/MyBooks/note_list/list_note'), {
  ssr: false // サーバーサイドレンダリングを無効化
});

export default function Home() {
  return (
    <div>
      <ListNote />
    </div>
  );
}
