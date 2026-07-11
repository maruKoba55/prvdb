/* 書籍形態マスタ取得（サーバー用）
 * @param 特定の形態（bookformCd）、すべて取得する場合は 'all' または省略
 */
import { supabaseServer } from '@/lib/Server';

export interface BookFormMaster {
  bookform_cd: string;
  bookform: string;
  selectable: boolean;
}

export async function getBookForm(bookformCd: string | 'all' = 'all'): Promise<BookFormMaster[] | null> {
  const supabase = await supabaseServer();
  let query = supabase.from('bookform_master').select('bookform_cd, bookform, selectable').order('bookform_cd');
  if (bookformCd !== 'all') {
    query = query.eq('bookform_cd', bookformCd);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching bookform_master:', error.message);
    throw error;
  }

  return data as BookFormMaster[];
}
