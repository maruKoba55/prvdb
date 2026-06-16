'use client';

import { useState, useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSearchParams } from 'next/navigation';
import { supabaseClient } from '@/lib/Client';
import { Pencil, Save, RefreshCw, Trash2, X } from 'lucide-react';
import { CommonButton } from '@/components/ui/button';
import { SystemConstant } from '@/utils/getSystemConstants';

export default function MainteSystemConstants({ constantAdd }: { constantAdd: boolean }) {
  const supabase = supabaseClient();
  const searchParams = useSearchParams();
  const user = searchParams.get('user');
  const [data, setData] = useState<SystemConstant[]>([]);
  const [loading, setLoading] = useState(true);
  // 編集状態の管理
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<SystemConstant | null>(null);

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
  const handleEdit = (item: SystemConstant) => {
    setEditingName(item.constant_name);
    setEditForm({ ...item });
  };
  // ［編集キャンセル］
  const handleEditCancel = () => {
    setEditingName(null);
    setEditForm(null);
  };
  // ［編集内容を保存］
  const handleUpdate = async () => {
    if (!editForm) return;
    const { error } = await supabase
      .from('system_constants')
      .update({
        constant_value: editForm.constant_value,
        remarks: editForm.remarks
      })
      .eq('constant_name', editForm.constant_name);
    if (!error) {
      setEditingName(null);
      setEditForm(null);
      fetchData();
    } else {
      alert(`更新失敗 code=${error.code} : ${error.message}`);
    }
  };

  // データの取得
  const fetchData = async () => {
    setLoading(true);
    const { data: result, error } = await supabase
      .from('system_constants')
      .select('constant_name, constant_type, constant_value, remarks')
      .order('constant_name', { ascending: true });
    if (error) {
      alert('データ取得エラー: ' + error.message);
    } else {
      setData(result || []);
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
        <div className="text-xl font-bold text-blue-500 m-1">システム定数</div>
        {constantAdd ? <div className="flex ml-4"> ※※ 不足していた定数を規定値で登録しました ※※</div> : ''}
        {/* 画面中央の固定窓（高さ指定・スクロール） */}
        <div className="w-full max-w-3xl h-88 bg-white border border-gray-300 rounded shadow overflow-y-auto relative p-2">
          {loading ? (
            <div className="flex items-center justify-center h-full">読み込み中...</div>
          ) : (
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-gray-200 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="p-2 border-b">定 数 名</th>
                  <th className="p-2 border-b">定 数 型</th>
                  <th className="p-2 border-b w-26">定数値</th>
                  <th className="p-2 border-b w-220">備　考</th>
                  <th className="p-2 border-b text-center w-20">操 作</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => {
                  const isEditing = editingName === item.constant_name;
                  return (
                    <tr key={item.constant_name} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-mono">{item.constant_name}</td>
                      <td className="p-2 font-mono">{item.constant_type}</td>
                      <td className="p-2">
                        {isEditing ? (
                          <input
                            type="text"
                            required
                            className="border p-1 rounded w-full"
                            value={editForm?.constant_value || ''}
                            onChange={(e) => setEditForm({ ...editForm!, constant_value: e.target.value })}
                          />
                        ) : (
                          item.constant_value
                        )}
                      </td>
                      <td className="p-2">
                        {isEditing ? (
                          <textarea
                            rows={3}
                            className="border p-1 rounded w-full"
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
                                <Pencil size={18} />
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
                    <td colSpan={5} className="p-4 text-center text-gray-500">
                      データがありません。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        <div className="flex mt-1 ml-2">
          ※定数値の変更は、トップページを更新したタイミングでシステムに反映されます。
        </div>
        <div className="flex mt-1 ml-2">※ 【開発者向け】システム定数の規定値は下記コード中に記述</div>
        <div className="flex ml-8">\app\MyBooks\data_maintenance\system_constants\page.tsx</div>
      </div>
      <div className="flex justify-around mt-3">
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
