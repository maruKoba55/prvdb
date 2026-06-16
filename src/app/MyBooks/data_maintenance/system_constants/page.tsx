import { supabaseServer } from '@/lib/Server';
import { getSystemConstants } from '@/utils/getSystemConstants';
import MainteSystemConstants from './mainte_systemconstans';

//システム定数規定値
const defaultConstants = [
  ['sqlLimit', 'numeric', '0', 'データ検索件数の上限（SQLのLIMIT指定）。0でLIMIT無し（supabaseによる制限のみ）'],
  [
    'supabaseMaxRows',
    'numeric',
    '0',
    'supabaseによる検索制限値（Project Settings ⇒ Data API）。0にすると、書籍検索画面に検索数上限を表示できない場合あり'
  ],
  ['listAlert', 'numeric', '500', 'リスト形式の検索数警告表示件数。0で警告無し'],
  ['viewAlert', 'numeric', '500', '個別形式の検索数警告表示件数。0で警告無し']
];

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
