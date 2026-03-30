import type { Metadata } from 'next';
import { Noto_Sans_JP, Roboto_Mono } from 'next/font/google';
import './globals.css';

export const metadata: Metadata = {
  title: '書籍管理',
  description: 'Database for My Bookshelf'
};

// 日本語フォントの設定
const notoSansJP = Noto_Sans_JP({
  variable: '--font-noto-sans-jp', // CSS変数の定義
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '700']
});

// 欧文等幅フォントの設定
const robotoMono = Roboto_Mono({
  variable: '--font-roboto-mono', // CSS変数の定義
  subsets: ['latin'],
  display: 'swap'
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} ${robotoMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
