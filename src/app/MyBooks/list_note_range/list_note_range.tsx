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
  note_id: number;
  book_id: number;
  read_st_date: string | null;
  read_ed_date: string | null;
  note: string | null;
  isbn13: string | null;
  title: string | null;
  publisher: string | null;
  publish_series: string | null;
  first_publish_year: number;
  comic_f: boolean;
};

export default function ListNoteRange() {
  const supabase = supabaseClient();
  const searchParams = useSearchParams();
  const s_read_st_from = searchParams.get('read_st_from');
  const s_read_st_to = searchParams.get('read_st_to');
  const s_isbn13 = searchParams.get('isbn13');
  const s_title = searchParams.get('title');
  const s_title_search_type = searchParams.get('title_search_type');
  const s_publisher = searchParams.get('publisher');
  const s_publish_series = searchParams.get('publish_series');
  const s_role_cd = searchParams.get('role_cd');
  const s_person_name = searchParams.get('person_name');
  const s_person_search_type = searchParams.get('person_search_type');
  const s_booktype_cd = searchParams.get('booktype_cd');
  const s_limit_comic = searchParams.get('limit_comic');
  const [notes, setNotes] = useState<BookNote[]>([]);

  // 書籍種別が指定された時、種別名を取得
  const [getBookType, setGetBookType] = useState(null);
  useEffect(() => {
    const fetchBookType = async () => {
      if (s_booktype_cd) {
        const { data, error } = await supabase
          .from('booktype_master')
          .select('booktype')
          .eq('booktype_cd', s_booktype_cd)
          .single();
        if (!error && data) {
          setGetBookType(data.booktype);
        } else {
          console.error(error);
        }
      }
    };
    fetchBookType();
  }, []);

  //一覧タイトル追加文字
  let titleAdd = null;
  if (s_booktype_cd) {
    titleAdd = getBookType;
  }
  if (s_limit_comic !== 'noLimit') {
    if (s_limit_comic === 'comic') {
      if (titleAdd) {
        titleAdd = titleAdd + '／コミック';
      } else {
        titleAdd = 'コミック';
      }
    } else if (s_limit_comic === 'nonComic') {
      if (titleAdd) {
        titleAdd = titleAdd + '／非コミック';
      } else {
        titleAdd = '非コミック';
      }
    }
  }

  // データ取得
  let dateFrom = '0001-01-01'; // 日付最小値
  let dateTo = '9999-12-31'; // 日付最大値
  if (s_read_st_from) dateFrom = s_read_st_from;
  if (s_read_st_to) dateTo = s_read_st_to;
  let dateTmp = new Date(dateTo); //to日付を画面指定の1日後として、lt（より前）で検索する
  dateTmp.setDate(dateTmp.getDate() + 1);
  dateTo = `${dateTmp.getFullYear()}-${dateTmp.getMonth() + 1}-${dateTmp.getDate()}`;
  const fetchNotes = async () => {
    const { data, error } = await supabase.rpc('search_note_range', {
      p_read_st_from: dateFrom as string,
      p_read_st_to: dateTo as string,
      p_isbn13: (s_isbn13 as string) || null,
      p_title: (s_title as string) || null,
      p_title_search_type: (s_title_search_type as string) || 'top',
      p_publisher: (s_publisher as string) || null,
      p_publish_series: (s_publish_series as string) || null,
      p_role_cd: (s_role_cd as string) || null,
      p_person_name: (s_person_name as string) || null,
      p_person_search_type: (s_person_search_type as string) || 'top',
      p_booktype_cd: (s_booktype_cd as string) || null,
      p_limit_comic: (s_limit_comic as string) || 'noLimit',
      p_select_limit: (bookSearchMax as number) || 9999
    });
    if (error) console.error(error);
    else {
      setNotes(data || []);
      if (!data[0]) {
        alert('該当データがありません');
        window.close();
        return;
      }
    }
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
            （{s_read_st_from} ～ {s_read_st_to}
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
                    タイトル（出版社／出版シリーズ、初版年）
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
                  <Fragment key={note.note_id}>
                    <tr className="border-t hover:bg-gray-50">
                      <td colSpan={3} className="p-1 font-bold text-blue-600">
                        『{note.title}』（{note.publisher} {note.publish_series ? `／${note.publish_series}` : ''}、
                        {note.first_publish_year}）
                        {note.comic_f ? <span className=" text-green-500 ml-2">［コミック］</span> : ''}
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
