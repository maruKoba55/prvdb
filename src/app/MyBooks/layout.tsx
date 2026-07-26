import { MyBooksContextProvider } from '@/context/MyBooks/MyBooksContext';
import { getBookRole } from '@/utils/MyBooks/getBookRole';
import { getBookClass } from '@/utils/MyBooks/getBookClass';
import { getBookForm } from '@/utils/MyBooks/getBookForm';
import { getPublisherList } from '@/utils/MyBooks/getPublisherList';

export default async function MyBooksLayout({ children }: { children: React.ReactNode }) {
  // マスタ、リスト類をすべて取得
  const bookRoleMaster = await getBookRole('all');
  const bookClassMaster = await getBookClass('all');
  const bookFormMaster = await getBookForm('all');
  const publisherList = await getPublisherList();

  return (
    <MyBooksContextProvider
      initialBookRoleMaster={bookRoleMaster ?? []}
      initialBookClassMaster={bookClassMaster ?? []}
      initialBookFormMaster={bookFormMaster ?? []}
      initialPublisherList={publisherList ?? []}
    >
      {children}
    </MyBooksContextProvider>
  );
}
