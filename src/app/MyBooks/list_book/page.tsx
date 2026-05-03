import { supabaseServer } from '@/lib/Server';
import ListBook from '@/components/list_book';
import { bookSearchMax } from '@/app/constants';

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ListBookPage({ searchParams }: PageProps) {
  const supabase = await supabaseServer();
  const params = await searchParams;

  const { data: idListData, error } = await supabase.rpc('search_books_complex', {
    p_isbn13: (params.isbn as string) || null,
    p_title: (params.title as string) || null,
    p_title_search_type: (params.title_search_type as string) || 'top',
    p_publisher: (params.publisher as string) || null,
    p_publish_series: (params.publish_series as string) || null,
    p_role_cd: (params.role_cd as string) || null,
    p_person_name: (params.person_name as string) || null,
    p_person_search_type: (params.person_search_type as string) || 'top',
    p_booktype_cd: (params.booktype_cd as string) || null,
    p_limit_comic: (params.limit_comic as string) || 'noLimit',
    p_limit_possess: (params.limit_possess as string) || 'noLimit',
    p_display_order: (params.display_order as string) || 'publish',
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
      <ListBook titleAdd="" bookIdList={bookIdList} />
    </div>
  );
}
