'use client';

import { useState } from 'react';
import { Client } from '@/lib/Client';
import styles from './page.module.css';

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
  const [formData, setFormData] = useState(initialFormState);

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

  // クリアボタンの処理
  const handleClear = () => {
    if (confirm('入力内容をすべて消去しますか？')) {
      setFormData(initialFormState);
    }
  };

  // 登録ボタンの処理
  const handleRegister = async () => {
    // 必須チェック（titleはNOT NULL制約があるため）
    if (!formData.title.trim()) {
      alert('題名は必須入力です。');
      return;
    }

    try {
      // 数値型への変換と空文字のnull変換処理
      const insertData = {
        ...formData,
        // 数値型カラムの変換（空文字ならnull）
        first_publish_year: formData.first_publish_year ? parseInt(formData.first_publish_year) : null,
        // その他の文字列カラムで空文字があればnullに変換（任意）
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

      const { error } = await Client.from('books').insert([insertData]);

      if (error) throw error;

      alert('登録が完了しました！');
      setFormData(initialFormState); // 登録後にフォームをリセット
    } catch (error) {
      console.error('Error inserting data:', error);
      alert('登録に失敗しました。');
    }
  };

  return (
    <div>
      <h1 className="text-center text-3xl font-bold underline bg-cyan-500">書籍管理</h1>
      <div className="border-solid border-2 rounded-lg m-4">
        <div>
          <h2 className="text-xl font-bold text-blue-500 m-2">書籍基本情報</h2>
          <span className="ml-2">
            <label htmlFor="isbn10">ISBN-10</label>
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
            <label htmlFor="title">題　名</label>
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
            <label htmlFor="original_title">原題名</label>
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
            <label htmlFor="colophon" className="align-top">
              奥　付
            </label>
            <textarea
              id="colophon"
              className={styles.items}
              cols={95}
              rows={4}
              value={formData.colophon}
              onChange={handleChange}
            ></textarea>
          </span>
          <br />
          <span className="ml-2">
            <label htmlFor="publisher">出版社</label>
            <input
              id="publisher"
              className={styles.items}
              type="text"
              size={24}
              value={formData.publisher}
              onChange={handleChange}
            />
          </span>
          <span className="ml-4">
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
            <label htmlFor="first_publish_year">初版年</label>
            <input
              id="first_publish_year"
              className={styles.items}
              type="number"
              min={1900}
              max={9999}
              value={formData.first_publish_year}
              onChange={handleChange}
            />
          </span>
          <br />
          <span className="ml-2">
            <label htmlFor="remarks" className="align-top">
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
          <br />
          <span className="float-end">（データID）</span>
        </div>
        <br />
        <div className="flex justify-around">
          <button id="button_insert" type="button" className={styles.btnSolidBlue} onClick={handleRegister}>
            基本情報のみ登録
          </button>
          <button id="button_possese" type="button" className={styles.btnSolidOrange}>
            基本情報に続けて所有情報を登録
          </button>
          <button id="button_clear" type="button" className={styles.btnOutline} onClick={handleClear}>
            基本情報クリア
          </button>
        </div>
        <br />
      </div>
    </div>
  );
}
