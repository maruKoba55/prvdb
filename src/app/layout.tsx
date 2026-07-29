import type { Metadata } from 'next';
import { Noto_Sans_JP, Roboto_Mono } from 'next/font/google';
import { AppContextProvider } from '@/context/AppContext';
import { getSystemConstants } from '@/utils/getSystemConstants';
import './globals.css';

export const metadata: Metadata = {
  title: '私用データベース',
  description: 'My Database'
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // システム定数をすべて取得
  const constants = await getSystemConstants('all');

  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} ${robotoMono.variable} antialiased`}>
        <AppContextProvider initialConstants={constants ?? []}>{children}</AppContextProvider>
      </body>
    </html>
  );
}
