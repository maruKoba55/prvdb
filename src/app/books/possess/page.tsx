'use client';

// api/proxy利用に伴うdeployエラー回避のため、dynamic呼び出し
import dynamic from 'next/dynamic';

const EditPossess = dynamic(() => import('@/app/books/possess/edit_possess'), {
  ssr: false // サーバーサイドレンダリングを無効化
});

export default function Home() {
  return (
    <div>
      <EditPossess />
    </div>
  );
}
