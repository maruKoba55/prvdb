'use client';

import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { supabaseClient } from '@/lib/Client';
import { CommonButton } from '@/components/ui/button';
import { BookForm } from '@/components/BookForm';

const initialFormState = {
  isbn10: '',
  isbn13: '',
  c_cd: '',
  ndc: '',
  title: '',
  original_title: '',
  colophon: '年月日初版発行\n著者：\n翻訳者：\n発行所：',
  publisher: '',
  publish_series: '',
  publish_series_no: '',
  first_publish_year: 0,
  remarks: '',
  comic_f: false,
  image_url: ''
};

// BookForm.tsx とのインターフェース
interface BookFormData {
  isbn10: string;
  isbn13: string;
  c_cd: string;
  ndc: string;
  title: string;
  original_title: string;
  colophon: string;
  publisher: string;
  publish_series: string;
  publish_series_no: string;
  first_publish_year: number;
  remarks: string;
  comic_f: boolean;
  image_url: string;
}

export default function RegistBook() {
  const [formData, setFormData] = useState(initialFormState);
  const [registeredBook, setRegisteredBook] = useState<any>(null);

  // 各ボタンの処理（ホットキー設定は return ,if文より前に書かないとエラーになる）
  // ［基本情報を登録］
  const handleBaseRegist = async () => {
    try {
      const data = await editBookData();
      if (data) {
        setRegisteredBook(data);
        alert(`『${data.title}』（${data.publisher}、${data.first_publish_year}）を登録しました`);
      }
    } catch (error: any) {
      if (error.code === '23505') {
        alert(`『${formData.title}』（${formData.publisher}、${formData.first_publish_year}）は登録済みです`);
      } else {
        console.error(error);
        alert(`登録失敗  code=${error.code} : ${error.message}`);
      }
    }
  };
  // ［役割情報登録へ］
  const handleRole = () => {
    const { book_id, title } = registeredBook;
    const params = new URLSearchParams({
      book_id: book_id.toString(),
      title: title || ''
    });
    window.open(`/MyBooks/role_regist?${params.toString()}`, '_blank', 'width=760,height=420');
  };
  // ［保有情報登録へ］
  const handlePossess = () => {
    const { book_id, title, isbn13 } = registeredBook;
    const params = new URLSearchParams({
      book_id: book_id.toString(),
      title: title || '',
      isbn13: isbn13 || ''
    });
    window.open(`/MyBooks/possess_regist?${params.toString()}`, '_blank', 'width=820,height=520');
  };
  // ［画面初期化］
  const handleErase = () => {
    if (confirm('入力内容をすべて消去しますか？')) {
      setFormData(initialFormState);
      setRegisteredBook(null);
    }
  };
  // ［閉じる］
  const handleClose = () => {
    window.close();
  };
  useHotkeys('alt+c', (event) => {
    event.preventDefault(); // ブラウザのデフォルト挙動を防止
    handleClose();
  });

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
    if (!formData.title.trim() || !formData.publisher.trim() || String(formData.first_publish_year).trim() === '') {
      alert('必須項目が未入力です');
      return null;
    }
    if (formData.first_publish_year > new Date().getFullYear() + 1) {
      alert('初版年を確認してください');
      return null;
    }
    const insertData = {
      ...formData,
      isbn10: formData.isbn10.replaceAll('-', '') || null,
      isbn13: formData.isbn13.replaceAll('-', '') || null,
      c_cd: formData.c_cd || null,
      ndc: formData.ndc || null,
      original_title: formData.original_title || null,
      colophon: formData.colophon || null,
      first_publish_year: formData.first_publish_year || 0,
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

  // フィールド名を指定して値を空にする関数
  const handleEraseField = (field: keyof BookFormData) => {
    setFormData((prev) => ({
      ...prev,
      [field]: ''
    }));
  };

  return (
    <BookForm
      screenTitle="書籍管理"
      bookId={registeredBook ? registeredBook.book_id : ''}
      formData={formData}
      onChange={handleChange}
      onClearField={handleEraseField}
      buttons={
        <>
          <CommonButton label="基本情報を登録" variant="blue" onClick={handleBaseRegist} />
          <CommonButton
            label="役割情報登録へ"
            variant="orange"
            onClick={handleRole}
            disabled={!registeredBook?.book_id}
            title="基本情報の登録後、検索用の著者名などを入力"
          />
          <CommonButton
            label="保有情報登録へ"
            variant="red"
            onClick={handlePossess}
            disabled={!registeredBook?.book_id}
            title="基本情報の登録後、保有する書籍の情報を入力"
          />
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
        </>
      }
    />
  );
}
