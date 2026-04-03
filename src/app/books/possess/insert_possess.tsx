'use client';

import { useState } from 'react';
import { Client } from '@/lib/Client';
import { CommonButton } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import styles from '../page.module.css';

// 初期状態の定義
const initialFormState = {
  ndc_cd: '',
  isbn10: '',
  isbn13: '',
  c_cd: '',
  title: '',
  original_title: '',
  colophon: '年月日初版発行\n著者：\n訳者：\n発行所：',
  publisher: '',
  publish_series: '',
  publish_series_no: '',
  first_publish_year: '',
  remarks: '',
  comic_f: false,
  image_url: ''
};

export default function InsertBooks() {
  const searchParams = useSearchParams();
  const bookId = searchParams.get('book_id');
  const title = searchParams.get('title');
  const isbn13 = searchParams.get('isbn13');
  const [formData, setFormData] = useState(initialFormState);
  const [registeredBook, setRegisteredBook] = useState<any>(null);

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

  // 画面内容をTable 'books' へ登録
  const insertBookData = async () => {
    if (!formData.title.trim() || !formData.publisher.trim() || !formData.first_publish_year.trim()) {
      alert('題名、出版社、初版年は入力必須です。');
      return null;
    }
    const insertData = {
      ...formData,
      first_publish_year: formData.first_publish_year ? parseInt(formData.first_publish_year) : null,
      ndc_cd: formData.ndc_cd || null,
      isbn10: formData.isbn10 || null,
      isbn13: formData.isbn13 || null,
      c_cd: formData.c_cd || null,
      original_title: formData.original_title || null,
      colophon: formData.colophon || null,
      publisher: formData.publisher || null,
      publish_series: formData.publish_series || null,
      publish_series_no: formData.publish_series_no || null,
      remarks: formData.remarks || null,
      image_url: formData.image_url || null
    };
    // Table 'books'をinsertし、その内容を取得
    const { data, error } = await Client.from('books').insert([insertData]).select();
    if (error) throw error;
    return data ? data[0] : null;
  };

  // 基本情報登録ボタンの処理
  const handleRegister = async () => {
    try {
      const data = await insertBookData();
      if (data) {
        setRegisteredBook(data); // 画面に表示
        alert('書籍基本情報を登録しました');
      }
    } catch (error) {
      console.error(error);
      if (error instanceof Error && (error as any).code === '23505') {
        alert('このデータは登録済みです');
      } else if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
        alert('このデータは登録済みです');
      } else {
        alert('登録に失敗しました');
      }
    }
  };

  // 保有情報登録ウィンドウを開く
  const handlepossess = () => {
    // URLやパラメータは環境に合わせて調整
    const possessUrl = `/possess/new?book_id=${registeredBook.book_id}`;
    window.open(possessUrl, '_blank', 'width=800,height=600');
  };

  // 役割情報登録ウィンドウを開く
  const handleRole = () => {
    // URLやパラメータは環境に合わせて調整
    const roleUrl = `/role/new?book_id=${registeredBook.book_id}`;
    window.open(roleUrl, '_blank', 'width=800,height=600');
  };

  // 画面初期化ボタンの処理
  const handleClear = () => {
    if (confirm('入力内容をすべて消去しますか？')) {
      setFormData(initialFormState);
      setRegisteredBook(null);
    }
  };

  // 閉じるボタンの処理
  const handleClose = () => {
    window.close();
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
            <br /> <br />
            <span className="ml-2">
              <label htmlFor="booktype">書籍種別</label>
              <select
                id="booktype"
                className={styles.items}
                value={formData.booktype}
                onChange={handleChange}
                defaultValue="紙"
              >
                <option value="紙">紙</option>
                <option disabled>----------</option>
                <option value="kindle">kindle</option>
                <option value="honto">honto</option>
                <option value="AppleBooks">AppleBooks</option>
                <option value="BOOK☆WALKER">BOOK☆WALKER</option>
                <option value="日経ストア">日経ストア</option>
                <option disabled>----------</option>
                <option value="PDF">PDF</option>
                <option value="HTML">HTML</option>
              </select>
            </span>
            <br />
            <span className="ml-2">
              <label htmlFor="get_date" className="inline-block w-16">
                入 手 日
              </label>
              <input
                id="get_date"
                className={styles.items}
                type="date"
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
                <label htmlFor="urlUp">基本情報の書影とする</label>
                <input id="urlUp" className="ml-2" type="checkbox" checked={formData.urlUp} onChange={handleChange} />
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
