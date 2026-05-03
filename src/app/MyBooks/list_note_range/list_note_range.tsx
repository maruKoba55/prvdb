'use client';

import { Fragment, useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSearchParams } from 'next/navigation';
import { supabaseClient } from '@/lib/Client';
import { X } from 'lucide-react';
import { CommonButton } from '@/components/ui/button';
import { bookSearchMax } from '@/app/constants';

const screenMinW = 800;

type BookNote = {
  id: number;
  book_id: number;
  read_st_date: string | null;
  read_ed_date: string | null;
  note: string | null;
  books: {
    title: string;
    publisher: string;
    first_publish_year: number;
    comic_f: boolean;
  } | null;
};

export default function ListNoteRange() {
  const supabase = supabaseClient();
  const searchParams = useSearchParams();
  const read_st_from = searchParams.get('read_st_from');
  const read_st_to = searchParams.get('read_st_to');
  const noteLimitComic = searchParams.get('noteLimitComic');
  const [notes, setNotes] = useState<BookNote[]>([]);

  //一覧タイトル追加文字
  let titleAdd = null;
  if (noteLimitComic === 'comic') {
    titleAdd = 'コミック';
  } else {
    if (noteLimitComic === 'nonComic') {
      titleAdd = '非コミック';
    }
  }

  // データ取得
  let dateFrom = '0001-01-01'; // 日付最小値
  let dateTo = '9999-12-31'; // 日付最大値
  if (read_st_from) dateFrom = read_st_from;
  if (read_st_to) dateTo = read_st_to;
  let dateTmp = new Date(dateTo); //to日付を画面指定の1日後として、lt（より前）で検索する
  dateTmp.setDate(dateTmp.getDate() + 1);
  dateTo = `${dateTmp.getFullYear()}-${dateTmp.getMonth() + 1}-${dateTmp.getDate()}`;
  let query = supabase.from('book_note').select(`
    *, books!inner(title, publisher, first_publish_year,comic_f)`);
  query = query.gte('read_st_date', dateFrom);
  query = query.lt('read_st_date', dateTo);
  if (noteLimitComic === 'comic') {
    query = query.eq('books.comic_f', true);
  } else {
    if (noteLimitComic === 'nonComic') {
      query = query.eq('books.comic_f', false);
    }
  }
  query = query.order('read_st_date', { ascending: true });
  if (bookSearchMax) query = query.limit(bookSearchMax);
  const fetchNotes = async () => {
    const { data, error } = await query;
    if (error) console.error(error);
    else setNotes(data || []);
  };
  useEffect(() => {
    fetchNotes();
  }, []);

  // 各ボタンの処理
  // ［閉じる］
  const handleClose = () => {
    window.close();
  };
  useHotkeys('alt+c', (event) => {
    event.preventDefault(); // ブラウザのデフォルト挙動を防止
    handleClose();
  });

  return (
    <div style={{ minWidth: `${screenMinW}px` }} className="w-full">
      <div style={{ width: `${screenMinW + 8}px` }} className="text-center text-3xl font-bold underline bg-cyan-500">
        書籍管理
      </div>
      <div style={{ width: `${screenMinW - 8}px` }} className="border-solid border-2 rounded-lg flex m-4 p-2">
        <div className="mb-4">
          <span className="text-xl font-bold text-blue-500 m-1">読書ノート</span>
          <span>
            （{read_st_from} ～ {read_st_to}
            {titleAdd ? `／${titleAdd}` : ''}）
          </span>

          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full table-fixed text-left text-sm">
              {/* 列幅を固定 */}
              <colgroup>
                <col className="w-22" />
                <col className="w-22" />
                <col className="" />
              </colgroup>
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th colSpan={3} className="p-1">
                    タイトル（出版社、初版年）
                  </th>
                </tr>
                <tr>
                  <th className="p-1">読書開始</th>
                  <th className="p-1">読書終了</th>
                  <th className="p-1">ノート</th>
                </tr>
              </thead>
              <tbody>
                {notes.map((note) => (
                  <Fragment key={note.id}>
                    <tr className="border-t hover:bg-gray-50">
                      <td colSpan={3} className="p-1 font-bold text-blue-600">
                        『{note.books?.title}』（{note.books?.publisher}、{note.books?.first_publish_year}）
                      </td>
                    </tr>
                    <tr>
                      <td className="p-1">{note.read_st_date}</td>
                      <td className="p-1">{note.read_ed_date}</td>
                      <td className="p-1 whitespace-pre-wrap break-words">{note.note}</td>
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ボタンエリア */}
      <div className="flex m-2 justify-around">
        <CommonButton
          label={
            <>
              <X size={20} />
              閉じる (<u>C</u>)
            </>
          }
          variant="outline"
          onClick={handleClose}
        />
      </div>
    </div>
  );
}
