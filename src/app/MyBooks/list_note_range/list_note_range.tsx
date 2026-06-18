'use client';

import { Fragment, useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSearchParams } from 'next/navigation';
import { supabaseClient } from '@/lib/Client';
import { Pencil, Save, X } from 'lucide-react';
import { CommonButton } from '@/components/ui/button';
import { useSystemConstant, useBookRoleMaster, useBookClassMaster, useBookFormMaster } from '@/context/AppContext';

type RangeNote = {
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
  bookclass_cd: string | null;
  role_cd: string | null;
  person_name: string | null;
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
  const s_bookclass_cd = searchParams.get('bookclass_cd');
  const s_bookform_cd = searchParams.get('bookform_cd');

  const [notes, setNotes] = useState<RangeNote[]>([]);
  const [loading, setLoading] = useState(true); // 読み込み状態を管理
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<RangeNote>>({});

  // システム変数、マスタ値取得（カスタムフック）
  const sqlLimit = parseInt(useSystemConstant('sqlLimit') as string) || 0;
  const supabaseMaxRows = parseInt(useSystemConstant('supabaseMaxRows') as string) || 0;
  const listAlert = parseInt(useSystemConstant('listAlert') as string) || 0;
  const bookRoleMaster = useBookRoleMaster();
  const bookClassMaster = useBookClassMaster();
  const bookFormMaster = useBookFormMaster();

  // 各ボタンの処理
  // ［閉じる］
  const handleClose = () => {
    window.close();
  };
  useHotkeys('alt+c', (event) => {
    event.preventDefault(); // ブラウザのデフォルト挙動を防止
    handleClose();
  });
  // ［編集開始］
  const handleEdit = (note: RangeNote) => {
    setEditingId(note.note_id);
    setEditForm(note);
  };
  // ［編集内容を保存］
  const handleUpdate = async (id: number) => {
    if (!editForm.read_st_date) {
      alert('読書開始を入力してください（不明時は 1/1/1）。');
      return;
    }
    if (editForm.read_st_date && editForm.read_ed_date) {
      if (new Date(editForm.read_st_date) > new Date(editForm.read_ed_date)) {
        alert('読書開始と終了が逆転しています。');
        return;
      }
    }
    const { error } = await supabase
      .from('book_note')
      .update({
        read_st_date: editForm.read_st_date,
        read_ed_date: editForm.read_ed_date || null,
        note: editForm.note
      })
      .eq('id', id);
    if (!error) {
      setEditingId(null);
      fetchNotes();
    } else {
      alert(`更新失敗 code=${error.code} : ${error.message}`);
    }
  };

  // データ取得
  //  ※page.tsx側で検索条件に合致するbook_noteのid配列を作成し、本モジュールで
  //    books、book_roleの項目を付加する方法も考えられる。
  //    しかし、親テーブル（books）を経由して子テーブル（book_role）の最初の1件を取得する
  //   （Limitをかける）ネストは、Supabase（PostgREST）の仕様上クライアント側では正確に
  //    動作せず、データベース関数（RPC） またはビュー（View）が必要になる。
  // 範囲日付の編集
  const dateMin = '0001-01-01'; // 日付最小値
  const dateMax = '9999-12-31'; // 日付最大値
  let dateFrom = dateMin;
  let dateTo = dateMax;
  if (s_read_st_from) dateFrom = s_read_st_from;
  if (s_read_st_to) dateTo = s_read_st_to;
  let dateTmp = new Date(dateTo); //to日付を画面指定の1日後として、lt（より前）で検索する
  dateTmp.setDate(dateTmp.getDate() + 1);
  dateTo = `${dateTmp.getFullYear()}-${dateTmp.getMonth() + 1}-${dateTmp.getDate()}`;
  const dateParts = dateTo.split('-'); // 先行ゼロが欠落した場合のパディング
  if (dateParts[0].length < 4 || dateParts[1].length < 2 || dateParts[2].length < 2) {
    const yyyy = dateParts[0].padStart(4, '0');
    const mm = dateParts[1].padStart(2, '0');
    const dd = dateParts[2].padStart(2, '0');
    dateTo = `${yyyy}-${mm}-${dd}`;
  }
  // RPCに渡す検索最大件数
  let dbSearchMax = 0;
  if (sqlLimit === 0) {
    dbSearchMax = supabaseMaxRows;
  } else if (supabaseMaxRows === 0) {
    dbSearchMax = sqlLimit;
  } else if (sqlLimit < supabaseMaxRows) {
    dbSearchMax = sqlLimit;
  } else {
    dbSearchMax = supabaseMaxRows;
  }

  const fetchNotes = async () => {
    setLoading(true);
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
      p_bookclass_cd: (s_bookclass_cd as string) || null,
      p_bookform_cd: (s_bookform_cd as string) || null,
      p_select_limit: (dbSearchMax as number) || 9999
    });
    if (error) console.error(error);
    else {
      setNotes(data || []);
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchNotes();
  }, []);

  //初期表示件数確認
  useEffect(() => {
    if (!loading && notes.length === 0) {
      alert('該当するノートがありません。');
      window.close();
      return;
    }
    if (listAlert > 0 && notes.length > listAlert) {
      const confirmed = window.confirm(`該当ノート${notes.length}件。時間のかかる場合がありますが続けますか？`);
      if (!confirmed) {
        window.close();
        return;
      }
    }
  }, [loading, notes]);

  // 見出し文字の編集
  //  書籍分類／書籍形態
  let subTitle1 = null;
  let subTitle2 = null;
  if (s_bookclass_cd) {
    subTitle1 = bookClassMaster.find((item: any) => item.bookclass_cd === s_bookclass_cd)?.bookclass || null;
  }
  if (s_bookform_cd) {
    subTitle2 = bookFormMaster.find((item: any) => item.bookform_cd === s_bookform_cd)?.bookform || null;
    if (subTitle1) {
      subTitle1 = subTitle1 + '／' + subTitle2;
    } else {
      subTitle1 = subTitle2;
    }
  }
  if (subTitle1) {
    subTitle1 = `【${subTitle1}】`;
  }
  //  読書開始日 From～To
  subTitle2 = null;
  if (s_read_st_from != dateMin) {
    subTitle2 = s_read_st_from + '～';
  }
  if (s_read_st_to != dateMax) {
    if (subTitle2) {
      subTitle2 = subTitle2 + s_read_st_to;
    } else {
      subTitle2 = '～' + s_read_st_to;
    }
  }

  const screenMinW = 800;

  return (
    <div style={{ minWidth: `${screenMinW}px` }} className="w-full">
      <div
        style={{ width: `${screenMinW + 8}px` }}
        className="text-center text-3xl font-bold underline bg-cyan-500 mx-2"
      >
        書籍管理（ノート一覧）
      </div>
      <div style={{ width: `${screenMinW}px` }} className="border-solid border-2 rounded-lg flex m-2 p-2">
        <div className="mb-1">
          <div className="flex justify-end mr-2">
            {subTitle1} {subTitle2}
          </div>
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full table-fixed text-left text-sm">
              {/* 列幅を固定 */}
              <colgroup>
                <col className="w-9" />
                <col className="w-30" />
                <col className="w-30" />
                <col className="w-2/3" />
                <col className="w-1/10" />
              </colgroup>
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th colSpan={5} className="p-1 font-bold text-blue-600">
                    <span className="text-white bg-gray-400 p-1">No.</span>
                    <span> 『 書 名 』　著者等 （出版社／出版シリーズ、初版年）</span>
                    <span className=" text-green-500 p-1 ml-2">［書籍分類］</span>
                  </th>
                </tr>
                <tr>
                  <th className="flex-col p-1"> </th>
                  <th className="flex-col p-1">読書開始</th>
                  <th className="flex-col p-1">読書終了</th>
                  <th className="flex-col text-left p-1">ノ ー ト</th>
                  <th className="flex-col text-center p-1">操作</th>
                </tr>
              </thead>
              <tbody>
                {notes.map((note, i) => (
                  <Fragment key={note.note_id}>
                    <tr className="border-t hover:bg-gray-50">
                      <td colSpan={5}>
                        <div className="flex">
                          <div className="flex text-white bg-gray-400 min-w-9 align-top justify-end p-1"> {i + 1}</div>
                          <div className="p-1 font-bold text-blue-600">
                            『{note.title}』
                            {note.role_cd && note.person_name
                              ? `　${bookRoleMaster.find((item: any) => item.role_cd === note.role_cd)?.role_name || null}：${note.person_name.replace(/\s+/g, '')}`
                              : ''}
                            （{note.publisher}
                            {note.publish_series ? `／${note.publish_series}` : ''}、{note.first_publish_year}）
                            {note.bookclass_cd ? (
                              <span className=" text-green-500 p-1 ml-2">
                                ［
                                {bookClassMaster.find((item: any) => item.bookclass_cd === note.bookclass_cd)
                                  ?.bookclass || null}
                                ］
                              </span>
                            ) : (
                              ''
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      {editingId === note.note_id ? (
                        <>
                          <td className="p-1"></td>
                          <td className="p-1">
                            <input
                              type="date"
                              required
                              className="border p-1 rounded w-full"
                              value={editForm.read_st_date || ''}
                              onChange={(e) => setEditForm({ ...editForm, read_st_date: e.target.value })}
                            />
                          </td>
                          <td className="p-1">
                            <input
                              type="date"
                              className="border p-1 rounded w-full"
                              value={editForm.read_ed_date || ''}
                              min={editForm.read_st_date || ''}
                              onChange={(e) => setEditForm({ ...editForm, read_ed_date: e.target.value })}
                            />
                          </td>
                          <td className="p-1">
                            <textarea
                              rows={4}
                              className="border p-1 rounded w-full"
                              value={editForm.note || ''}
                              onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                            />
                          </td>
                          <td className="p-2 text-center align-middle">
                            <div className="flex gap-3 justify-center items-center h-full min-h-[40px]">
                              <button
                                onClick={() => handleUpdate(note.note_id)}
                                className="text-green-600 hover:text-green-800"
                                title="編集内容を保存"
                              >
                                <Save size={20} />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="text-gray-500 hover:text-gray-700"
                                title="編集内容を破棄"
                              >
                                <X size={20} />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-1"></td>
                          <td className="p-1">{note.read_st_date}</td>
                          <td className="p-1">{note.read_ed_date}</td>
                          <td className="p-1 whitespace-pre-wrap break-words">{note.note}</td>
                          <td className="p-2 text-center align-middle">
                            <div className="flex gap-3 justify-center items-center h-full min-h-[40px]">
                              <button
                                onClick={() => handleEdit(note)}
                                className="text-blue-600 hover:text-blue-800"
                                title="編集"
                              >
                                <Pencil size={20} />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
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
          disabled={editingId !== null} // 編集中の場合はdisable
        />
      </div>
    </div>
  );
}
