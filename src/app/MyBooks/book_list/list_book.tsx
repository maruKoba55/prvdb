'use client';

import { useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseClient } from '@/lib/Client';
import { X } from 'lucide-react';
import { CommonButton } from '@/components/ui/button';
import { isbnHyphen10 } from '@/utils/isbnHyphen10';
import { isbnHyphenate } from '@/utils/isbnHyphenate';
import { bookSearchMax } from '@/app/constants';

const screenMinW = 1060; //画面最小幅

export default function ListBook({ bookIdList }: { bookIdList: number[] }) {
  const supabase = supabaseClient();
  const router = useRouter();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // 読み込み状態を管理

  // 各ボタンの処理（ホットキー設定は return ,if文より前に書かないとエラー？）
  //［戻る］（検索条件指定画面へ）
  const handleBack = () => {
    router.back();
  };
  useHotkeys('alt+b', (event) => {
    event.preventDefault(); // ブラウザのデフォルト挙動を防止
    handleBack(); //
  });

  //初期表示件数確認
  useEffect(() => {
    if (bookIdList.length === 0) {
      alert('該当データがありません');
      router.replace('/'); //検索条件指定（/app/page.tsx）へ
      return; //router.back()では検索条件指定まで閉じてしまう
    }
    if (bookIdList.length > 10) {
      const confirmed = window.confirm(
        `該当データ${bookIdList.length}件。時間のかかる場合がありますが続けますか？（${bookSearchMax}件まで表示可能）`
      );
      if (!confirmed) {
        router.replace('/');
        return;
      }
    }
  }, []); // 第2引数を空配列にすることで「初回のみ」実行

  useEffect(() => {
    const fetchDetails = async () => {
      if (bookIdList.length === 0) {
        setBooks([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('books')
        .select(
          `
          *,
          book_role (
            *,
            role_master (role_name)
          ),
          book_possess (
            *,
            booktype_master (booktype)
          )
        `
        )
        .in('book_id', bookIdList)
        .order('role_cd', { foreignTable: 'book_role', ascending: true })
        .order('role_order', { foreignTable: 'book_role', ascending: true })
        .order('get_date', { foreignTable: 'book_possess', ascending: true });

      if (error) {
        console.error(error);
      } else {
        // RPCの順序を維持
        const sortedData = bookIdList.map((id) => data.find((b: any) => b.book_id === id));
        setBooks(sortedData);
      }
      setLoading(false);
    };

    fetchDetails();
  }, [bookIdList, supabase]);

  if (loading) return <div>読み込み中...</div>;
  if (books.length === 0) return <div>該当書籍無し</div>;

  return (
    <div style={{ minWidth: `${screenMinW}px` }} className="space-y-4">
      <div className="text-center text-3xl font-bold underline bg-cyan-500">書籍管理（一覧）</div>
      {books.map((book, i) => (
        <div key={book.book_id} className="flex border rounded shadow-sm ml-2 p-1 ">
          <div className="flex text-white bg-gray-400 w-9 align-top justify-end p-1"> {i + 1}</div>
          <div className="ml-2">
            <div>
              <span className="font-bold text-lg">『{book.title}』</span>
              <span>（{isbnHyphenate(book.isbn13) ?? isbnHyphen10(book.isbn10) ?? 'ISBN未登録'}）</span>
            </div>
            <div className="text-sm ml-2">
              {book.first_publish_year}年／{book.publisher}
              {book.publish_series ? `（${book.publish_series}）` : ''}
              {book.comic_f ? <span className=" text-green-500 ml-2">［コミック］</span> : ''}
            </div>
            <div className="mt-2">
              <ul className="grid grid-cols-5 gap-2 text-sm ml-2">
                {book.book_role?.map((r: any) => (
                  <li key={r.id}>
                    <span className="font-semibold">{r.role_master?.role_name}</span>：{r.person_name}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-2">
              <ul className="grid grid-cols-3 gap-2 text-sm ml-2">
                {book.book_possess?.map((p: any) => (
                  <li key={p.book_possess_id}>
                    <span className="font-semibold">{p.booktype_master?.booktype}</span>： {p.get_date} 取得
                    {p.dispose_date ? `、${p.dispose_date} 処分` : ''}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
      <div className="flex m-2 justify-around">
        <>
          <CommonButton
            label={
              <>
                <X size={20} />
                戻る (<u>B</u>)
              </>
            }
            variant="outline"
            onClick={handleBack}
          />
        </>
      </div>
    </div>
  );
}
