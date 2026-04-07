'use client';
import dynamic from 'next/dynamic';

const EditRole = dynamic(() => import('@/app/books/role/edit_role'), {
  ssr: false // サーバーサイドレンダリングを無効化
});

export default function Home() {
  return (
    <div>
      <EditRole />
    </div>
  );
}
