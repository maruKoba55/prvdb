/* システム定数取得（サーバー用）
 * @param 特定の定数名（constant_name）、すべて取得する場合は 'all' または省略
 */
import { supabaseServer } from '@/lib/Server';

export interface SystemConstant {
  constant_name: string;
  constant_type: string;
  constant_value: string;
  remarks: string;
}

export async function getSystemConstants(constantName: string | 'all' = 'all'): Promise<SystemConstant[] | null> {
  const supabase = await supabaseServer();
  let query = supabase.from('system_constants').select('constant_name, constant_type, constant_value, remarks');
  if (constantName !== 'all') {
    query = query.eq('constant_name', constantName);
  }
  const { data, error } = await query;
  if (error) {
    console.error('Error fetching system_constants:', error.message);
    throw error;
  }

  // typeとvalueの合致チェック
  for (let i = 0; i < data.length; i += 1) {
    if (data[i].constant_type === 'numeric' && isNaN(Number(data[i].constant_value))) {
      data[i].constant_value = '0';
      const msg = `システム定数（Table'system_constants' / ${data[i].constant_name}）不正。zeroと見做します。`;
      console.log(msg);
    } else if (
      data[i].constant_type === 'boolean' &&
      !['true', 'false'].includes(data[i].constant_value.toLowerCase())
    ) {
      data[i].constant_value = 'false';
      const msg = `システム定数（Table'system_constants' / ${data[i].constant_name}）不正。falseと見做します。`;
      console.log(msg);
    } else if (data[i].constant_type === 'timestamp' && isNaN(Date.parse(data[i].constant_value))) {
      data[i].constant_value = '1970-01-01T00:00:00Z';
      const msg = `システム定数（Table'system_constants' / ${data[i].constant_name}）不正。1970-01-01T00:00:00Zと見做します。`;
      console.log(msg);
    }
  }

  return data as SystemConstant[];
}
