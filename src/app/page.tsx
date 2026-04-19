'use client';

import { useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { supabaseClient } from '@/lib/Client';
import { CommonButton } from '@/components/ui/button';

const styleItems =
  'ml-2 border border-[#ccc] p-1 rounded outline-none hover:border-[#999] focus:border-[#007bff] focus:ring-4 focus:ring-[#007bff]/25';
const screenMinW = 1100; //画面最小幅

const initialFormState = {
  isbn13: '',
  title: '',
  titleSearch: 'top',
  publisher: '',
  publish_series: '',
  role_cd: '',
  person_name: '',
  personSearch: 'top',
  booktype_cd: '',
  limitComic: 'noLimit'
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
  //  const [searchResults, setSearchResults] = useState<any[]>([]);
  //  const [currentIndex, setCurrentIndex] = useState(0);
  const [bookTypes, setBookTypes] = useState<BookTypeMaster[]>([]);
  const [roles, setRoles] = useState<RoleMaster[]>([]);

  // 各ボタンの処理（ホットキー設定は return ,if文より前に書かないとエラーになる）
  // ［検索実行］
  const handleSearch = async () => {
    if (formData.role_cd && !formData.person_name) {
      alert('役割を指定した場合、人（団体）名も入力してください');
      return null;
    }

    // 基本query；子テーブルの検索条件有無により !inner を付加
    const roleInner = formData.person_name ? '!inner' : '';
    const possessInner = formData.booktype_cd ? '!inner' : '';
    let query = supabaseClient.from('books').select(`
      book_id,
      book_role${roleInner}(role_cd, person_name),
      book_possess${possessInner}(booktype_cd)
    `);
    //検索条件の指定に応じてフィルタリング
    if (formData.isbn13) query = query.eq('isbn13', formData.isbn13.replaceAll('-', ''));
    if (formData.title) {
      if (formData.titleSearch === 'top') {
        query = query.ilike('title', `${formData.title}%`);
      } else {
        query = query.ilike('title', `%${formData.title}%`);
      }
    }
    if (formData.publisher) query = query.eq('publisher', formData.publisher);
    if (formData.publish_series) query = query.eq('publish_series', formData.publish_series);
    if (formData.role_cd) query = query.eq('book_role.role_cd', `${formData.role_cd}`);
    if (formData.person_name) {
      if (formData.personSearch === 'top') {
        query = query.ilike('book_role.person_name', `${formData.person_name}%`);
      } else {
        query = query.ilike('book_role.person_name', `%${formData.person_name}%`);
      }
    }
    if (formData.booktype_cd) query = query.eq('book_possess.booktype_cd', formData.booktype_cd);
    if (formData.limitComic === 'comic') {
      query = query.eq('comic_f', true);
    } else {
      if (formData.limitComic === 'nonComic') {
        query = query.eq('comic_f', false);
      }
    }
    const { data, error } = await query;
    //    console.log(data);

    if (error || !data || data.length === 0) {
      alert('該当データがありません');
      return;
    }
    // book_id をカンマ区切りで渡し、結果表示画面を開く
    const ids = data.map((item) => item.book_id).join(',');
    window.open(`/book_edit?ids=${ids}`, '_blank');
  };
  useHotkeys('alt+s', (event) => {
    event.preventDefault(); // ブラウザのデフォルト挙動を防止
    handleSearch();
  });
  // ［検索条件消去］
  const handleErase = () => {
    setFormData(initialFormState);
  };
  useHotkeys('alt+e', (event) => {
    event.preventDefault(); // ブラウザのデフォルト挙動を防止
    handleErase();
  });
  // ［書籍新規登録へ］
  const handleRegist = () => {
    window.open(`/book_regist?`, '_blank');
  };
  useHotkeys('alt+r', (event) => {
    event.preventDefault(); // ブラウザのデフォルト挙動を防止
    handleRegist();
  });
  // ［補助データメンテへ］
  const handleAssistMaint = () => {
    null;
  };
  useHotkeys('alt+m', (event) => {
    event.preventDefault(); // ブラウザのデフォルト挙動を防止
    handleAssistMaint();
  });
  // ［閉じる］
  const handleClose = () => {
    window.close();
  };
  useHotkeys('alt+c', (event) => {
    event.preventDefault(); // ブラウザのデフォルト挙動を防止
    handleClose();
  });

  // 入力変更ハンドラ；一般用
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };
  // 入力変更ハンドラ；ラジオボタン用
  const handleChangeR = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
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
    <div style={{ minWidth: `${screenMinW}px` }} className="w-full">
      <h1 style={{ width: `${screenMinW + 8}px` }} className="text-center text-3xl font-bold underline bg-cyan-500">
        書籍管理
      </h1>
      <div style={{ width: `${screenMinW - 8}px` }} className="flex border-solid border-2 rounded-lg m-4 p-2">
        {/* 左側：書籍検索 */}
        <div className="flex-1 w-[600px] border-solid border-1 rounded-lg m-4 p-2">
          <h2 className="text-center text-xl font-bold text-blue-500 m-2">検索条件</h2>
          <p className="ml-2">
            <label htmlFor="isbn13" className="inline-block w-19">
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
          <p className="mt-2 ml-2">
            <label htmlFor="title" className="inline-block w-19">
              題　名
            </label>
            <input
              id="title"
              className={styleItems}
              type="text"
              size={92}
              value={formData.title}
              onChange={handleChange}
            />
          </p>
          <p className="flex mt-1 ml-22">
            <span className="flex px-2">
              （
              <label className="block ml-1">
                <input
                  type="radio"
                  name="titleSearch"
                  value="top"
                  checked={formData.titleSearch === 'top'}
                  onChange={handleChangeR}
                  className="mr-1"
                />
                先頭一致
              </label>
              <label className="block ml-4">
                <input
                  type="radio"
                  name="titleSearch"
                  value="part"
                  checked={formData.titleSearch === 'part'}
                  onChange={handleChangeR}
                  className="mr-1"
                />
                部分一致
              </label>
              ）
            </span>
          </p>
          <p className="mt-2 ml-2">
            <label htmlFor="publisher" className="inline-block w-19 text-justify">
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
            <span className="ml-2">※不詳の場合はカッコで括り、（不明）（自費出版）等</span>
          </p>
          <p className="mt-2 ml-22">
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
          <p className="mt-2 ml-2 flex">
            <span>
              <label htmlFor="role" className="inline-block w-19">
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
              <span className="flex ml-22">※役割のみの指定は不可</span>
            </span>
            <span>
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
              <span className="flex mt-1 ml-32 px-2">
                （
                <label className="block ml-1">
                  <input
                    type="radio"
                    name="personSearch"
                    value="top"
                    checked={formData.personSearch === 'top'}
                    onChange={handleChangeR}
                    className="mr-1"
                  />
                  先頭一致
                </label>
                <label className="block ml-4">
                  <input
                    type="radio"
                    name="personSearch"
                    value="part"
                    checked={formData.personSearch === 'part'}
                    onChange={handleChangeR}
                    className="mr-1"
                  />
                  部分一致
                </label>
                ）
              </span>
            </span>
          </p>
          <p className="mt-2 ml-2">
            <label htmlFor="booktype" className="inline-block w-19">
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
          <p className="flex mt-2 ml-2">
            <label htmlFor="limitComic" className="inline-block w-19">
              コミック指定
            </label>
            <span className={`${styleItems} flex px-2`}>
              <label className="block ml-1">
                <input
                  type="radio"
                  name="limitComic"
                  value="noLimit"
                  checked={formData.limitComic === 'noLimit'}
                  onChange={handleChangeR}
                  className="mr-1"
                />
                指定なし
              </label>
              <label className="block ml-4">
                <input
                  type="radio"
                  name="limitComic"
                  value="comic"
                  checked={formData.limitComic === 'comic'}
                  onChange={handleChangeR}
                  className="mr-1"
                />
                コミックのみ
              </label>
              <label className="block ml-4">
                <input
                  type="radio"
                  name="limitComic"
                  value="nonComic"
                  checked={formData.limitComic === 'nonComic'}
                  onChange={handleChangeR}
                  className="mr-1"
                />
                非コミックのみ
              </label>
            </span>
          </p>
          <div className="flex mt-2 ml-2 justify-around">
            <CommonButton
              label={
                <>
                  検索実行 (<u>S</u>)
                </>
              }
              variant="blue"
              onClick={handleSearch}
            />
            <CommonButton
              label={
                <>
                  条件消去 (<u>E</u>)
                </>
              }
              variant="outline"
              onClick={handleErase}
            />
          </div>
        </div>

        {/* 右側エリア */}
        <div className="w-[200px] flex flex-col ml-2 p-2 justify-around">
          <CommonButton
            label={
              <>
                書籍新規登録へ (<u>R</u>)
              </>
            }
            variant="blue"
            onClick={handleRegist}
          />
          <CommonButton
            label={
              <>
                補助データメンテへ (<u>M</u>)
              </>
            }
            variant="orange"
            onClick={handleAssistMaint}
            disabled={true}
          />
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
    </div>
  );
}
