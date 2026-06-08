/* 書籍分類マスタ取得（サーバー用）
 * @param 特定の分類（bookclassCd）、すべて取得する場合は 'all' または省略
 */
import { supabaseServer } from '@/lib/Server';

export interface BookClassMaster {
  bookclass_cd: string;
  bookclass: string;
  selectable: boolean;
}

export async function getBookClass(bookclassCd: string | 'all' = 'all'): Promise<BookClassMaster[] | null> {
  const supabase = await supabaseServer();
  let query = supabase.from('bookclass_master').select('bookclass_cd, bookclass, selectable').order('bookclass_cd');
  if (bookclassCd !== 'all') {
    query = query.eq('bookclass_cd', bookclassCd);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching bookclass_master:', error.message);
    throw error;
  }

  return data as BookClassMaster[];
}
