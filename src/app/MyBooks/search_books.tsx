'use client';

import { useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { supabaseClient } from '@/lib/Client';
import { BookCopy, BookSearch, CalendarSearch, Eraser, Plus, TextSearch, Toolbox, X } from 'lucide-react';
import { CommonButton } from '@/components/ui/button';
import { styleItems } from '@/app/constants';

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
  limitComic: 'noLimit',
  limitNote: 'noLimit',
  limitPossess: 'noLimit',
  displayOrder: 'publish',
  read_st_from: '',
  read_st_to: '',
  limitComicNote: 'nonComic'
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

export function SearchBooks() {
  const [formData, setFormData] = useState(initialFormState);
  const [bookTypes, setBookTypes] = useState<BookTypeMaster[]>([]);
  const [roles, setRoles] = useState<RoleMaster[]>([]);

  // 各ボタンの処理（ホットキー設定は return ,if文より前に書かないとエラー？）
  // ［書籍検索（個別）］
  const handleBookSearch = async () => {
    if (formData.role_cd && !formData.person_name) {
      alert('役割を指定した場合、人（団体）名も入力してください。');
      return null;
    }
    if (formData.booktype_cd && formData.limitPossess !== 'noLimit') {
      alert('書籍種別と書籍保有の限定条件は同時に指定できません。');
      return null;
    }

    const { data, error } = await supabaseClient.rpc('search_books_complex', {
      p_isbn13: formData.isbn13?.replaceAll('-', '') || null,
      p_title: formData.title || null,
      p_title_search_type: formData.titleSearch,
      p_publisher: formData.publisher || null,
      p_publish_series: formData.publish_series || null,
      p_role_cd: formData.role_cd || null,
      p_person_name: formData.person_name || null,
      p_person_search_type: formData.personSearch,
      p_booktype_cd: formData.booktype_cd || null,
      p_limit_comic: formData.limitComic,
      p_limit_possess: formData.limitPossess,
      p_display_order: formData.displayOrder
    });
    if (error) {
      console.error(error);
      alert(`データ取得失敗 error.code=${(error as any).code || 'unknown'}`);
      return;
    }
    if (!data || data.length === 0) {
      alert('該当データがありません');
      return;
    }
    if (data.length > 50) {
      const confirmed = confirm(
        `該当データが${data.length}件あります。1000件まで表示可能ですが、時間がかかる場合があります。`
      );
      if (!confirmed) return;
    }
    // book_id をカンマ区切りで渡し、結果表示画面を開く
    const ids = data.map((item: any) => item.book_id).join(',');
    window.open(`/MyBooks/book_view?ids=${ids}`, '_blank');
  };
  // ［書籍検索（一覧）］
  const handleBookList = async () => {
    null;
  };
  // ［条件消去］
  const handleErase = () => {
    setFormData(initialFormState);
  };
  // ［ノート検索］
  const handleNoteSearch = () => {
    null;
  };
  // ［未読一覧］
  const handleNonNote = () => {
    null;
  };
  // ［書籍新規登録へ］
  const handleRegist = () => {
    window.open(`/MyBooks/book_regist?`, '_blank');
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

  // 役割マスターの展開・取得
  useEffect(() => {
    const fetchRoles = async () => {
      const { data, error } = await supabaseClient
        .from('role_master')
        .select('*')
        .lte('role_cd', 299) // 分野を「共通」「著作・出版」に限定
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

  return (
    <div style={{ width: `${screenMinW}px` }}>
      <div className="text-center text-3xl font-bold underline bg-cyan-500">書籍管理</div>
      <div className="flex">
        {/* 左側エリア */}
        <div className=" flex-col w-4/5 border-solid border-2 rounded-lg m-3 p-1">
          {/* 左側上段：書籍検索 */}
          <div className="border-solid border-1 rounded-lg m-3 p-2">
            <div className="text-xl font-bold text-blue-500 m-1">書籍検索</div>
            <div className="mt-2 ml-2">
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
            </div>
            <div className="mt-2 ml-2">
              <label htmlFor="title" className="inline-block w-16">
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
            </div>
            <div className="flex mt-1 ml-22">
              <div className="flex px-2">
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
              </div>
            </div>
            <div className="flex items-center mt-2 ml-2">
              <label htmlFor="publisher" className="inline-block w-16 text-justify">
                出版社
              </label>
              <input
                id="publisher"
                className={styleItems}
                type="text"
                size={36}
                value={formData.publisher}
                onChange={handleChange}
              />
              <div className="ml-2">※不詳の場合はカッコで括り、（不明）（自費出版）等</div>
            </div>
            <div className="mt-2 ml-22">
              <div>
                <label htmlFor="publish_series">出版シリーズ</label>
                <input
                  id="publish_series"
                  className={styleItems}
                  type="text"
                  size={40}
                  value={formData.publish_series}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="flex mt-2 ml-2">
              <div>
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
                <div className="flex ml-22">※役割のみの指定は不可</div>
              </div>
              <div>
                <label htmlFor="person_name" className="inline-block ml-6">
                  人（団体）名
                </label>
                <input
                  id="person_name"
                  className={styleItems}
                  type="text"
                  size={40}
                  required
                  value={formData.person_name}
                  onChange={handleChange}
                />
                <div className="flex mt-1 ml-32 px-2">
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
                </div>
              </div>
            </div>
            <div className="mt-2 ml-2">
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
            </div>
            <div className="flex mt-2 ml-2">
              <div className="flex">
                <div className="inline-block w-16 align-top"> 限定条件</div>
                <div className={`${styleItems} ml-2`}>
                  <div>
                    <div className="flex ml-1">
                      <label htmlFor="limitComic" className="inline-block w-18 mr-3">
                        コミック
                      </label>
                      <label className="block w-20">
                        <input
                          type="radio"
                          name="limitComic"
                          value="comic"
                          checked={formData.limitComic === 'comic'}
                          onChange={handleChangeR}
                          className="mr-1"
                        />
                        コミック
                      </label>
                      <label className="block w-23">
                        <input
                          type="radio"
                          name="limitComic"
                          value="nonComic"
                          checked={formData.limitComic === 'nonComic'}
                          onChange={handleChangeR}
                          className="mr-1"
                        />
                        非コミック
                      </label>
                      <label className="block w-20">
                        <input
                          type="radio"
                          name="limitComic"
                          value="noLimit"
                          checked={formData.limitComic === 'noLimit'}
                          onChange={handleChangeR}
                          className="mr-1"
                        />
                        無限定
                      </label>
                    </div>
                  </div>
                  <hr />
                  <div>
                    <div className="flex mt-1 ml-1">
                      <label htmlFor="limitPossess" className="inline-block w-18 mr-3">
                        書籍保有
                      </label>
                      <label className="block w-20">
                        <input
                          type="radio"
                          name="limitPossess"
                          value="possess"
                          checked={formData.limitPossess === 'possess'}
                          onChange={handleChangeR}
                          className="mr-1"
                        />
                        保有中
                      </label>
                      <label className="block w-23">
                        <input
                          type="radio"
                          name="limitPossess"
                          value="nonPossess"
                          checked={formData.limitPossess === 'nonPossess'}
                          onChange={handleChangeR}
                          className="mr-1"
                        />
                        保有せず
                      </label>
                      <label className="block w-20">
                        <input
                          type="radio"
                          name="limitPossess"
                          value="noLimit"
                          checked={formData.limitPossess === 'noLimit'}
                          onChange={handleChangeR}
                          className="mr-1"
                        />
                        無限定
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex ml-4">
                <div>表示順</div>
                <div className={`${styleItems} flex ml-1`}>
                  <label className="block w-20">
                    <input
                      type="radio"
                      name="displayOrder"
                      value="publish"
                      checked={formData.displayOrder === 'publish'}
                      onChange={handleChangeR}
                      className="mr-1"
                    />
                    刊行順
                  </label>
                  <label className="block w-20">
                    <input
                      type="radio"
                      name="displayOrder"
                      value="get"
                      checked={formData.displayOrder === 'get'}
                      onChange={handleChangeR}
                      className="mr-1"
                    />
                    入手順
                  </label>
                </div>
              </div>
            </div>
            <div className="flex mt-2 ml-2 p-2 justify-around">
              <CommonButton
                label={
                  <>
                    <BookSearch size={20} />
                    書籍検索（個別）
                  </>
                }
                variant="blue"
                onClick={handleBookSearch}
              />
              <CommonButton
                label={
                  <>
                    <TextSearch size={20} />
                    書籍検索（一覧）
                  </>
                }
                variant="blue"
                onClick={handleBookList}
              />
              <CommonButton
                label={
                  <>
                    <Eraser size={20} />
                    条件消去
                  </>
                }
                variant="outline"
                onClick={handleErase}
              />
            </div>
          </div>

          {/* 左側下段：読書ノート検索 */}
          <div className="border-solid border-1 rounded-lg m-3 p-2">
            <div className="text-xl font-bold text-blue-500 m-1">読書ノート検索</div>
            <div className="flex mt-2 ml-2">
              <div className="flex items-center">
                <label htmlFor="read_st_date" className="inline-block w-16">
                  読書開始
                </label>
                <input
                  id="read_st_from"
                  className={styleItems}
                  type="date"
                  value={formData.read_st_from}
                  onChange={handleChange}
                />
                <div className="flex ml-1 mr-1">～</div>
                <input
                  id="read_st_to"
                  className={styleItems}
                  type="date"
                  min={formData.read_st_from || ''}
                  value={formData.read_st_to}
                  onChange={handleChange}
                />
              </div>
              <div className={`${styleItems} flex items-center ml-6`}>
                <div className="flex">
                  <label className="block w-20 ml-1">
                    <input
                      type="radio"
                      name="limitComicNote"
                      value="comic"
                      checked={formData.limitComicNote === 'comic'}
                      onChange={handleChangeR}
                      className="mr-1"
                    />
                    コミック
                  </label>
                  <label className="block w-23">
                    <input
                      type="radio"
                      name="limitComicNote"
                      value="nonComic"
                      checked={formData.limitComicNote === 'nonComic'}
                      onChange={handleChangeR}
                      className="mr-1"
                    />
                    非コミック
                  </label>
                  <label className="block w-20">
                    <input
                      type="radio"
                      name="limitComicNote"
                      value="noLimit"
                      checked={formData.limitComicNote === 'noLimit'}
                      onChange={handleChangeR}
                      className="mr-1"
                    />
                    無限定
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-2 ml-4">
              <span className="text-lg text-white bg-blue-500">［ノート検索］</span>
              ：上記条件でノートを一覧表示（個別のノートは該当書籍の閲覧画面から表示、登録）
            </div>
            <div className="mt-2 ml-4">
              <span className="text-lg text-white bg-blue-500">［未読一覧］</span>
              ：読書ノートの存在しない（＝未読）書籍を一覧表示
            </div>
            <div className="flex mt-2 ml-2 p-2 justify-around">
              <CommonButton
                label={
                  <>
                    <CalendarSearch size={20} />
                    ノート検索
                  </>
                }
                variant="blue"
                onClick={handleNoteSearch}
              />
              <CommonButton
                label={
                  <>
                    <BookCopy size={20} />
                    未読一覧
                  </>
                }
                variant="blue"
                onClick={handleNonNote}
              />
            </div>
          </div>
        </div>

        {/* 右側エリア */}
        <div className="flex flex-col w-1/5 border-solid border-2 rounded-lg justify-around my-3 ml-1 p-2">
          <CommonButton
            label={
              <>
                <Plus size={20} />
                新規登録へ (<u>R</u>)
              </>
            }
            variant="orange"
            onClick={handleRegist}
          />
          <CommonButton
            label={
              <>
                <Toolbox size={20} />
                <div>
                  補助データ
                  <br />
                  メンテへ
                </div>
                (<u>M</u>)
              </>
            }
            variant="orange"
            onClick={handleAssistMaint}
            disabled={true}
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
        </div>
      </div>
    </div>
  );
}
