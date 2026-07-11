import { supabaseServer } from '@/lib/Server';
import { getSystemConstants } from '@/utils/getSystemConstants';
import { defaultConstants } from '@/app/constants'; // システム定数の規定値
import MainteSystemConstants from './mainte_systemconstans';

export default async function MainteSystemConstantsPage(props: any) {
  const supabase = await supabaseServer();
  const searchParams = await props?.searchParams;
  const user = searchParams?.user;

  // 登録済みのシステム定数をすべて取得
  let constants = await getSystemConstants('all');

  // 不足しているシステム定数を登録
  let constantAdd = false;
  let i = 0;
  for (i = 0; i < defaultConstants.length; i++) {
    const constantExist = constants?.find((item: any) => item.constant_name === defaultConstants[i][0]);
    if (!constantExist) {
      constantAdd = true;
      const insertData = {
        constant_name: defaultConstants[i][0],
        constant_type: defaultConstants[i][1],
        constant_value: defaultConstants[i][2],
        remarks: defaultConstants[i][3],
        user_id: user
      };
      const { data, error } = await supabase.from('system_constants').insert([insertData]).select();
      if (error) throw error;
    }
  }

  return (
    <div>
      <MainteSystemConstants constantAdd={constantAdd} />
    </div>
  );
}
