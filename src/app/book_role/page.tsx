'use client';
import dynamic from 'next/dynamic';

const EditRole = dynamic(() => import('@/app/book_role/edit_role'), {
  ssr: false // サーバーサイドレンダリングを無効化
});

export default function Home() {
  return (
    <div>
      <EditRole />
    </div>
  );
}
