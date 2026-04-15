'use client';

import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/Client';
import { CommonButton } from '@/components/ui/button';
// import styles from './page.module.css';

const styleItems =
  'ml-2 border border-[#ccc] p-1 rounded outline-none hover:border-[#999] focus:border-[#007bff] focus:ring-4 focus:ring-[#007bff]/25';

// 初期状態の定義
const initialFormState = {
  isbn13: '',
  title: '',
  publisher: '',
  publish_series: '',
  role_cd: '',
  person_name: '',
  booktype_cd: '',
  comic_f: false
};

type BookTypeMaster = {
  booktype_cd: string;
  booktype: string;
  selectable: boolean;
};

type RoleMaster = {
  role_cd: string;
  role_name: string;
  selectable: boolean;
};

export default function Home() {
  const [formData, setFormData] = useState(initialFormState);
  const [bookTypes, setBookTypes] = useState<BookTypeMaster[]>([]);
  const [roles, setRoles] = useState<RoleMaster[]>([]);

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

  // ボタン［検索実行］の処理
  const handleSearch = () => {
    null;
  };

  // ボタン［検索条件クリア］の処理
  const handleClear = () => {
    setFormData(initialFormState);
  };

  // ボタン［書籍新規登録へ］の処理
  const handleRegist = () => {
    const registUrl = `/book_regist?}`;
    window.open(registUrl, '_blank');
  };

  // ボタン［補助データメンテへ］の処理
  const handleAssistMaint = () => {
    null;
  };

  // ボタン［閉じる］の処理
  const handleClose = () => {
    window.close();
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
  const handleBookType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      booktype_cd: e.target.value // ここでbooktype_cdが取得される
    });
  };

  // 役割マスターの展開・取得
  useEffect(() => {
    const fetchRoles = async () => {
      const { data, error } = await supabaseClient
        .from('role_master')
        .select('*')
        .lte('role_cd', 299)
        .order('role_cd', { ascending: true });
      if (error) {
        console.error('Error fetching role_master:', error);
      } else {
        setRoles(data || []);
      }
    };
    fetchRoles();
  }, []);
  const handleRole = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      role_cd: e.target.value // ここでrole_cdが取得される
    });
  };

  return (
    <div className="min-w-[1100px] w-full">
      <h1 className="w-[1108px] text-center text-3xl font-bold underline bg-cyan-500">書籍管理</h1>
      <div className="flex w-[1092px] border-solid border-2 rounded-lg m-4 p-2">
        {/* 左側：書籍検索 */}
        <div className="flex-1 w-[600px] border-solid border-2 rounded-lg m-4 p-2">
          <h2 className="text-center text-xl font-bold text-blue-500 m-2">書籍検索</h2>
          <p className="ml-2">
            <label htmlFor="isbn13" className="inline-block w-16">
              ISBN-13
            </label>
            <input
              id="isbn13"
              className={styleItems}
              type="text"
              size={17}
              maxLength={17}
              value={formData.isbn13}
              onChange={handleChange}
            />
          </p>
          <p className="ml-2">
            <label htmlFor="title" className="inline-block w-16">
              題　名
            </label>
            <input
              id="title"
              className={styleItems}
              type="text"
              size={94}
              value={formData.title}
              onChange={handleChange}
            />
          </p>
          <p className="ml-2">
            <label htmlFor="publisher" className="inline-block w-16">
              出版社
            </label>
            <input
              id="publisher"
              className={styleItems}
              type="text"
              size={24}
              value={formData.publisher}
              onChange={handleChange}
            />
            &nbsp;※不詳の場合はカッコで括り、（不明）（自費出版）等
          </p>
          <p className="ml-20">
            <span>
              <label htmlFor="publish_series">出版シリーズ</label>
              <input
                id="publish_series"
                className={styleItems}
                type="text"
                size={26}
                value={formData.publish_series}
                onChange={handleChange}
              />
            </span>
          </p>
          <p className="ml-2">
            <label htmlFor="role" className="inline-block w-16">
              役　割
            </label>
            <select id="role" className={styleItems} value={formData.role_cd} onChange={handleRole}>
              <option value="">選択してください</option>
              {roles.map((item) =>
                item.selectable ? (
                  <option key={item.role_cd} value={item.role_cd}>
                    {item.role_name}
                  </option>
                ) : (
                  <option key={item.role_cd} disabled>
                    {item.role_name}
                  </option>
                )
              )}
            </select>
            <label htmlFor="person_name" className="inline-block ml-6">
              人（団体）名
            </label>
            <input
              id="person_name"
              className={styleItems}
              type="text"
              size={38}
              required
              value={formData.person_name}
              onChange={handleChange}
            />
          </p>
          <p className="ml-2">
            <label htmlFor="booktype" className="inline-block w-16">
              書籍種別
            </label>
            <select
              id="booktype"
              className={styleItems}
              required
              value={formData.booktype_cd}
              onChange={handleBookType}
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
          <p className="ml-2">
            <label htmlFor="comic_f" className="inline-block w-16">
              コ ミ ッ ク
            </label>
            <input id="comic_f" className="ml-2" type="checkbox" checked={formData.comic_f} onChange={handleChange} />
          </p>
          <div className="flex ml-2 p-2 justify-around">
            <CommonButton label="検索実行" variant="blue" onClick={handleSearch} />
            <CommonButton label="条件クリア" variant="outline" onClick={handleClear} />
          </div>
        </div>

        {/* 右側エリア */}
        <div className="w-[200px] flex flex-col ml-2 p-2 justify-around">
          <CommonButton label="書籍新規登録へ" variant="blue" onClick={handleRegist} />
          <CommonButton label="補助データメンテへ" variant="orange" onClick={handleAssistMaint} disabled={true} />
          <CommonButton label="閉じる" variant="outline" onClick={handleClose} />
        </div>
      </div>
    </div>
  );
}
