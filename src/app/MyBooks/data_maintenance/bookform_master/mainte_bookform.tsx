'use client';

import { useState, useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSearchParams } from 'next/navigation';
import { supabaseClient } from '@/lib/Client';
import { Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { CommonButton } from '@/components/ui/button';
import { AddBookFormModal } from './AddBookFormModal';
import { BookFormMaster } from '@/utils/getBookForm';

export default function MainteBookForm() {
  const supabase = supabaseClient();
  const searchParams = useSearchParams();
  const user = searchParams.get('user');
  const [data, setData] = useState<BookFormMaster[]>([]);
  const [loading, setLoading] = useState(true);
  // 編集状態の管理
  const [editingCd, setEditingCd] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<BookFormMaster | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // 各ボタンの処理
  // ［閉じる］
  const handleClose = () => {
    window.close();
  };
  useHotkeys('alt+c', (event) => {
    event.preventDefault(); // ブラウザのデフォルト挙動を防止
    handleClose(); // handlePrev内の「!isNextDisabled」判定が通る時だけ実行される
  });
  // ［編集開始］
  const handleEdit = (item: BookFormMaster) => {
    setEditingCd(item.bookform_cd);
    setEditForm({ ...item });
  };
  // ［編集キャンセル］
  const handleEditCancel = () => {
    setEditingCd(null);
    setEditForm(null);
  };
  // ［編集内容を保存］
  const handleUpdate = async () => {
    if (!editForm) return;
    const handlePostUpdate = (error: any) => {
      if (!error) {
        setEditingCd(null);
        setEditForm(null);
        fetchData();
      } else {
        if (error.code === '23505') {
          alert(`形態コード（${editForm.bookform_cd}）または形態名（${editForm.bookform}）が重複します。`);
        } else {
          alert(`更新失敗 code=${error.code} : ${error.message}`);
        }
      }
    };
    if (editForm.bookform_cd !== editingCd) {
      // 形態コードの変更あり；(RPC)変更後マスタ追加⇒書籍データ書換え⇒変更前マスタ削除
      if (editForm.bookform_cd.trim().length !== 3 || !editForm.bookform_cd.match(/^[A-Za-z0-9]*$/)) {
        alert('形態コードは3桁の半角英数字で入力してください。');
        setLoading(false);
        return;
      }
      const { count, error: countError } = await supabase
        .from('books')
        .select(
          `
          book_id,
          book_possess!inner(bookform_cd)
          `,
          { count: 'exact', head: true }
        )
        .eq('book_possess.bookform_cd', editingCd);
      if (countError) {
        alert(`形態更新件数取得失敗 code=${countError.code} : ${countError.message}`);
        return;
      }
      if (count && count > 0) {
        if (!confirm(`変更対象の形態を使用している書籍データ(${count}件)を併せて更新します。`)) return;
      }
      const { error } = await supabase.rpc('update_bookform_cd', {
        old_cd: editingCd,
        new_cd: editForm.bookform_cd,
        new_name: editForm.bookform,
        new_selectable: editForm.selectable
      });
      handlePostUpdate(error);
    } else {
      // 形態コードの変更なし；該当マスタ更新
      const { error } = await supabase
        .from('bookform_master')
        .update({
          bookform: editForm.bookform,
          selectable: editForm.selectable
        })
        .eq('bookform_cd', editForm.bookform_cd);
      handlePostUpdate(error);
    }
  };
  // ［削除］
  const handleDelete = async (bookform_cd: string, bookform: string) => {
    if (!confirm(`形態［${bookform_cd}：${bookform}］を削除しますか？`)) return;
    const { error } = await supabase.from('bookform_master').delete().eq('bookform_cd', bookform_cd);
    if (!error) {
      fetchData(); // 削除成功後、一覧を再取得
    } else {
      if (error.code === '23503') {
        alert(`形態［${bookform}］を使用している書籍が存在するため削除できません。`);
      } else {
        alert(`削除失敗 code=${error.code} : ${error.message}`);
      }
    }
  };

  // データの取得
  const fetchData = async () => {
    setLoading(true);
    const { data: result, error } = await supabase
      .from('bookform_master')
      .select('bookform_cd, bookform, selectable')
      .order('bookform_cd', { ascending: true });
    if (!error) {
      setData(result || []);
    } else {
      alert(`データ取得失敗 code=${error.code} : ${error.message}`);
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <div className="text-center text-3xl font-bold underline bg-cyan-500">書籍管理／データメンテナンス</div>
      <div className="flex flex-col border-solid border-2 rounded-lg m-3 p-1">
        <div className="text-xl font-bold text-blue-500 m-1">書籍形態マスタ</div>
        {/* 画面中央の固定窓（高さ指定・スクロール） */}
        <div className="w-full max-w-3xl h-140 bg-white border border-gray-300 rounded shadow overflow-y-auto relative p-2">
          {loading ? (
            <div className="flex items-center justify-center h-full">読み込み中...</div>
          ) : (
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-gray-200 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="p-2 border-b text-center w-20">形態コード</th>
                  <th className="p-2 border-b">形 態 名</th>
                  <th className="p-2 border-b text-center w-20">選択可</th>
                  <th className="p-2 border-b text-center w-20">操 作</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => {
                  const isEditing = editingCd === item.bookform_cd;
                  return (
                    <tr key={item.bookform_cd} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-mono text-center">
                        {isEditing ? (
                          <input
                            type="text"
                            maxLength={3}
                            required
                            className="border rounded p-1 text-center w-full"
                            value={editForm?.bookform_cd || ''}
                            onChange={(e) => setEditForm({ ...editForm!, bookform_cd: e.target.value })}
                          />
                        ) : (
                          item.bookform_cd
                        )}
                      </td>
                      <td className="p-2">
                        {isEditing ? (
                          <input
                            type="text"
                            required
                            className="border rounded p-1 w-full"
                            value={editForm?.bookform || ''}
                            onChange={(e) => setEditForm({ ...editForm!, bookform: e.target.value })}
                          />
                        ) : (
                          item.bookform
                        )}
                      </td>
                      <td className="p-2 text-center">
                        {isEditing ? (
                          <input
                            type="checkbox"
                            className="w-4 h-4"
                            checked={editForm?.selectable || false}
                            onChange={(e) => setEditForm({ ...editForm!, selectable: e.target.checked })}
                          />
                        ) : (
                          <span className={item.selectable ? 'text-green-600 font-bold' : 'text-gray-400'}>
                            {item.selectable ? '○' : '×'}
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-center align-middle">
                        <div className="flex gap-3 justify-center items-center h-full min-h-[40px]">
                          {isEditing ? (
                            <>
                              <button
                                onClick={handleUpdate}
                                className="text-green-600 hover:text-green-800"
                                title="編集内容を保存"
                              >
                                <Save size={20} />
                              </button>
                              <button
                                onClick={handleEditCancel}
                                className="text-gray-500 hover:text-gray-700"
                                title="編集内容を破棄"
                              >
                                <X size={20} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEdit(item)}
                                className="text-blue-600 hover:text-blue-800"
                                title="編集"
                              >
                                <Pencil size={20} />
                              </button>
                              <button
                                onClick={() => handleDelete(item.bookform_cd, item.bookform)}
                                className="text-red-600 hover:text-red-800"
                                title="削除"
                              >
                                <Trash2 size={20} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">
                      データがありません。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        <div className="flex mt-1 ml-2">
          ※形態の追加・削除・変更は、
          <span className="font-bold text-red-500">トップページを更新したタイミングで選択肢に反映</span>されます。
        </div>
        <div className="flex ml-2">※書籍に付与している形態の変更は慎重に行ってください。</div>
        <div className="flex ml-6">
          特にコードの変更は書籍データの一括更新を伴うため、事前のデータ保存を推奨します。
        </div>
      </div>
      <div className="flex justify-around mt-3">
        <CommonButton
          label={
            <>
              <Plus size={20} /> 形態追加
            </>
          }
          variant="orange"
          onClick={() => setIsAddModalOpen(true)}
          disabled={editingCd !== null} // 編集中の場合はdisable
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
          disabled={editingCd !== null} // 編集中の場合はdisable
        />
      </div>
      {/* 書籍形態マスタ追加 */}
      {isAddModalOpen && (
        <AddBookFormModal
          user={user || ''}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            setIsAddModalOpen(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
