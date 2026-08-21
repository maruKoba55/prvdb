'use client';

import { useEffect, useRef, useState } from 'react';
import { supabaseClient } from '@/lib/Client';
import { Save, X } from 'lucide-react';
import { CommonButton } from '@/components/ui/button';
import { styleItems } from '@/app/constants';

export function AddBookPublisherModal({
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
    publisher: '',
    reading: '',
    remarks: ''
  });
  const insertData = {
    publisher: formData.publisher.trim(),
    reading: formData.reading.trim() || null, // 空白の場合はnullにして読み順の後ろに回す
    remarks: formData.remarks.trim(),
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

    if (!formData.publisher.trim()) {
      alert('必須項目が未入力です。');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('book_publisher_list').insert([insertData]);
    setLoading(false);
    if (!error) {
      onSuccess();
    } else {
      if (error.code === '23505') {
        alert(`出版社名（${insertData.publisher}）が重複します。`);
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
          <span className="text-xl font-bold text-blue-500 mr-2">出版社リスト追加</span>（
          <span className="font-bold text-orange-500">オレンジ色</span>
          項目は空白不可）
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center mt-1 ml-2">
            <label htmlFor="publisher" className="inline-block font-bold text-orange-500 w-18">
              出版社名
            </label>
            <input
              id="publisher"
              className={styleItems}
              type="text"
              size={40}
              required
              value={formData.publisher}
              onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
            />
          </div>
          <div className="flex items-center mt-1 ml-2">
            <label htmlFor="reading" className="inline-block w-17 ml-1">
              読　み
            </label>
            <input
              id="reading"
              className={styleItems}
              type="text"
              size={40}
              onChange={(e) => setFormData({ ...formData, reading: e.target.value })}
            />
          </div>
          <div className="flex items-center mt-1 ml-2">
            <label htmlFor="remarks" className="inline-block w-17 ml-1">
              備　考
            </label>
            <input
              id="remarks"
              className={styleItems}
              type="text"
              size={40}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            />
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
