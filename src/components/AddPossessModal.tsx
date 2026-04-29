'use client';

import { useEffect, useRef, useState } from 'react';
import { supabaseClient } from '@/lib/Client';
import { Save, X } from 'lucide-react';
import { CommonButton } from '@/components/ui/button';
import { styleItems } from '@/app/constants';
import Image from 'next/image';

type BookTypeMaster = {
  booktype_cd: string;
  booktype: string;
  selectable: boolean;
};

// 本日日付（ローカル）
const todayLocal = [
  new Date().getFullYear(),
  String(new Date().getMonth() + 1).padStart(2, '0'),
  String(new Date().getDate()).padStart(2, '0')
].join('-');

export function AddPossessModal({
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
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    booktype_cd: '',
    get_date: '',
    dispose_date: '',
    remarks: '',
    image_url: '',
    urlUp_f: false
  });
  const insertData = {
    book_id: bookId,
    booktype_cd: formData.booktype_cd,
    get_date: formData.get_date || null,
    dispose_date: formData.dispose_date || null,
    remarks: formData.remarks,
    image_url: formData.image_url
  };

  // 画面マウント時のフォーカス用(書籍種別セレクトに当てるため、HTMLSelectElement)
  const firstInputRef = useRef<HTMLSelectElement>(null);
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

    if (!formData.booktype_cd || !formData.get_date.trim()) {
      alert('必須項目が未入力です。');
      setLoading(false);
      return;
    }
    if (formData.dispose_date && formData.dispose_date < formData.get_date) {
      alert('処分日を確認してください。');
      setLoading(false);
      return;
    }

    const { error } = await supabaseClient.from('book_possess').insert([insertData]);
    setLoading(false);
    if (!error) {
      if (formData.urlUp_f) {
        await updateBookImageUrl();
      }
      onSuccess();
    } else {
      if (error.code === '23505') {
        alert(`『${bookTitle}』に登録済みの保有情報です。`);
      } else {
        console.error(error);
        alert(`登録失敗 code=${error.code} : ${error.message}`);
      }
    }
  };

  // 書影表示用：image_url入力確定時にpreviewUrlを更新
  // 画像取得403エラー回避のため、プロキシAPIを経由する
  const [previewUrl, setPreviewUrl] = useState(formData.image_url);
  const handleBlur = () => {
    setPreviewUrl(`/api/proxy?url=${encodeURIComponent(formData.image_url.trim())}`);
  };

  // 汎用的な入力変更ハンドラ
  // チェックボックスの場合はchecked、それ以外はvalueを格納
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  // 書影URLを Table 'books' に反映
  const updateBookImageUrl = async () => {
    const { error } = await supabaseClient
      .from('books')
      .update({ image_url: formData.image_url })
      .eq('book_id', bookId);
    if (error) throw error;
  };

  // 書籍種別マスターの展開・取得
  const [bookTypes, setBookTypes] = useState<BookTypeMaster[]>([]);
  useEffect(() => {
    const fetchBookTypes = async () => {
      const { data, error } = await supabaseClient
        .from('booktype_master')
        .select('*')
        .order('booktype_cd', { ascending: true });
      if (error) {
        console.error('Error fetching book types:', error);
      } else {
        setBookTypes(data || []);
      }
    };
    fetchBookTypes();
  }, []);
  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      booktype_cd: e.target.value // ここでbooktype_cdが取得される
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-xl">
        <div>
          <span className="text-xl font-bold text-blue-500 mr-2">保有情報追加</span>（
          <span className="font-bold text-orange-500">オレンジ色</span>
          項目は空白不可）
        </div>
        <div className="flex items-center text-xl font-bold text-gray-500 mb-2">『{bookTitle}』</div>
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex-1">
            <div className="mt-1 ml-2">
              <label htmlFor="booktype" className="font-bold text-orange-500">
                書籍種別
              </label>
              <select
                id="booktype"
                required
                ref={firstInputRef}
                value={formData.booktype_cd}
                className={styleItems}
                onChange={handleSelect}
              >
                <option value="">選択してください</option>
                {bookTypes.map((item) =>
                  item.selectable ? (
                    <option key={item.booktype_cd} value={item.booktype_cd}>
                      {item.booktype}
                    </option>
                  ) : (
                    <option key={item.booktype_cd} disabled>
                      {item.booktype}
                    </option>
                  )
                )}
              </select>
            </div>
            <div className="flex items-center mt-1 ml-2">
              <label htmlFor="get_date" className="inline-block w-16 font-bold text-orange-500">
                入 手 日
              </label>
              <input
                id="get_date"
                type="date"
                required
                value={formData.get_date}
                className={styleItems}
                onChange={(e) => setFormData({ ...formData, get_date: e.target.value })}
              />
              <div className="ml-1">※不明の場合 ･･･ 1/1/1</div>
            </div>
            <div className="mt-1 ml-2">
              <label htmlFor="dispose_date" className="inline-block w-16">
                処 分 日
              </label>
              <input
                id="dispose_date"
                type="date"
                min={formData.get_date || ''}
                value={formData.dispose_date}
                className={styleItems}
                onChange={(e) => setFormData({ ...formData, dispose_date: e.target.value })}
              />
            </div>
            <div className="mt-1 ml-2">
              <label htmlFor="remarks" className="inline-block w-16 align-top">
                備　考
              </label>
              <textarea
                id="remarks"
                value={formData.remarks}
                cols={52}
                rows={6}
                className={styleItems}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              ></textarea>
            </div>
          </div>

          <div className="w-full flex ml-2 p-1">
            <div className="flex-1">
              <label htmlFor="image_url">書影URL</label>
              <textarea
                id="image_url"
                className={`${styleItems} `}
                cols={30}
                rows={4}
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                onBlur={handleBlur} // 確定時にプレビュー更新
              ></textarea>
              {formData.image_url ? (
                <div className="flex justify-end mr-2">
                  <input
                    id="urlUp_f"
                    className="ml-2"
                    type="checkbox"
                    checked={formData.urlUp_f}
                    onChange={handleChange}
                  />
                  基本情報の書影とする
                </div>
              ) : null}
            </div>
            <div className="flex-1 justify-center items-center">
              {!previewUrl || previewUrl.endsWith('url=') ? (
                <Image src="/images/book_NoImage.jpg" alt="No_Image" width={170} height={200} />
              ) : (
                <Image
                  src={previewUrl}
                  alt="Book Cover"
                  width={170}
                  height={200}
                  className="object-contain"
                  unoptimized
                  onError={(e) => {
                    //  console.log(`Failed to load image : ${previewUrl}`);
                    if (e.currentTarget.src.includes('book_unavailable')) {
                      return;
                    } else {
                      e.currentTarget.onerror = null;
                      setPreviewUrl('/images/book_unavailable.jpg');
                    }
                  }}
                />
              )}
            </div>
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
