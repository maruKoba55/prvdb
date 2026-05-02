'use client';

import { useEffect, useRef, useState } from 'react';
import { supabaseClient } from '@/lib/Client';
import { Save, X } from 'lucide-react';
import { CommonButton } from '@/components/ui/button';
import { styleItems } from '@/app/constants';

// 本日日付（ローカル）
const todayLocal = [
  new Date().getFullYear(),
  String(new Date().getMonth() + 1).padStart(2, '0'),
  String(new Date().getDate()).padStart(2, '0')
].join('-');

export function AddNoteModal({
  bookId,
  bookTitle,
  onClose,
  onSuccess
}: {
  bookId: number;
  bookTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const supabase = supabaseClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    read_st_date: todayLocal,
    read_ed_date: '',
    note: ''
  });
  const insertData = {
    book_id: bookId,
    read_st_date: formData.read_st_date,
    read_ed_date: formData.read_ed_date || null,
    note: formData.note
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

    if (!bookId) {
      alert('Missing book_id!');
      return;
    }

    if (!formData.read_st_date.trim()) {
      alert('必須項目が未入力です。');
      setLoading(false);
      return;
    }
    if (formData.read_ed_date && formData.read_ed_date < formData.read_st_date) {
      alert('読書終了を確認してください。');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('book_note').insert([insertData]);
    setLoading(false);
    if (!error) {
      onSuccess();
    } else {
      if (error.code === '23505') {
        alert(`『${bookTitle}』 ${formData.read_st_date}読書開始のノートは登録済みです。`);
      } else {
        console.error(error);
        alert(`登録失敗 code=${error.code} : ${error.message}`);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-xl">
        <div>
          <span className="text-xl font-bold text-blue-500 mr-2">読書ノート追加</span>（
          <span className="font-bold text-orange-500">オレンジ色</span>
          項目は空白不可）
        </div>
        <div className="flex items-center text-xl font-bold text-gray-500 mb-2">『{bookTitle}』</div>
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex items-center">
            <label className="inline-block w-16 font-bold text-orange-500">読書開始</label>
            <input
              type="date"
              required
              ref={firstInputRef}
              value={formData.read_st_date}
              className={styleItems}
              onChange={(e) => setFormData({ ...formData, read_st_date: e.target.value })}
            />
            <div className="ml-1">※不明の場合 ･･･ 1/1/1</div>
          </div>
          <div className="flex items-center">
            <label className="inline-block w-16">読書終了</label>
            <input
              type="date"
              min={formData.read_st_date || ''}
              className={styleItems}
              onChange={(e) => setFormData({ ...formData, read_ed_date: e.target.value })}
            />
            <div className="ml-1">※不明の場合 ･･･ 読書開始と同日</div>
          </div>
          <div>
            <label className="inline-block w-16 align-top text-justify">ノ ー ト</label>
            <textarea
              className={`{${styleItems} ml-2`}
              cols={67}
              rows={4}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
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
