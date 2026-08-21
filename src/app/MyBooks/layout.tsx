import type { Metadata } from 'next';
import { MyBooksContextProvider } from '@/context/MyBooks/MyBooksContext';
import { getBookRole } from '@/utils/MyBooks/getBookRole';
import { getBookClass } from '@/utils/MyBooks/getBookClass';
import { getBookForm } from '@/utils/MyBooks/getBookForm';
import { getBookPublisherList } from '@/utils/MyBooks/getBookPublisherList';

export const metadata: Metadata = {
  title: '書籍管理',
  description: 'Database for My Bookshelf'
};

export default async function MyBooksLayout({ children }: { children: React.ReactNode }) {
  // マスタ、リスト類をすべて取得
  const bookRoleMaster = await getBookRole('all');
  const bookClassMaster = await getBookClass('all');
  const bookFormMaster = await getBookForm('all');
  const bookPublisherList = await getBookPublisherList();

  return (
    <MyBooksContextProvider
      initialBookRoleMaster={bookRoleMaster ?? []}
      initialBookClassMaster={bookClassMaster ?? []}
      initialBookFormMaster={bookFormMaster ?? []}
      initialBookPublisherList={bookPublisherList ?? []}
    >
      {children}
    </MyBooksContextProvider>
  );
}
