//画面入力項目のclass
export const styleItems =
  'ml-2 border border-[#ccc] p-1 rounded outline-none hover:border-[#999] focus:border-[#007bff] focus:ring-4 focus:ring-[#007bff]/25';

// システム定数の規定値
export const defaultConstants = [
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
