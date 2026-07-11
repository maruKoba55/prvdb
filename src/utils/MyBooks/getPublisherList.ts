/* 出版社リスト全件取得（サーバー用） */
import { supabaseServer } from '@/lib/Server';

export interface PublisherList {
  id: number;
  publisher: string;
  reading: string;
  remarks: string;
}

export async function getPublisherList(): Promise<PublisherList[] | null> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from('publisher_list')
    .select('id, publisher, reading, remarks')
    .order('reading', { ascending: true })
    .order('publisher', { ascending: true });
  if (error) {
    console.error('Error fetching publisher_list:', error.message);
    throw error;
  }
  return data as PublisherList[];
}
