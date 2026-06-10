'use client';

import { useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSearchParams } from 'next/navigation';
import { supabaseClient } from '@/lib/Client';
import { Pencil, Save, X, Plus, Trash2 } from 'lucide-react';
import { CommonButton } from '@/components/ui/button';
import { AddNoteModal } from './AddNoteModal';
import { useSystemConstant, useBookRoleMaster } from '@/context/AppContext';

type BookNote = {
  id: number;
  book_id: number;
  read_st_date: string | null;
  read_ed_date: string | null;
  note: string | null;
  user_id: string | null;
};

export default function ListNoteBook() {
  const supabase = supabaseClient();
  const searchParams = useSearchParams();
  const bookId = searchParams.get('book_id');
  const bookTitle = searchParams.get('title');
  const roleCd = searchParams.get('role_cd');
  const personName = searchParams.get('person_name');
  const user = searchParams.get('user');

  const [notes, setNotes] = useState<BookNote[]>([]);
  const [Loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<BookNote>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
  const handleEdit = (note: BookNote) => {
    setEditingId(note.id);
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
  // ［削除］
  const handleDelete = async (id: number, read_st_date: string | null) => {
    if (!confirm(`『${bookTitle}』${read_st_date}のノートを削除しますか？`)) return;
    const { error } = await supabase.from('book_note').delete().eq('id', id);
    if (!error) {
      fetchNotes(); // 削除成功後、一覧を再取得
    } else {
      alert(`削除失敗 code=${error.code} : ${error.message}`);
    }
  };

  // システム変数取得（カスタムフック）
  const sqlLimit = (useSystemConstant('sqlLimit') as number) ?? 0;
  const listAlert = (useSystemConstant('listAlert') as number) ?? 0;
  const bookRoleMaster = useBookRoleMaster();

  // データ取得
  const fetchNotes = async () => {
    setLoading(true);
    let query = supabase.from('book_note').select('*').eq('book_id', bookId).order('read_st_date', { ascending: true });
    if (sqlLimit) query = query.limit(sqlLimit);
    const { data, error } = await query;
    if (error) console.error(error);
    else setNotes(data || []);
    setLoading(false);
  };
  useEffect(() => {
    if (bookId) {
      fetchNotes();
    }
  }, [bookId]);

  //初期表示件数確認
  useEffect(() => {
    if (Loading) return;
    if (notes.length === 0) {
      alert(`『${bookTitle}』にはノートが登録されていません。`);
    }
    if (listAlert > 0 && notes.length > listAlert) {
      const confirmed = window.confirm(
        `『${bookTitle}』にはノートが${notes.length}件あります。時間のかかる場合がありますが続けますか？`
      );
      if (!confirmed) {
        window.close();
        return;
      }
    }
  }, [notes, Loading]);
  if (Loading) {
    return <p>読み込み中...</p>;
  }

  const screenMinW = 800;

  return (
    <div style={{ minWidth: `${screenMinW}px` }} className="w-full">
      <div
        style={{ width: `${screenMinW + 8}px` }}
        className="text-center text-3xl font-bold underline bg-cyan-500 mx-2"
      >
        書籍管理（ノート）
      </div>
      <div style={{ width: `${screenMinW}px` }} className="border-solid border-2 rounded-lg flex m-2 p-2">
        <div>
          <div className="font-bold text-gray-500 ml-3 mb-4">
            <span className="text-xl"> 『{bookTitle}』</span>
            <span>
              {roleCd && personName
                ? `　${bookRoleMaster.find((item: any) => item.role_cd === roleCd)?.role_name || null}：${personName.replace(/\s+/g, '')}`
                : ''}
            </span>
          </div>
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full table-fixed text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="flex-col text-center w-30 p-2">読書開始</th>
                  <th className="flex-col text-center w-30 p-2">読書終了</th>
                  <th className="flex-col text-left w-2/3 p-2">ノ ー ト</th>
                  <th className="flex-col text-center w-1/10 p-2">操 作</th>
                </tr>
              </thead>
              <tbody>
                {notes.map((note) => (
                  <tr key={note.id} className="border-b hover:bg-gray-50">
                    {editingId === note.id ? (
                      <>
                        <td className="p-2">
                          <input
                            type="date"
                            required
                            className="border p-1 rounded w-full"
                            value={editForm.read_st_date || ''}
                            onChange={(e) => setEditForm({ ...editForm, read_st_date: e.target.value })}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="date"
                            className="border p-1 rounded w-full"
                            value={editForm.read_ed_date || ''}
                            min={editForm.read_st_date || ''}
                            onChange={(e) => setEditForm({ ...editForm, read_ed_date: e.target.value })}
                          />
                        </td>
                        <td className="p-2">
                          <textarea
                            rows={4}
                            className="border p-1 rounded w-full"
                            value={editForm.note || ''}
                            onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                          />
                        </td>
                        <td className="p-2 flex gap-2">
                          <button
                            onClick={() => handleUpdate(note.id)}
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
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="flex-col text-center p-2">{note.read_st_date}</td>
                        <td className="flex-col text-center p-2">{note.read_ed_date}</td>
                        <td className="flex-col text-left p-2 whitespace-pre-wrap break-words">{note.note}</td>
                        <td className="p-2">
                          <div className="flex gap-3 justify-center">
                            <button
                              onClick={() => handleEdit(note)}
                              className="text-blue-600 hover:text-blue-800"
                              title="編集"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(note.id, note.read_st_date)}
                              className="text-red-600 hover:text-red-800"
                              title="削除"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
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
              <Plus size={20} /> ノート追加
            </>
          }
          variant="blue"
          onClick={() => setIsAddModalOpen(true)}
          disabled={editingId !== null} // 編集中の場合はdisable
        />
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
      {/* 読書ノート追加 */}
      {isAddModalOpen && (
        <AddNoteModal
          bookId={Number(bookId) || 0}
          bookTitle={bookTitle || ''}
          user={user || ''}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            setIsAddModalOpen(false);
            fetchNotes();
          }}
        />
      )}
    </div>
  );
}
