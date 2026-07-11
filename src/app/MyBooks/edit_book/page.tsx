import { supabaseServer } from '@/lib/Server';
import EditBook from './edit_book';

export default async function EditBookPage(props: any) {
  const supabase = await supabaseServer();
  const searchParams = await props?.searchParams;
  const bookId = searchParams?.book_id;
  // bookIdの取得後、該当データを検索
  if (!bookId) {
    return null;
  }
  const { data: book, error } = await supabase
    .from('books')
    .select(
      `
      *,
        book_role (
          *,
          book_role_master (
            role_name
          )
        ),
        book_possess (
          *,
          bookform_master (
            bookform
          )
        )
    `
    )
    .order('role_cd', { referencedTable: 'book_role', ascending: true })
    .order('role_order', { referencedTable: 'book_role', ascending: true })
    .order('get_date', { referencedTable: 'book_possess', ascending: true })
    .order('bookform_cd', { referencedTable: 'book_possess', ascending: true })
    .eq('book_id', bookId)
    .single();

  if (error || !book) return <div>Book not found.</div>;

  return (
    <div>
      <EditBook book={book} />
    </div>
  );
}
