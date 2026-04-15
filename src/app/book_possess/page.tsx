'use client';

// api/proxy利用に伴うdeployエラー（Error occurred prerendering page）回避のため、dynamic呼び出し
import dynamic from 'next/dynamic';

const EditPossess = dynamic(() => import('@/app/book_possess/edit_possess'), {
  ssr: false // サーバーサイドレンダリングを無効化
});

export default function Home() {
  return (
    <div>
      <EditPossess />
    </div>
  );
}
