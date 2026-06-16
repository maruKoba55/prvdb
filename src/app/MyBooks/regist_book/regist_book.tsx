'use client';

import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseClient } from '@/lib/Client';
import { Eraser, Save, X } from 'lucide-react';
import { CommonButton } from '@/components/ui/button';
import { isbnHyphenate } from '@/utils/isbnHyphenate';
import { useBookClassMaster } from '@/context/AppContext';
import { BookForm, BookFormData } from '@/app/MyBooks/BookForm';

export default function RegistBook() {
  // マスタ値取得（カスタムフック）
  const bookClassMaster = useBookClassMaster();
  const defaultClassCd = bookClassMaster.find((item: any) => item.selectable)?.bookclass_cd || '';

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
    bookclass_cd: defaultClassCd,
    remarks: '',
    image_url: ''
  };

  const supabase = supabaseClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = searchParams.get('user');
  const [formData, setFormData] = useState(initialFormState);
  const [registeredBook, setRegisteredBook] = useState<any>(null);

  // 各ボタンの処理
  // ［基本情報を登録］
  const handleBaseRegist = async () => {
    try {
      const data = await editBookData();
      if (data) {
        setRegisteredBook(data);
        if (
          confirm(
            `『${data.title}』（${data.publisher}、${data.first_publish_year}）を登録しました。編集画面に移動します。`
          )
        ) {
          const params = new URLSearchParams({
            book_id: data?.book_id.toString() || '',
            user: user || ''
          });
          window.open(`/MyBooks/edit_book?${params.toString()}`, '_blank', 'width=1110,height=880');
          window.close();
        }
      }
    } catch (error: any) {
      if (error.code === '23505') {
        alert(`『${formData.title}』（${formData.publisher}、${formData.first_publish_year}）は既に登録されています。`);
      } else {
        console.error(error);
        alert(`登録失敗  code=${error.code} : ${error.message}`);
      }
    }
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

  // 入力変更ハンドラ
  // 汎用；チェックボックスの場合はchecked、それ以外はvalueを格納
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev: any) => ({
      ...prev, // 元のデータをすべてコピー
      [id]: type === 'checkbox' ? checked : value // 新しい値で上書き
    }));
  };
  // 関数を介する項目用（ISBN等）
  const handleChangeF = (id: any, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [id]: value
    }));
  };
  // 書籍分類セレクト用
  const handleBookClass = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      bookclass_cd: e.target.value
    });
  };

  // 指定フィールドを消去する関数
  const handleEraseField = (field: keyof BookFormData) => {
    setFormData((prev) => ({
      ...prev,
      [field]: ''
    }));
  };

  // 画面内容をTable 'books' へ登録
  const editBookData = async () => {
    if (
      !formData.title.trim() ||
      !formData.publisher.trim() ||
      String(formData.first_publish_year).trim() === '' ||
      !formData.bookclass_cd.trim()
    ) {
      alert('必須項目が未入力です。');
      return null;
    }
    if (formData.first_publish_year > new Date().getFullYear() + 1) {
      alert('初版年を確認してください。');
      return null;
    }

    if (formData.isbn10 && !formData.isbn13 && isbnHyphenate(formData.isbn10)) {
      if (confirm('ISBN-10を変換してISBN-13としますか？')) {
        formData.isbn13 = isbnHyphenate(formData.isbn10) ?? '';
        router.refresh();
      }
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
      bookclass_cd: formData.bookclass_cd || null,
      remarks: formData.remarks || null,
      image_url: formData.image_url || null,
      user_id: user || null
    };

    // Table 'books'にinsertし、その内容を取得
    const { data, error } = await supabase.from('books').insert([insertData]).select();
    if (error) throw error;
    return data ? data[0] : null;
  };

  return (
    <div>
      <BookForm
        screenTitle="書籍管理（登録）"
        bookId={registeredBook ? registeredBook.book_id : ''}
        formData={formData}
        bookClassMaster={bookClassMaster}
        onChange={handleChange}
        onChangeF={handleChangeF}
        onChangeS={handleBookClass}
        onClearField={handleEraseField}
        buttons={
          <>
            <CommonButton
              label={
                <>
                  <Save size={20} />
                  基本情報を保存
                </>
              }
              variant="blue"
              onClick={handleBaseRegist}
            />
            <CommonButton
              label={
                <>
                  <Eraser size={20} />
                  画面初期化
                </>
              }
              variant="outline"
              onClick={handleErase}
            />
            <CommonButton
              label={
                <>
                  <X size={20} />
                  閉じる (<u>C</u>)
                </>
              }
              variant="outline"
              onClick={handleClose}
            />
          </>
        }
      />
    </div>
  );
}
