'use client';

import { useState } from 'react';
import { Client } from '@/lib/Client';
import styles from './page.module.css';
import { useSearchParams } from 'next/navigation';

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
  const [formData, setFormData] = useState(initialFormState);
  const [registeredBook, setRegisteredBook] = useState<any>(null);

  // 書影表示用URL（登録済みデータ＞入力中URL）
  const displayImageUrl = registeredBook?.image_url || formData.image_url;

  // 汎用的な入力変更ハンドラ
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      // チェックボックスの場合はchecked、それ以外はvalueを格納
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
      const data = await insertBookData();
      if (data) {
        setRegisteredBook(data); // 画面に表示
        alert('書籍基本情報を登録しました');
      }
    } catch (error) {
      console.error(error);
      if (error.code === '23505') {
        alert('このデータは登録済みです');
      } else {
        alert('登録に失敗しました');
      }
    }
  };

  // 所有情報登録ウィンドウを開く
  const handlePossese = () => {
    // URLやパラメータは環境に合わせて調整
    const posseseUrl = `/possese/new?book_id=${registeredBook.book_id}`;
    window.open(posseseUrl, '_blank', 'width=800,height=600');
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
    <div className="min-w-[880px] w-full">
      <h1 className="text-center text-3xl font-bold underline bg-cyan-500">書籍所有情報（登録）</h1>
      <div className="border-solid border-2 rounded-lg m-4">
        <div>
          <span className="text-xl font-bold text-blue-500 m-2">書籍基本情報</span>
          <span className="text-gray-500">（データID：{bookId ? bookId : '---'}）</span>
          <br />
          <span className="ml-2">
            <label htmlFor="isbn10" className="inline-block w-15">
              ISBN-10
            </label>
            <input
              id="isbn10"
              className={styles.items}
              type="text"
              size="13"
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
              size="17"
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
              size="5"
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
              size="10"
              maxLength={10}
              value={formData.ndc_cd}
              onChange={handleChange}
            />
          </span>
          <br />
          <span className="ml-2">
            <label htmlFor="title" className="inline-block w-15">
              題　名
            </label>
            <input
              id="title"
              className={styles.items}
              type="text"
              size={94}
              value={formData.title}
              onChange={handleChange}
            />
          </span>
          <br />
          <span className="ml-2">
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
          </span>
          <br />
          <span className="ml-2">
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
              id="button_clear_colophon"
              type="button"
              className={styles.btnOutlineMini}
              onClick={handleClearColophon}
            >
              奥付消去
            </button>
          </span>
          <br />
          <span className="ml-2">
            <label htmlFor="publisher" className="inline-block w-15">
              出版社
            </label>
            <input
              id="publisher"
              className={styles.items}
              type="text"
              size={24}
              value={formData.publisher}
              onChange={handleChange}
            />
            &nbsp;※不明の場合 ･･･（不明）または（自費出版）
          </span>
          <br />
          <span className="ml-19">
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
          <br />
          <span className="ml-2">
            <label htmlFor="first_publish_year" className="inline-block w-15">
              初版年
            </label>
            <input
              id="first_publish_year"
              className={styles.items}
              type="number"
              min={0}
              max={9999}
              value={formData.first_publish_year}
              onChange={handleChange}
            />
            &nbsp;※不明の場合 ･･･ 0（zero）
          </span>
          <br />
          <span className="ml-2">
            <label htmlFor="remarks" className="inline-block w-15 align-top">
              備　考
            </label>
            <textarea
              id="remarks"
              className={styles.items}
              cols={80}
              rows={3}
              value={formData.remarks}
              onChange={handleChange}
            ></textarea>
          </span>
          <span className="ml-4">
            <label htmlFor="comic_f">コミック</label>
            <input type="checkbox" id="comic_f" className="ml-2" checked={formData.comic_f} onChange={handleChange} />
          </span>
          <br />
          <span className="ml-2">
            <label htmlFor="image_url">書影URL</label>
            <input
              id="image_url"
              className={styles.items}
              type="text"
              value={formData.image_url}
              onChange={handleChange}
            />
          </span>
        </div>
        <br />
        <div className="flex justify-around">
          <button id="button_insert" type="button" className={styles.btnSolidBlue} onClick={handleRegister}>
            基本情報を登録
          </button>
          <button
            id="button_possese"
            type="button"
            title="基本情報の登録後、所有する書籍に関する情報を入力"
            className={styles.btnSolidOrange}
            disabled={!registeredBook?.book_id}
            onClick={handlePossese}
          >
            所有情報登録へ
          </button>
          <button
            id="button_role"
            type="button"
            title="基本情報の登録後、検索用の著者名などを入力"
            className={styles.btnSolidOrange}
            disabled={!registeredBook?.book_id}
            onClick={handleRole}
          >
            役割情報登録へ
          </button>
          <button id="button_clear" type="button" className={styles.btnOutline} onClick={handleClear}>
            画面初期化
          </button>
          <button id="button_close" type="button" className={styles.btnOutline} onClick={handleClose}>
            閉じる
          </button>
        </div>
        <br />
      </div>
    </div>
  );
}
