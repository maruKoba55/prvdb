'use client';

import { useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSearchParams } from 'next/navigation';
import { supabaseClient } from '@/lib/Client';
import { CommonButton } from '@/components/ui/button';
import Image from 'next/image';

const styleItems =
  'ml-2 border border-[#ccc] p-1 rounded outline-none hover:border-[#999] focus:border-[#007bff] focus:ring-4 focus:ring-[#007bff]/25';
const screenMinW = 800; //画面最小幅

// 本日日付（ローカル）
const todayLocal = [
  new Date().getFullYear(),
  String(new Date().getMonth() + 1).padStart(2, '0'),
  String(new Date().getDate()).padStart(2, '0')
].join('-');

const initialFormState = {
  booktype_cd: '',
  get_date: todayLocal,
  dispose_date: '',
  remarks: '',
  image_url: '',
  urlUp_f: false
};

type BookTypeMaster = {
  booktype_cd: string;
  booktype: string;
  selectable: boolean;
};

export default function EditPossess() {
  const searchParams = useSearchParams();
  const bookId = searchParams.get('book_id');
  const title = searchParams.get('title');
  const isbn13 = searchParams.get('isbn13');
  const [formData, setFormData] = useState(initialFormState);
  const [registeredPossess, setRegisteredPossess] = useState<any>(null);
  const [bookTypes, setBookTypes] = useState<BookTypeMaster[]>([]);

  // 各ボタンの処理（ホットキー設定は return ,if文より前に書かないとエラーになる）
  // ［保有情報を登録］
  const handleRegist = async () => {
    try {
      const data = await editPossessData();
      if (data) {
        if (formData.urlUp_f) {
          await updateBookImageUrl();
        }
        setRegisteredPossess(data); // 画面に表示
        alert('書籍保有情報を登録しました');
      }
    } catch (error: any) {
      if (
        (error instanceof Error && (error as any).code === '23505') ||
        (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505')
      ) {
        alert('このデータは登録済みです');
      } else {
        console.error(error);
        alert(`登録失敗（Insert to Table 'book_possess' error.code=${(error as any).code || 'unknown'}）`);
      }
    }
  };
  // ［画面初期化］
  const handleErase = () => {
    setFormData(initialFormState);
    setRegisteredPossess(null);
  };
  // ［閉じる］
  const handleClose = () => {
    window.close();
  };
  useHotkeys('alt+c', (event) => {
    event.preventDefault(); // ブラウザのデフォルト挙動を防止
    handleClose();
  });

  // 書影表示用：image_url入力確定時にpreviewUrlを更新
  // 画像取得403エラー回避のため、プロキシAPIを経由する
  const [previewUrl, setPreviewUrl] = useState(formData.image_url);
  const handleBlur = () => {
    setPreviewUrl(`/api/proxy?url=${encodeURIComponent(formData.image_url.trim())}`);
  };

  // 書影URLを Table 'books' に反映
  const updateBookImageUrl = async () => {
    if (!bookId) return;
    const { error } = await supabaseClient
      .from('books')
      .update({ image_url: formData.image_url })
      .eq('book_id', bookId);
    if (error) throw error;
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

  // 画面内容をTable 'book_possess' へ登録
  const editPossessData = async () => {
    if (!formData.booktype_cd || !formData.get_date.trim()) {
      alert('必須項目が未入力です');
      return null;
    }
    if (formData.dispose_date && formData.dispose_date < formData.get_date) {
      alert('処分日を確認してください');
      return null;
    }

    const insertData = {
      book_id: bookId || null,
      booktype_cd: formData.booktype_cd || null,
      get_date: formData.get_date || null,
      dispose_date: formData.dispose_date || null,
      remarks: formData.remarks || null,
      image_url: formData.image_url || null
    };
    const { data, error } = await supabaseClient.from('book_possess').insert([insertData]).select();
    if (error) throw error;
    return data ? data[0] : null;
  };

  // 書籍種別マスターの展開・取得
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
    <div style={{ minWidth: `${screenMinW}px` }} className="w-full">
      <h1 style={{ minWidth: `${screenMinW + 8}px` }} className="text-center text-3xl font-bold underline bg-cyan-500">
        書籍管理
      </h1>
      <div style={{ minWidth: `${screenMinW - 8}px` }} className="border-solid border-2 rounded-lg m-4 p-1">
        <div className="flex">
          {/* 左側：入力フォーム */}
          <div className="flex-1">
            <p>
              <span className="text-xl font-bold text-blue-500 m-2">書籍保有情報</span>
              <span className="text-xl font-bold text-gray-500 ml-1">{title ? `『${title}』` : ''}</span>
              <span className="text-gray-500">{bookId ? `（書籍ID：${bookId}）` : ''}</span>
            </p>
            <p className="ml-6">
              （<span className="font-bold text-orange-500">オレンジ色</span>項目は入力必須）
            </p>
            <p className="mt-1 ml-2">
              <label htmlFor="booktype" className="font-bold text-orange-500">
                書籍種別
              </label>
              <select
                id="booktype"
                className={styleItems}
                required
                value={formData.booktype_cd}
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
            </p>
            <p className="mt-1 ml-2">
              <label htmlFor="get_date" className="inline-block w-16 font-bold text-orange-500">
                入 手 日
              </label>
              <input
                id="get_date"
                className={styleItems}
                type="date"
                required
                value={formData.get_date}
                onChange={handleChange}
              />
              <span className="ml-1">※不明の場合 ･･･ 1/1/1</span>
            </p>
            <p className="mt-1 ml-2">
              <label htmlFor="dispose_date" className="inline-block w-16">
                処 分 日
              </label>
              <input
                id="dispose_date"
                className={styleItems}
                type="date"
                value={formData.dispose_date}
                onChange={handleChange}
              />
            </p>
            <p className="mt-1 ml-2">
              <label htmlFor="remarks" className="inline-block w-16 align-top">
                備　考
              </label>
              <textarea
                id="remarks"
                className={styleItems}
                cols={58}
                rows={6}
                value={formData.remarks}
                onChange={handleChange}
              ></textarea>
            </p>
          </div>

          {/* 右側：画像表示エリア */}
          <div className="w-[200px] flex flex-col ml-2 p-1">
            <p className="w-[170px] h-full flex items-center justify-center mb-4">
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
            </p>
            <p className="w-full flex flex-col">
              <label htmlFor="image_url" className="text-sm font-medium text-gray-700 flex mb-1">
                (書影URL)
              </label>
              <textarea
                id="image_url"
                className={`${styleItems} w-full resize-none`}
                cols={20}
                rows={1}
                value={formData.image_url}
                onChange={handleChange}
                onBlur={handleBlur} // 確定時にプレビュー更新
              ></textarea>
              <span className="flex justify-end">
                <label htmlFor="urlUp_f">基本情報の書影とする</label>
                <input
                  id="urlUp_f"
                  className="ml-2"
                  type="checkbox"
                  checked={formData.urlUp_f}
                  onChange={handleChange}
                />
              </span>
            </p>
          </div>
        </div>

        {/* 下段：ボタンエリア */}
        <div className="flex m-2 justify-around">
          <CommonButton label="保有情報を登録" variant="blue" onClick={handleRegist} />
          <CommonButton label="画面初期化" variant="outline" onClick={handleErase} />
          <CommonButton
            label={
              <>
                閉じる (<u>C</u>)
              </>
            }
            variant="outline"
            onClick={handleClose}
          />
        </div>
      </div>
    </div>
  );
}
