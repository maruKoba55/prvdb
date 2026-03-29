'use client';

import { useState } from 'react';
import { client } from '@/lib/Client';
import styles from './page.module.css';

// Supabaseクライアントの初期化
//const supabase = client(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

// 初期状態の定義
const initialFormState = {
  ndc_cd: '',
  isbn10: '',
  isbn13: '',
  c_cd: '',
  title: '',
  original_title: '',
  colophon: '',
  publisher: '',
  publish_series: '',
  publish_series_no: '',
  first_publish_year: '',
  remarks: '',
  comic_f: false,
  image_url: ''
};

export default function InputBooks() {
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

      const { error } = await client.from('t_books').insert([insertData]);

      if (error) throw error;

      alert('登録が完了しました！');
      setFormData(initialFormState); // 登録後にフォームをリセット
    } catch (error) {
      console.error('Error inserting data:', error);
      alert('登録に失敗しました。');
    }
  };

  return (
    <div className={styles.container}>
      <h1>書籍管理</h1>
      <h2>ID</h2>

      <label htmlFor="ndc_cd"> 十進分類</label>
      <input id="ndc_cd" type="text" maxLength={10} value={formData.ndc_cd} onChange={handleChange} />

      <label htmlFor="isbn10"> ISBN(10)</label>
      <input id="isbn10" type="text" maxLength={13} value={formData.isbn10} onChange={handleChange} />

      <label htmlFor="isbn13"> ISBN(13)</label>
      <input id="isbn13" type="text" maxLength={17} value={formData.isbn13} onChange={handleChange} />

      <label htmlFor="c_cd"> Cコード</label>
      <input id="c_cd" type="text" maxLength={5} value={formData.c_cd} onChange={handleChange} />

      <br />
      <label htmlFor="title"> 題　名</label>
      <input id="title" type="text" size={100} value={formData.title} onChange={handleChange} />

      <br />
      <label htmlFor="original_title"> 原題名</label>
      <input id="original_title" type="text" size={100} value={formData.original_title} onChange={handleChange} />

      <br />
      <label htmlFor="colophon"> 奥　付</label>
      <textarea id="colophon" cols={70} rows={4} value={formData.colophon} onChange={handleChange}></textarea>

      <br />
      <label htmlFor="publisher"> 出版社</label>
      <input id="publisher" type="text" value={formData.publisher} onChange={handleChange} />

      <label htmlFor="publish_series"> 出版シリーズ</label>
      <input id="publish_series" type="text" value={formData.publish_series} onChange={handleChange} />

      <label htmlFor="publish_series_no"> シリーズ番号</label>
      <input id="publish_series_no" type="text" value={formData.publish_series_no} onChange={handleChange} />

      <br />
      <label htmlFor="first_publish_year"> 初版年</label>
      <input
        id="first_publish_year"
        type="number"
        min={1900}
        max={9999}
        value={formData.first_publish_year}
        onChange={handleChange}
      />

      <br />
      <label htmlFor="remarks"> 備　考</label>
      <textarea id="remarks" cols={70} rows={4} value={formData.remarks} onChange={handleChange}></textarea>

      <br />
      <label htmlFor="comic_f"> コミック</label>
      <input type="checkbox" id="comic_f" checked={formData.comic_f} onChange={handleChange} />

      <label htmlFor="image_url"> 書影URL</label>
      <input id="image_url" type="text" value={formData.image_url} onChange={handleChange} />

      <br />
      <button type="button" onClick={handleRegister}>
        登録
      </button>
      <button type="button" onClick={handleClear}>
        クリア
      </button>
    </div>
  );
}
