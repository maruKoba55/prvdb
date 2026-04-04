'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Client } from '@/lib/Client';
import { CommonButton } from '@/components/ui/button';
import Image from 'next/image';
import styles from '../page.module.css';

// 本日日付（ローカル）
const todayLocal = [
  new Date().getFullYear(),
  String(new Date().getMonth() + 1).padStart(2, '0'),
  String(new Date().getDate()).padStart(2, '0')
].join('-');

// 初期状態の定義
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

export default function InsertPossess() {
  const searchParams = useSearchParams();
  const bookId = searchParams.get('book_id');
  const title = searchParams.get('title');
  const isbn13 = searchParams.get('isbn13');
  const [formData, setFormData] = useState(initialFormState);
  const [registeredPossess, setRegisteredPossess] = useState<any>(null);
  const [bookTypes, setBookTypes] = useState<BookTypeMaster[]>([]);

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

  // 画面内容をTable 'book_possess' へ登録
  const insertPossessData = async () => {
    if (!formData.booktype_cd || !formData.get_date.trim()) {
      alert('必須項目が未入力です');
      return null;
    }
    if (formData.get_date > formData.dispose_date) {
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

    // Table 'book_possess'をinsert
    const { data, error } = await Client.from('book_possess').insert([insertData]).select();
    if (error) throw error;
    return data ? data[0] : null;
  };

  // 保有情報登録ボタンの処理
  const handleRegister = async () => {
    try {
      const data = await insertPossessData();
      if (data) {
        setRegisteredPossess(data); // 画面に表示
        alert('書籍保有情報を登録しました');
      }
    } catch (error) {
      console.error(error);
      if (
        (error instanceof Error && (error as any).code === '23505') ||
        (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505')
      ) {
        alert('このデータは登録済みです');
      } else {
        alert(`登録失敗（Insert to Table 'book_possess' error.code=${(error as any).code || 'unknown'}）`);
      }
    }
  };

  // 画面初期化ボタンの処理
  const handleClear = () => {
    if (confirm('入力内容をすべて消去しますか？')) {
      setFormData(initialFormState);
      setRegisteredPossess(null);
    }
  };

  // 閉じるボタンの処理
  const handleClose = () => {
    window.close();
  };

  // 書籍種別マスターの展開・取得
  useEffect(() => {
    const fetchBookTypes = async () => {
      const { data, error } = await Client.from('booktype_master')
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
    <div className="min-w-[800px] w-full">
      <h1 className="text-center text-3xl font-bold underline bg-cyan-500">書籍管理</h1>
      <div className="border-solid border-2 rounded-lg m-4 p-2">
        <div className="flex">
          {/* 左側：入力フォーム */}
          <div className="flex-1">
            <span className="text-xl font-bold text-blue-500 m-2">書籍保有情報</span>
            &nbsp;
            <span className="text-xl font-bold text-gray-500">{title ? '『' + title + '』' : ''}</span>
            <span className="text-gray-500">（データID：{bookId ? bookId : '---'}）</span>
            <br />
            <p className="ml-6">
              （<span className="font-bold text-orange-500">オレンジ色</span>項目は入力必須）
            </p>
            <span className="ml-2">
              <label htmlFor="booktype" className="font-bold text-orange-500">
                書籍種別
              </label>
              <select
                id="booktype"
                className={styles.items}
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
                      ----------
                    </option>
                  )
                )}
              </select>
            </span>
            <br />
            <span className="ml-2">
              <label htmlFor="get_date" className="inline-block w-16 font-bold text-orange-500">
                入 手 日
              </label>
              <input
                id="get_date"
                className={styles.items}
                type="date"
                required
                value={formData.get_date}
                onChange={handleChange}
              />
              &nbsp;※不明の場合 ･･･ 1/1/1
            </span>
            <br />
            <span className="ml-2">
              <label htmlFor="dispose_date" className="inline-block w-16">
                処 分 日
              </label>
              <input
                id="dispose_date"
                className={styles.items}
                type="date"
                value={formData.dispose_date}
                onChange={handleChange}
              />
            </span>
            <br />
            <span className="ml-2">
              <label htmlFor="remarks" className="inline-block w-16 align-top">
                備　考
              </label>
              <textarea
                id="remarks"
                className={styles.items}
                cols={50}
                rows={4}
                value={formData.remarks}
                onChange={handleChange}
              ></textarea>
            </span>
          </div>

          {/* 右側：画像表示エリア */}
          <div className="w-[200px] flex flex-col items-center justify-start ml-2 p-2">
            <div className="w-full h-[220px] flex items-center justify-center mb-4">
              {!previewUrl || previewUrl.endsWith('url=') ? (
                <div>
                  <Image src="/images/book_NoImage.jpg" alt="No_Image" width={170} height={200} />
                </div>
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
            <div className="w-full flex flex-col">
              <label htmlFor="image_url" className="text-sm font-medium text-gray-700 flex mb-1">
                (書影URL)
              </label>
              <textarea
                id="image_url"
                className={`${styles.items} w-full resize-none`}
                cols={20}
                rows={1}
                value={formData.image_url}
                onChange={handleChange}
                onBlur={handleBlur} // 確定時にプレビュー更新
              ></textarea>
              <span className="justify-right  ml-4">
                <label htmlFor="urlUp_f">基本情報の書影とする</label>
                <input
                  id="urlUp_f"
                  className="ml-2"
                  type="checkbox"
                  checked={formData.urlUp_f}
                  onChange={handleChange}
                />
              </span>
            </div>
          </div>
        </div>

        {/* 下段：ボタンエリア */}
        <div className="flex justify-around">
          <CommonButton label="保有情報を登録" variant="blue" onClick={handleRegister} />
          <CommonButton label="画面初期化" variant="outline" onClick={handleClear} />
          <CommonButton label="閉じる" variant="outline" onClick={handleClose} />
        </div>
        <br />
      </div>
    </div>
  );
}
