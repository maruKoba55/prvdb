import { supabaseClient } from '@/lib/Client';
import EditBook from '@/app/MyBooks/book_edit/edit_book';

// 呼出し元からのbook_id受け取りが2回走行し、1回目の値が2回目でundefinedとなる事象が発生。
// 1回目の成功したデータのみ保持し、2回目以降のundefinedは無視する。
export default async function EditBookPage(props: any) {
  const searchParams = await props?.searchParams;
  const bookId = searchParams?.book_id;
  if (!bookId) {
    return null;
  }

  const { data: book, error } = await supabaseClient
    .from('books')
    .select(
      `
      *,
        book_role (
          *,
          role_master (
            role_name
          )
        ),
        book_possess (
          *,
          booktype_master (
            booktype
          )
        )
    `
    )
    .order('role_cd', { referencedTable: 'book_role', ascending: true })
    .order('role_order', { referencedTable: 'book_role', ascending: true })
    .order('booktype_cd', { referencedTable: 'book_possess', ascending: true })
    .order('get_date', { referencedTable: 'book_possess', ascending: true })
    .eq('book_id', bookId)
    .single();

  if (error || !book) return <div>Book not found.</div>;

  return (
    <div>
      <EditBook book={book} />
    </div>
  );
}
