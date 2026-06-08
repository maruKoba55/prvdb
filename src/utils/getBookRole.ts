/* 書籍役割マスタ取得（サーバー用）
 * @param 特定の役割（bookroleCd）、すべて取得する場合は 'all' または省略
 */
import { supabaseServer } from '@/lib/Server';

export interface BookRoleMaster {
  role_cd: string;
  role_name: string;
  selectable: boolean;
}

export async function getBookRole(bookroleCd: string | 'all' = 'all'): Promise<BookRoleMaster[] | null> {
  const supabase = await supabaseServer();
  let query = supabase.from('book_role_master').select('role_cd, role_name, selectable').order('role_cd');
  if (bookroleCd !== 'all') {
    query = query.eq('role_cd', bookroleCd);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching book_role_master:', error.message);
    throw error;
  }

  return data as BookRoleMaster[];
}
