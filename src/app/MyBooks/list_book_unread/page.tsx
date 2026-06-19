import { supabaseServer } from '@/lib/Server';
import ListBook from '@/app/MyBooks/list_book';

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ListBookPage({ searchParams }: PageProps) {
  const supabase = await supabaseServer();
  const params = await searchParams;

  const { data: idListData, error } = await supabase.rpc('search_books_unread', {
    p_isbn13: (params.isbn13 as string) || null,
    p_title: (params.title as string) || null,
    p_title_search_type: (params.title_search_type as string) || 'top',
    p_publisher: (params.publisher as string) || null,
    p_publish_series: (params.publish_series as string) || null,
    p_role_cd: (params.role_cd as string) || null,
    p_person_name: (params.person_name as string) || null,
    p_person_search_type: (params.person_search_type as string) || 'top',
    p_bookclass_cd: (params.bookclass_cd as string) || null,
    p_bookform_cd: (params.bookform_cd as string) || null,
    p_display_order: (params.display_order as string) || 'publish',
    p_select_limit: (params.sqlLimit as string) || '0'
  });
  if (error) {
    console.error(error);
    return (
      <div>
        未読一覧 データ取得失敗 error.code={error.code} :{error.message}
      </div>
    );
  }
  // book_id 配列 (例: [10001, 10005, ...])
  const bookIdList = idListData?.map((item: any) => item.book_id) || [];

  // build時のエラー避けのため、bookclass_cd等が undefined、string[]となる可能性を排除
  return (
    <div>
      <ListBook
        titleAdd="未読"
        bookclass_cd={Array.isArray(params.bookclass_cd) ? params.bookclass_cd[0] : (params.bookclass_cd ?? '')}
        bookform_cd={Array.isArray(params.bookform_cd) ? params.bookform_cd[0] : (params.bookform_cd ?? '')}
        limit_possess=""
        display_order={Array.isArray(params.display_order) ? params.display_order[0] : (params.display_order ?? '')}
        bookIdList={bookIdList}
      />
    </div>
  );
}
