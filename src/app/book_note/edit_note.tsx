'use client';

import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSearchParams } from 'next/navigation';
import { supabaseClient } from '@/lib/Client';
import { CommonButton } from '@/components/ui/button';

const styleItems =
  'ml-2 border border-[#ccc] p-1 rounded outline-none hover:border-[#999] focus:border-[#007bff] focus:ring-4 focus:ring-[#007bff]/25';
const screenMinW = 760; //画面最小幅

// 本日日付（ローカル）
const todayLocal = [
  new Date().getFullYear(),
  String(new Date().getMonth() + 1).padStart(2, '0'),
  String(new Date().getDate()).padStart(2, '0')
].join('-');

const initialFormState = {
  read_st_date: todayLocal,
  read_ed_date: '',
  note: ''
};

export default function EditNote() {
  const searchParams = useSearchParams();
  const bookId = searchParams.get('book_id');
  const title = searchParams.get('title');
  const [formData, setFormData] = useState(initialFormState);
  const [registeredNote, setRegisteredNote] = useState<any>(null);

  // 各ボタンの処理（ホットキー設定は return ,if文より前に書かないとエラーになる）
  // ［読書ノートを登録］
  const handleRegist = async () => {
    try {
      const data = await editNoteData();
      if (data) {
        setRegisteredNote(data); // 画面に表示
        alert('読書ノートを登録しました');
      }
    } catch (error: any) {
      if (
        (error instanceof Error && (error as any).code === '23505') ||
        (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505')
      ) {
        alert('このデータは登録済みです');
      } else {
        console.error(error);
        alert(`登録失敗（Insert to Table 'book_role' error.code=${(error as any).code || 'unknown'}）`);
      }
    }
  };
  // ［画面初期化］
  const handleErase = () => {
    setFormData(initialFormState);
    setRegisteredNote(null);
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

  // 画面内容をTable 'book_note' へ登録
  const editNoteData = async () => {
    if (!formData.read_st_date.trim()) {
      alert('必須項目が未入力です');
      return null;
    }
    if (formData.read_ed_date && formData.read_ed_date < formData.read_st_date) {
      alert('読書終了を確認してください');
      return null;
    }

    const insertData = {
      book_id: bookId || null,
      read_st_date: formData.read_st_date || null,
      read_ed_date: formData.read_ed_date || null,
      note: formData.note || null
    };
    const { data, error } = await supabaseClient.from('book_note').insert([insertData]).select();
    if (error) throw error;
    return data ? data[0] : null;
  };

  return (
    <div style={{ minWidth: `${screenMinW}px` }} className="w-full">
      <h1 style={{ width: `${screenMinW + 8}px` }} className="text-center text-3xl font-bold underline bg-cyan-500">
        書籍管理
      </h1>
      <div style={{ width: `${screenMinW - 8}px` }} className="border-solid border-2 rounded-lg flex m-4 p-2">
        {/* 入力フォーム */}
        <div className="flex-1">
          <p>
            <span className="text-xl font-bold text-blue-500 m-2">読書ノート</span>
            <span className="text-xl font-bold text-gray-500 ml-1">{title ? `『${title}』` : ''}</span>
            <span className="text-gray-500">{bookId ? `（書籍ID：${bookId}）` : ''}</span>
          </p>
          <p className="ml-6">
            （<span className="font-bold text-orange-500">オレンジ色</span>項目は入力必須）
          </p>
          <p className="mt-1 ml-2">
            <label htmlFor="read_st_date" className="inline-block w-16 font-bold text-orange-500">
              読書開始
            </label>
            <input
              id="read_st_date"
              className={styleItems}
              type="date"
              required
              value={formData.read_st_date}
              onChange={handleChange}
            />
            <span className="ml-1">※不明の場合 ･･･ 1/1/1</span>
          </p>
          <p className="mt-1 ml-2">
            <label htmlFor="read_ed_date" className="inline-block w-16">
              読書終了
            </label>
            <input
              id="read_ed_date"
              className={styleItems}
              type="date"
              value={formData.read_ed_date}
              onChange={handleChange}
            />
            <span className="ml-1">※不明の場合 ･･･ 読書開始と同日</span>
          </p>
          <p className="mt-1 ml-2">
            <label htmlFor="note" className="inline-block  w-16 align-top text-justify">
              ノ ー ト
            </label>
            <textarea
              id="note"
              className={`{${styleItems} ml-2`}
              cols={80}
              rows={4}
              value={formData.note}
              onChange={handleChange}
            ></textarea>
          </p>
        </div>
      </div>

      {/* ボタンエリア */}
      <div className="flex m-2 justify-around">
        <CommonButton label="読書ノートを登録" variant="blue" onClick={handleRegist} />
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
  );
}
