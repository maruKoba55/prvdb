import { supabaseServer } from '@/lib/Server';
import ListBook from '@/components/list_book';
import { bookSearchMax } from '@/app/constants';

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ViewBookPage({ searchParams }: PageProps) {
  const supabase = await supabaseServer();
  const params = await searchParams;

  const { data: idListData, error } = await supabase.rpc('search_books_unread', {
    p_limit_comic: (params.noteLimit_comic as string) || 'nonComic',
    p_unread_order: (params.unread_order as string) || 'get',
    p_select_limit: (bookSearchMax as number) || 9999
  });
  if (error) {
    console.error(error);
    return (
      <div>
        データ取得失敗 error.code={error.code} :{error.message}
      </div>
    );
  }
  // book_id 配列 (例: [10001, 10005, ...])
  const bookIdList = idListData?.map((item: any) => item.book_id) || [];

  return (
    <div>
      <ListBook titleAdd="未読" bookIdList={bookIdList} />
    </div>
  );
}
