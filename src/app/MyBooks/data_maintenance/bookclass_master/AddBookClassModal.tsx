'use client';

import { useEffect, useRef, useState } from 'react';
import { supabaseClient } from '@/lib/Client';
import { Save, X } from 'lucide-react';
import { CommonButton } from '@/components/ui/button';
import { styleItems } from '@/app/constants';

export function AddBookClassModal({
  user,
  onClose,
  onSuccess
}: {
  user: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const supabase = supabaseClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bookclass_cd: '',
    bookclass: '',
    selectable: true
  });
  const insertData = {
    bookclass_cd: formData.bookclass_cd,
    bookclass: formData.bookclass,
    selectable: formData.selectable,
    user_id: user
  };

  // 画面マウント時のフォーカス用
  const firstInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.bookclass_cd || !formData.bookclass.trim()) {
      alert('必須項目が未入力です。');
      setLoading(false);
      return;
    }
    if (formData.bookclass_cd.trim().length !== 3 || !formData.bookclass_cd.match(/^[A-Za-z0-9]*$/)) {
      alert('分類コードは3桁の半角英数字で入力してください。');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('bookclass_master').insert([insertData]);
    setLoading(false);
    if (!error) {
      onSuccess();
    } else {
      if (error.code === '23505') {
        alert(`分類コード（${formData.bookclass_cd}）または分類名（${formData.bookclass}）が重複します。`);
      } else {
        console.error(error);
        alert(`登録失敗 code=${error.code} : ${error.message}`);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <div className="mb-2">
          <span className="text-xl font-bold text-blue-500 mr-2">書籍分類マスタ追加</span>（
          <span className="font-bold text-orange-500">オレンジ色</span>
          項目は空白不可）
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="mt-1 ml-2">
            <label htmlFor="bookclass_cd" className="inline-block font-bold text-orange-500 w-18">
              分類コード
            </label>
            <input
              id="bookclass_cd"
              className={styleItems}
              type="text"
              maxLength={3}
              size={3}
              required
              ref={firstInputRef}
              value={formData.bookclass_cd}
              onChange={(e) => setFormData({ ...formData, bookclass_cd: e.target.value })}
            />
            <span className="ml-2">(3桁の半角英数字)</span>
          </div>
          <div className="mt-1 ml-2">
            <label htmlFor="bookclass" className="inline-block font-bold text-orange-500 w-18">
              分 類 名
            </label>
            <input
              id="bookclass"
              className={styleItems}
              type="text"
              size={40}
              required
              value={formData.bookclass}
              onChange={(e) => setFormData({ ...formData, bookclass: e.target.value })}
            />
          </div>
          <div className="mt-1 ml-2">
            <label htmlFor="selectable" className="inline-block w-18">
              選択可
            </label>
            <input
              id="selectable"
              className="ml-2"
              type="checkbox"
              checked={formData.selectable}
              onChange={(e) => setFormData({ ...formData, selectable: e.target.checked })}
            />
            <span className="ml-2">(一覧選択する際の選択可否)</span>
          </div>
          <div className="flex justify-end gap-4">
            <CommonButton
              type="submit"
              label={
                <>
                  <Save size={20} />
                  {loading ? '保存中...' : '保存'}
                </>
              }
              variant="blue"
              disabled={loading}
            />
            <CommonButton
              label={
                <>
                  <X size={20} />
                  キャンセル
                </>
              }
              variant="outline"
              onClick={onClose}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
