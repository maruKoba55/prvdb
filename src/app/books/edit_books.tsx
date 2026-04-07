'use client';

import { useState } from 'react';
import { supabaseClient } from '@/lib/Client';
import { CommonButton } from '@/components/ui/button';
import { toWarekiYear } from '@/utils/toWarekiYear';
import Image from 'next/image';
import styles from './page.module.css';

// 初期状態の定義
const initialFormState = {
  ndc_cd: '',
  isbn10: '',
  isbn13: '',
  c_cd: '',
  title: '',
  original_title: '',
  colophon: '年月日初版発行\n著者：\n翻訳者：\n発行所：',
  publisher: '',
  publish_series: '',
  publish_series_no: '',
  first_publish_year: '',
  remarks: '',
  comic_f: false,
  image_url: ''
};

export default function EditBooks() {
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
  const editBookData = async () => {
    if (!formData.title.trim() || !formData.publisher.trim() || !formData.first_publish_year.trim()) {
      alert('必須項目が未入力です');
      return null;
    }
    if (Number(formData.first_publish_year.trim()) > new Date().getFullYear() + 1) {
      alert('初版年を確認してください');
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
    // Table 'books'にinsertし、その内容を取得
    const { data, error } = await supabaseClient.from('books').insert([insertData]).select();
    if (error) throw error;
    return data ? data[0] : null;
  };

  // 奥付消去ボタンの処理
  const handleClearColophon = () => {
    setFormData((prev) => ({
      ...prev, // 現在の入力内容をコピー
      colophon: ''
    }));
  };

  // 基本情報登録ボタンの処理
  const handleRegister = async () => {
    try {
      const data = await editBookData();
      if (data) {
        setRegisteredBook(data);
        alert(`『${data.title}』（${data.publisher}、${data.first_publish_year}）を登録しました`);
      }
    } catch (error) {
      console.error(error);
      if (
        (error instanceof Error && (error as any).code === '23505') ||
        (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505')
      ) {
        alert(`『${formData.title}』（${formData.publisher}、${formData.first_publish_year}）は登録済みです`);
      } else {
        alert(`登録失敗（Insert to Table 'books' error.code=${(error as any).code || 'unknown'}）`);
      }
    }
  };

  // 保有情報登録ウィンドウを開く
  const handlePossess = () => {
    const { book_id, title, isbn13 } = registeredBook;
    const params = new URLSearchParams({
      book_id: book_id.toString(),
      title: title || '',
      isbn13: isbn13 || ''
    });
    const possessUrl = `/books/possess?${params.toString()}`;
    window.open(possessUrl, '_blank', 'width=800,height=520');
  };

  // 役割情報登録ウィンドウを開く
  const handleRole = () => {
    const { book_id, title } = registeredBook;
    const params = new URLSearchParams({
      book_id: book_id.toString(),
      title: title || ''
    });
    const roleUrl = `/books/role?${params.toString()}`;
    window.open(roleUrl, '_blank', 'width=760,height=420');
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
    <div className="min-w-[1100px] w-full">
      <h1 className="w-[1108px] text-center text-3xl font-bold underline bg-cyan-500">書籍管理</h1>
      <div className="w-[1092px] border-solid border-2 rounded-lg m-4 p-2">
        <div className="flex">
          {/* 左側：入力フォーム */}
          <div className="flex-1">
            <p className="flex ml-2">
              <span className="text-xl font-bold text-blue-500">書籍基本情報</span>
              <span className="text-gray-500">（書籍ID：{registeredBook ? registeredBook.book_id : '---'}）</span>
            </p>
            <p className="ml-6">
              （<span className="font-bold text-orange-500">オレンジ色</span>項目は入力必須）
            </p>
            <p className="ml-2">
              <span>
                <label htmlFor="isbn10" className="inline-block w-15">
                  ISBN-10
                </label>
                <input
                  id="isbn10"
                  className={styles.items}
                  type="text"
                  size={13}
                  maxLength={13}
                  value={formData.isbn10}
                  onChange={handleChange}
                />
              </span>
              <span className="ml-4">
                <label htmlFor="isbn13">ISBN-13</label>
                <input
                  id="isbn13"
                  className={styles.items}
                  type="text"
                  size={17}
                  maxLength={17}
                  value={formData.isbn13}
                  onChange={handleChange}
                />
              </span>
              <span className="ml-4">
                <label htmlFor="c_cd">Cコード</label>
                <input
                  id="c_cd"
                  className={styles.items}
                  type="text"
                  size={5}
                  maxLength={5}
                  value={formData.c_cd}
                  onChange={handleChange}
                />
              </span>
              <span className="ml-4">
                <label htmlFor="ndc_cd">十進分類</label>
                <input
                  id="ndc_cd"
                  className={styles.items}
                  type="text"
                  size={10}
                  maxLength={10}
                  value={formData.ndc_cd}
                  onChange={handleChange}
                />
              </span>
            </p>
            <p className="ml-2">
              <label htmlFor="title" className="inline-block w-15 font-bold text-orange-500">
                題　名
              </label>
              <input
                id="title"
                className={styles.items}
                type="text"
                required
                size={94}
                value={formData.title}
                onChange={handleChange}
              />
            </p>
            <p className="ml-2">
              <label htmlFor="original_title" className="inline-block w-15">
                原題名
              </label>
              <input
                id="original_title"
                className={styles.items}
                type="text"
                size={94}
                value={formData.original_title}
                onChange={handleChange}
              />
            </p>
            <p className="ml-2">
              <span>
                <label htmlFor="colophon" className="inline-block w-15 align-top">
                  奥　付
                </label>
                <textarea
                  id="colophon"
                  className={styles.items}
                  cols={80}
                  rows={4}
                  value={formData.colophon}
                  onChange={handleChange}
                ></textarea>
              </span>
              <span className="ml-2 align-top">
                <button
                  type="button"
                  className="py-2 px-3 text-base rounded-md font-semibold bg-blue-300"
                  onClick={handleClearColophon}
                >
                  奥付消去
                </button>
              </span>
            </p>
            <p className="ml-2">
              <label htmlFor="publisher" className="inline-block w-15 font-bold text-orange-500">
                出版社
              </label>
              <input
                id="publisher"
                className={styles.items}
                type="text"
                required
                size={24}
                value={formData.publisher}
                onChange={handleChange}
              />
              &nbsp;※不詳の場合はカッコで括り、（不明）（自費出版）等
            </p>
            <p className="ml-19">
              <span>
                <label htmlFor="publish_series">出版シリーズ</label>
                <input
                  id="publish_series"
                  className={styles.items}
                  type="text"
                  size={26}
                  value={formData.publish_series}
                  onChange={handleChange}
                />
              </span>
              <span>
                <label htmlFor="publish_series_no" className="ml-4">
                  シリーズ番号
                </label>
                <input
                  id="publish_series_no"
                  className={styles.items}
                  type="text"
                  size={8}
                  value={formData.publish_series_no}
                  onChange={handleChange}
                />
              </span>
            </p>
            <p className="ml-2">
              <label htmlFor="first_publish_year" className="inline-block w-15 font-bold text-orange-500">
                初版年
              </label>
              <input
                id="first_publish_year"
                className={styles.items}
                type="number"
                required
                size={4}
                min={0}
                max={9999}
                value={formData.first_publish_year}
                onChange={handleChange}
              />
              {formData.first_publish_year && (
                <span>（{toWarekiYear(formData.first_publish_year ? parseInt(formData.first_publish_year) : 0)}）</span>
              )}
              &nbsp;※不詳の場合は 0（zero）
            </p>
            <p className="ml-2">
              <label htmlFor="remarks" className="inline-block w-15 align-top">
                備　考
              </label>
              <textarea
                id="remarks"
                className={styles.items}
                cols={80}
                rows={2}
                value={formData.remarks}
                onChange={handleChange}
              ></textarea>
            </p>
          </div>

          {/* 右側：画像表示エリア */}
          <div className="w-[200px] flex flex-col ml-2 p-2">
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
                className={`${styles.items} w-full resize-none`}
                cols={20}
                rows={1}
                value={formData.image_url}
                onChange={handleChange}
                onBlur={handleBlur} // 確定時にプレビュー更新
              ></textarea>
            </p>
            <p className="flex mt-6 justify-end">
              <label htmlFor="comic_f">コミック</label>
              <input id="comic_f" className="ml-2" type="checkbox" checked={formData.comic_f} onChange={handleChange} />
            </p>
          </div>
        </div>

        {/* 下段：ボタンエリア */}
        <div className="flex m-2 justify-around">
          <CommonButton label="基本情報を登録" variant="blue" onClick={handleRegister} />
          <CommonButton
            label="保有情報登録へ"
            variant="red"
            onClick={handlePossess}
            disabled={!registeredBook?.book_id}
            title="基本情報の登録後、保有する書籍の情報を入力"
          />
          <CommonButton
            label="役割情報登録へ"
            variant="orange"
            onClick={handleRole}
            disabled={!registeredBook?.book_id}
            title="基本情報の登録後、検索用の著者名などを入力"
          />
          <CommonButton label="画面初期化" variant="outline" onClick={handleClear} />
          <CommonButton label="閉じる" variant="outline" onClick={handleClose} />
        </div>
      </div>
    </div>
  );
}
