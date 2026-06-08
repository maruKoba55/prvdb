import type { Metadata } from 'next';
import { Noto_Sans_JP, Roboto_Mono } from 'next/font/google';
import { AppContextProvider } from '@/context/AppContext';
import { getSystemConstants } from '@/utils/getSystemConstants';
import { getBookRole } from '@/utils/getBookRole';
import { getBookClass } from '@/utils/getBookClass';
import { getBookForm } from '@/utils/getBookForm';
import './globals.css';

export const metadata: Metadata = {
  title: '書籍管理【開発】',
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // システム定数をすべて取得
  const constants = await getSystemConstants('all');
  // マスタ類をすべて取得
  const bookRoleMaster = await getBookRole('all');
  const bookClassMaster = await getBookClass('all');
  const bookFormMaster = await getBookForm('all');

  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} ${robotoMono.variable} antialiased`}>
        {/* システム定数、マスタ値をクライアント側のContextに流し込む */}
        <AppContextProvider
          initialConstants={constants ?? []}
          initialBookRoleMaster={bookRoleMaster ?? []}
          initialBookClassMaster={bookClassMaster ?? []}
          initialBookFormMaster={bookFormMaster ?? []}
        >
          {children}
        </AppContextProvider>
      </body>
    </html>
  );
}
