'use client';

import { useState, useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSearchParams } from 'next/navigation';
import { supabaseClient } from '@/lib/Client';
import { LayersPlus, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { CommonButton } from '@/components/ui/button';
import { AddPublisherModal } from './AddPublisherModal';
import { PublisherList } from '@/utils/MyBooks/getPublisherList';
import { styleItems } from '@/app/constants';

export default function MaintePublisher() {
  const supabase = supabaseClient();
  const searchParams = useSearchParams();
  const user = searchParams.get('user');
  const [data, setData] = useState<PublisherList[]>([]);
  const [loading, setLoading] = useState(true);
  // 編集状態の管理
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<PublisherList | null>(null);
  const [extractCount, setExtractCount] = useState<number>(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // 各ボタンの処理
  // ［編集開始］
  const handleEdit = (item: PublisherList) => {
    setEditingId(item.id.toString());
    setEditForm({ ...item });
  };
  // ［編集キャンセル］
  const handleEditCancel = () => {
    setEditingId(null);
    setEditForm(null);
  };
  // ［編集内容を保存］
  const handleUpdate = async () => {
    if (!editForm) return;
    const trimmedReading = editForm.reading ? editForm.reading.trim() : '';
    const { error } = await supabase
      .from('publisher_list')
      .update({
        publisher: editForm.publisher.trim(),
        reading: trimmedReading === '' ? null : trimmedReading, // 空白の場合はnullにして読み順の最後に回す
        remarks: editForm.remarks ? editForm.remarks.trim() : null
      })
      .eq('id', editForm.id);
    if (!error) {
      setEditingId(null);
      setEditForm(null);
      fetchData();
    } else {
      if (error.code === '23505' && editForm) {
        alert(`出版社（${editForm.publisher ? editForm.publisher.trim() : ' '}）が重複します。`);
      } else {
        alert(`更新失敗 code=${error.code} : ${error.message}`);
      }
    }
  };
  // ［削除］
  const handleDelete = async (id: Number, publisher: string) => {
    if (!confirm(`［${publisher}］を削除しますか？`)) return;
    const { error } = await supabase.from('publisher_list').delete().eq('id', id);
    if (!error) {
      fetchData(); // 削除成功後、一覧を再取得
    } else {
      alert(`削除失敗 code=${error.code} : ${error.message}`);
    }
  };
  // ［出版社抽出］
  const handleExtract = async (extractCount: number) => {
    const { data, error } = await supabase.rpc('extract_publisher', {
      p_extract_count: (extractCount as number) || 1
    });
    if (!error) {
      alert('出版社リスト抽出完了');
      fetchData(); // 一覧を再取得
    } else {
      console.error(error);
      alert(`出版社リスト抽出失敗  code=${error.code} : ${error.message}`);
    }
  };
  // ［閉じる］
  const handleClose = () => {
    window.close();
  };
  useHotkeys('alt+c', (event) => {
    event.preventDefault(); // ブラウザのデフォルト挙動を防止
    handleClose(); // handlePrev内の「!isNextDisabled」判定が通る時だけ実行される
  });

  // データの取得
  const fetchData = async () => {
    setLoading(true);
    const { data: result, error } = await supabase
      .from('publisher_list')
      .select('id, publisher, reading, remarks')
      .order('reading', { ascending: true })
      .order('publisher', { ascending: true });
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
        <div className="text-xl font-bold text-blue-500 m-1">出版社リスト</div>
        {/* 画面中央の固定窓（高さ指定・スクロール） */}
        <div className="w-full max-w-3xl h-140 bg-white border border-gray-300 rounded shadow overflow-y-auto relative p-2">
          {loading ? (
            <div className="flex items-center justify-center h-full">読み込み中...</div>
          ) : (
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-gray-200 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="p-2 border-b">出版社名</th>
                  <th className="p-2 border-b">読　み</th>
                  <th className="p-2 border-b">備　考</th>
                  <th className="p-2 border-b text-center w-20">操 作</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => {
                  const isEditing = editingId === item.id.toString();
                  return (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        {isEditing ? (
                          <input
                            type="text"
                            required
                            className="border rounded p-1 w-full"
                            value={editForm?.publisher || ''}
                            onChange={(e) => setEditForm({ ...editForm!, publisher: e.target.value })}
                          />
                        ) : (
                          item.publisher
                        )}
                      </td>
                      <td className="p-2">
                        {isEditing ? (
                          <input
                            type="text"
                            className="border rounded p-1 w-full"
                            value={editForm?.reading || ''}
                            onChange={(e) => setEditForm({ ...editForm!, reading: e.target.value })}
                          />
                        ) : (
                          item.reading
                        )}
                      </td>
                      <td className="p-2">
                        {isEditing ? (
                          <input
                            type="text"
                            className="border rounded p-1 w-full"
                            value={editForm?.remarks || ''}
                            onChange={(e) => setEditForm({ ...editForm!, remarks: e.target.value })}
                          />
                        ) : (
                          item.remarks
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
                                onClick={() => handleDelete(item.id, item.publisher)}
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
          ※リストの追加・削除・変更は、
          <span className="font-bold text-red-500">トップページを更新したタイミングで選択肢に反映</span>されます。
        </div>
        <div className="flex mt-1 ml-2">※読みを登録した出版社は選択リストの上位に並びます。 </div>
      </div>
      <div className="flex items-center gap-2 mt-3 ml-10">
        <div>
          <CommonButton
            label={
              <>
                <LayersPlus size={20} /> 出版社抽出
              </>
            }
            variant="outline"
            onClick={() => handleExtract(extractCount)}
            disabled={editingId !== null} // 編集中の場合はdisable
          />
        </div>
        <div className="flex flex-col justify-center">
          <div className="flex items-center">
            <span>：書籍データから抽出してリストに追加（</span>
            <input
              id="extract_count"
              className={`${styleItems} flex w-14 text-end`}
              type="number"
              min={1}
              max={999}
              value={extractCount || ''}
              onChange={(e) => setExtractCount(Number(e.target.value))}
            />
            <span>件以上の書籍が登録されている出版社）</span>
          </div>
        </div>
      </div>
      <div className="flex w-full mt-3 ml-10">
        <div className="flex w-2/3 justify-start">
          <CommonButton
            label={
              <>
                <Plus size={20} /> 出版社個別追加
              </>
            }
            variant="orange"
            onClick={() => setIsAddModalOpen(true)}
            disabled={editingId !== null} // 編集中の場合はdisable
          />
        </div>
        <div className="flex w-1/3">
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
      {/* 出版社リスト追加 */}
      {isAddModalOpen && (
        <AddPublisherModal
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
