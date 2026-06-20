'use client';

import { useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { supabaseClient } from '@/lib/Client';
import { BookSearch, BookX, CalendarSearch, Eraser, LogIn, LogOut, Plus, TextSearch, Toolbox } from 'lucide-react';
import { EditProfile } from '@/components/editProfile';
import { CommonButton } from '@/components/ui/button';
import { useSystemConstant, useBookRoleMaster, useBookClassMaster, useBookFormMaster } from '@/context/AppContext';
import { isbnHyphenate } from '@/utils/isbnHyphenate';
import { styleItems } from '@/app/constants';

const initialFormState = {
  isbn13: '',
  title: '',
  titleSearch: 'top',
  publisher: '',
  publish_series: '',
  role_cd: '',
  person_name: '',
  personSearch: 'top',
  bookclass_cd: '',
  bookform_cd: '',
  limitPossess: 'noLimit',
  bookOrder: 'publish',
  read_st_from: '',
  read_st_to: ''
};

export function SearchBooks() {
  const supabase = supabaseClient();
  const [formData, setFormData] = useState(initialFormState);

  // ユーザー取得
  const [user, setUser] = useState<string | null>(null);
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data && data.user) setUser(data.user.id);
    };
    fetchUser();
  }, []);

  // システム変数、各種マスタ取得（カスタムフック）
  const sqlLimit = parseInt(useSystemConstant('sqlLimit') as string) || 0;
  const supabaseMaxRows = parseInt(useSystemConstant('supabaseMaxRows') as string) || 0;
  const bookRoleMaster = useBookRoleMaster();
  const bookClassMaster = useBookClassMaster();
  const bookFormMaster = useBookFormMaster();

  //検索件数上限の設定
  let dbSearchMax = 0;
  if (sqlLimit === 0) {
    dbSearchMax = supabaseMaxRows;
  } else if (supabaseMaxRows === 0) {
    dbSearchMax = sqlLimit;
  } else if (sqlLimit < supabaseMaxRows) {
    dbSearchMax = sqlLimit;
  } else {
    dbSearchMax = supabaseMaxRows;
  }

  // 書籍検索条件の組合せチェック
  const SearchChk = (formData: any) => {
    if (formData.role_cd && !formData.person_name) {
      alert('役割を指定した場合、人（団体）名も入力してください。');
      return null;
    }
    if (formData.bookform_cd && formData.limitPossess !== 'noLimit') {
      alert('書籍形態と書籍保有は同時に指定できません。');
      return null;
    }
    if (formData.read_st_from && formData.read_st_to && formData.read_st_from > formData.read_st_to) {
      alert('読書開始と終了の日付が逆転しています。');
      return null;
    }
    return true;
  };

  // 各ボタンの処理
  // ［書籍検索（個別）］ ※書名等は空白を除去
  const handleBookSearch = async () => {
    if (!SearchChk(formData)) return;
    const windowName = `view_book_window_${formData.isbn13?.replaceAll('-', '')}${formData.title.replace(/\s+/g, '')}${formData.titleSearch}${formData.publisher.replace(/\s+/g, '')}${formData.publish_series.replace(/\s+/g, '')}${formData.role_cd}${formData.person_name.replace(/\s+/g, '')}${formData.personSearch}${formData.bookclass_cd}${formData.bookform_cd}${formData.limitPossess}${formData.bookOrder}`;
    const params = new URLSearchParams({
      isbn13: formData.isbn13?.replaceAll('-', '') || '',
      title: formData.title.replace(/\s+/g, '') || '',
      title_search_type: formData.titleSearch || '',
      publisher: formData.publisher.replace(/\s+/g, '') || '',
      publish_series: formData.publish_series.replace(/\s+/g, '') || '',
      role_cd: formData.role_cd || '',
      person_name: formData.person_name.replace(/\s+/g, '') || '',
      person_search_type: formData.personSearch,
      bookclass_cd: formData.bookclass_cd || '',
      bookform_cd: formData.bookform_cd || '',
      limit_possess: formData.limitPossess || '',
      display_order: formData.bookOrder || '',
      sqlLimit: sqlLimit.toString() || '0',
      user: user || ''
    });
    const win = window.open(`/MyBooks/view_book?${params.toString()}`, windowName, 'width=1110,height=880');
    if (win) win.focus();
  };
  // ［書籍検索（一覧）］ ※書名等は空白を除去
  const handleBookList = async () => {
    if (!SearchChk(formData)) return;
    const windowName = `list_book_window_${formData.isbn13?.replaceAll('-', '')}${formData.title.replace(/\s+/g, '')}${formData.titleSearch}${formData.publisher.replace(/\s+/g, '')}${formData.publish_series.replace(/\s+/g, '')}${formData.role_cd}${formData.person_name.replace(/\s+/g, '')}${formData.personSearch}${formData.bookclass_cd}${formData.bookform_cd}${formData.limitPossess}${formData.bookOrder}`;
    const params = new URLSearchParams({
      isbn13: formData.isbn13?.replaceAll('-', '') || '',
      title: formData.title.replace(/\s+/g, '') || '',
      title_search_type: formData.titleSearch || '',
      publisher: formData.publisher.replace(/\s+/g, '') || '',
      publish_series: formData.publish_series.replace(/\s+/g, '') || '',
      role_cd: formData.role_cd || '',
      person_name: formData.person_name.replace(/\s+/g, '') || '',
      person_search_type: formData.personSearch,
      bookclass_cd: formData.bookclass_cd || '',
      bookform_cd: formData.bookform_cd || '',
      limit_possess: formData.limitPossess || '',
      display_order: formData.bookOrder || '',
      sqlLimit: sqlLimit.toString() || '0'
    });
    const win = window.open(`/MyBooks/list_book?${params.toString()}`, windowName, 'width=1080,height=600');
    if (win) win.focus();
  };
  // ［条件消去］
  const handleErase = () => {
    setFormData({
      ...initialFormState, // 全項目を初期化
      read_st_from: formData.read_st_from, // 現在の値を上書き（保持）
      read_st_to: formData.read_st_to
    });
  };
  // ［ノート検索］ ※書名等は空白を除去
  const handleNoteSearch = () => {
    formData.limitPossess = 'noLimit'; //書籍保有の限定条件は無効
    if (!SearchChk(formData)) return;
    const windowName = `list_note_range_window_${formData.read_st_from}${formData.read_st_to}${formData.isbn13?.replaceAll('-', '')}${formData.title.replace(/\s+/g, '')}${formData.titleSearch}${formData.publisher.replace(/\s+/g, '')}${formData.publish_series.replace(/\s+/g, '')}${formData.role_cd}${formData.person_name.replace(/\s+/g, '')}${formData.personSearch}${formData.bookclass_cd}${formData.bookform_cd}`;
    const params = new URLSearchParams({
      read_st_from: formData.read_st_from || '0001-01-01',
      read_st_to: formData.read_st_to || '9999-12-31',
      isbn13: formData.isbn13?.replaceAll('-', '') || '',
      title: formData.title.replace(/\s+/g, '') || '',
      title_search_type: formData.titleSearch || '',
      publisher: formData.publisher.replace(/\s+/g, '') || '',
      publish_series: formData.publish_series.replace(/\s+/g, '') || '',
      role_cd: formData.role_cd || '',
      person_name: formData.person_name.replace(/\s+/g, '') || '',
      person_search_type: formData.personSearch,
      bookclass_cd: formData.bookclass_cd || '',
      bookform_cd: formData.bookform_cd || ''
    });
    const win = window.open(`/MyBooks/list_note_range?${params.toString()}`, windowName, 'width=840,height=600');
    if (win) win.focus();
  };
  // ［未読一覧］ ※書名等は空白を除去
  const handleUnRead = () => {
    formData.limitPossess = 'noLimit'; //書籍保有の限定条件は無効
    if (!SearchChk(formData)) return;
    const windowName = `list_book_unread_window_${formData.isbn13?.replaceAll('-', '')}${formData.title.replace(/\s+/g, '')}${formData.titleSearch}${formData.publisher.replace(/\s+/g, '')}${formData.publish_series.replace(/\s+/g, '')}${formData.role_cd}${formData.person_name.replace(/\s+/g, '')}${formData.personSearch}${formData.bookclass_cd}${formData.bookform_cd}${formData.bookOrder}`;
    const params = new URLSearchParams({
      isbn13: formData.isbn13?.replaceAll('-', '') || '',
      title: formData.title.replace(/\s+/g, '') || '',
      title_search_type: formData.titleSearch || '',
      publisher: formData.publisher.replace(/\s+/g, '') || '',
      publish_series: formData.publish_series.replace(/\s+/g, '') || '',
      role_cd: formData.role_cd || '',
      person_name: formData.person_name.replace(/\s+/g, '') || '',
      person_search_type: formData.personSearch,
      bookclass_cd: formData.bookclass_cd || '',
      bookform_cd: formData.bookform_cd || '',
      display_order: formData.bookOrder || '',
      sqlLimit: sqlLimit.toString() || '0'
    });
    const win = window.open(`/MyBooks/list_book_unread?${params.toString()}`, windowName, 'width=1080,height=600');
    if (win) win.focus();
  };
  // ［書籍新規登録］
  const handleRegist = () => {
    if (bookClassMaster.length === 0) {
      alert('書籍に割り当てる【分類】が存在しません。書籍新規登録の前に、［データメンテ］から分類を追加してください。');
      return;
    }
    const params = new URLSearchParams({
      user: user || ''
    });
    const win = window.open(`/MyBooks/regist_book?${params.toString()}`, 'regist_book_window', 'width=1120,height=640');
    if (win) win.focus();
  };
  useHotkeys('alt+r', (event) => {
    event.preventDefault(); // ブラウザのデフォルト挙動を防止
    handleRegist();
  });
  // ［データメンテ］
  const handleDataMaint = () => {
    const params = new URLSearchParams({
      user: user || ''
    });
    const win = window.open(`/MyBooks/data_maintenance?${params.toString()}`, 'data_maintenance_window');
    if (win) win.focus();
  };
  useHotkeys('alt+m', (event) => {
    event.preventDefault();
    handleDataMaint();
  });
  // ［閉じる］
  const handleClose = () => {
    window.close();
  };
  useHotkeys('alt+c', (event) => {
    event.preventDefault();
    handleClose();
  });
  // ［ログアウト］
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/'; // トップに戻して再認証を促す
  };
  useHotkeys('alt+o', (event) => {
    event.preventDefault();
    handleLogout();
  });

  // 入力変更ハンドラ
  // 汎用；チェックボックスの場合はchecked、それ以外はvalueを格納
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };
  // ラジオボタン用
  const handleChangeR = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };
  // 関数を介する項目（ISBN等）用
  const handleChangeF = (id: any, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [id]: value
    }));
  };
  // 役割マスタ select用
  const handleRole = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      role_cd: e.target.value // ここでrole_cdが取得される
    });
  };
  // 書籍分類マスタ select用
  const handleBookClass = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      bookclass_cd: e.target.value // ここでbookclass_cdが取得される
    });
  };
  // 書籍形態マスタ select用
  const handleBookForm = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      bookform_cd: e.target.value // ここでbookform_cdが取得される
    });
  };

  const screenMinW = 1100; //画面最小幅

  return (
    <div style={{ width: `${screenMinW}px` }}>
      <div className="text-center text-3xl font-bold underline bg-cyan-500">書籍管理</div>
      <div className="flex">
        {/* 左側エリア */}
        <div className=" flex-col w-4/5 border-solid border-2 rounded-lg m-3 p-1">
          {/* 左側上段：書籍検索 */}
          <div className="border-solid border-1 rounded-lg m-3 p-2">
            <div className="text-xl font-bold text-blue-500 m-1">書籍検索</div>
            <div className="flex items-center mt-2 ml-2">
              <label htmlFor="isbn13" className="inline-block w-16">
                ISBN-13
              </label>
              <input
                id="isbn13"
                className={styleItems}
                type="text"
                size={16}
                maxLength={17}
                value={isbnHyphenate(formData.isbn13) ?? formData.isbn13 ?? ''}
                onChange={handleChange}
                onBlur={(e) => {
                  const formatted = isbnHyphenate(formData.isbn13);
                  if (formatted) {
                    handleChangeF('isbn13', formatted);
                  }
                }}
              />
              {formData.isbn13 && !isbnHyphenate(formData.isbn13) ? <div className="text-red-500 ml-1">?</div> : null}
            </div>
            <div className="flex items-center mt-2 ml-2">
              <label htmlFor="title" className="inline-block w-16">
                書　名
              </label>
              <input
                id="title"
                className={styleItems}
                type="text"
                size={76}
                value={formData.title}
                onChange={handleChange}
              />
            </div>
            <div className="flex mt-1 ml-22">
              <div className="flex px-2">
                <label className="block ml-1">
                  <input
                    type="radio"
                    name="titleSearch"
                    value="top"
                    checked={formData.titleSearch === 'top'}
                    onChange={handleChangeR}
                    className="mr-1"
                  />
                  から始まる（先頭一致）
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
                  を含む（部分一致）
                </label>
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
              <span className="ml-2">から始まる（先頭一致）</span>
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
                <span className="ml-2">から始まる（先頭一致）</span>
              </div>
            </div>
            <div className="flex mt-2 ml-2">
              <div>
                <label htmlFor="role" className="inline-block w-16">
                  役　割
                </label>
                <select id="role" className={styleItems} value={formData.role_cd} onChange={handleRole}>
                  <option value="">選択してください</option>
                  {bookRoleMaster.map((item: any) =>
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
                  size={42}
                  required
                  value={formData.person_name}
                  onChange={handleChange}
                />
                <div className="flex mt-1 ml-32 px-2">
                  <label className="block ml-1">
                    <input
                      type="radio"
                      name="personSearch"
                      value="top"
                      checked={formData.personSearch === 'top'}
                      onChange={handleChangeR}
                      className="mr-1"
                    />
                    から始まる（先頭一致）
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
                    を含む（部分一致）
                  </label>
                </div>
              </div>
            </div>
            <div className="flex mt-3 ml-2">
              <div className="flex items-center">
                <label htmlFor="bookclass" className="inline-block w-16">
                  書籍分類
                </label>
                <select
                  id="bookclass"
                  className={styleItems}
                  required
                  value={formData.bookclass_cd}
                  onChange={handleBookClass}
                >
                  <option value="">選択してください</option>
                  {bookClassMaster.map((item: any) =>
                    item.selectable ? (
                      <option key={item.bookclass_cd} value={item.bookclass_cd}>
                        {item.bookclass}
                      </option>
                    ) : (
                      <option key={item.bookclass_cd} disabled>
                        {item.bookclass}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div className="flex items-center ml-42">
                <label htmlFor="bookform" className="inline-block w-16">
                  書籍形態
                </label>
                <select
                  id="bookform"
                  className={styleItems}
                  required
                  value={formData.bookform_cd}
                  onChange={handleBookForm}
                >
                  <option value="">選択してください</option>
                  {bookFormMaster.map((item: any) =>
                    item.selectable ? (
                      <option key={item.bookform_cd} value={item.bookform_cd}>
                        {item.bookform}
                      </option>
                    ) : (
                      <option key={item.bookform_cd} disabled>
                        {item.bookform}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
            <div className="flex mt-2 ml-2">
              <div className="flex items-center">
                <label htmlFor="limitPossess" className="inline-block w-16">
                  書籍保有
                </label>
                <div className={`${styleItems} flex ml-2`}>
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
              <div className="border-solid border-1 rounded-lg flex ml-44 p-1 items-center bg-yellow-200">
                <label htmlFor="bookOrder" className="inline-block ml-2">
                  表示順：
                </label>
                <div className="flex ml-2">
                  <label className="block w-20">
                    <input
                      type="radio"
                      name="bookOrder"
                      value="publish"
                      checked={formData.bookOrder === 'publish'}
                      onChange={handleChangeR}
                      className="mr-1"
                    />
                    刊行順
                  </label>
                  <label className="block w-20">
                    <input
                      type="radio"
                      name="bookOrder"
                      value="get"
                      checked={formData.bookOrder === 'get'}
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
            <div className="m-1">
              <span className="text-xl font-bold text-blue-500">読書ノート・未読書籍検索</span>
              <span className="ml-3">※ノートの登録・削除は当該書籍の閲覧画面から</span>
            </div>
            <div className="flex mt-2 ml-3">
              <div className="flex items-center">
                <CommonButton
                  label={
                    <>
                      <CalendarSearch size={20} />
                      ノート一覧
                    </>
                  }
                  variant="blue"
                  onClick={handleNoteSearch}
                />
                <div className="flex items-center">
                  ：書籍検索条件（
                  <span className="underline underline-offset-3">書籍保有、表示順を除く</span>
                  ）＋読書開始日でノートを一覧・編集
                </div>
              </div>
            </div>
            <div className="flex items-center ml-36">
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
            <div className="flex mt-2 ml-3">
              <div className="flex items-center">
                <CommonButton
                  label={
                    <>
                      <BookX size={20} />
                      未読一覧
                    </>
                  }
                  variant="blue"
                  onClick={handleUnRead}
                />
                <div className="flex items-center">：</div>
                <div className="flex  flex-col justify-center">
                  <div className="flex">
                    書籍検索条件（<span className="underline underline-offset-3">書籍保有を除く</span>
                    ）でノート未存在の書籍を一覧表示
                  </div>
                  <div className="flex ml-2">（保有履歴の無い書籍は対象外）</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右側エリア */}
        <div className="flex flex-col w-1/5 flex-1">
          {/* 右側上段：検索件数制限 */}
          <div className="flex flex-col border-solid border-2 rounded-lg h-1/8 mt-3 mr-1 p-2 flex items-center justify-center">
            <div className="text-lg font-bold text-red-500">データ検索数上限</div>
            {dbSearchMax === 0 ? <div>supabaseによる制限あり</div> : <div>{dbSearchMax}件</div>}
          </div>
          {/* 右側中段：ボタンエリア */}
          <div className="flex flex-col border-solid border-2 rounded-lg h-4/8 justify-around mt-3 mr-1 p-1">
            <CommonButton
              label={
                <>
                  <Plus size={20} />
                  書籍新規登録(<u>R</u>)
                </>
              }
              variant="orange"
              onClick={handleRegist}
            />
            <CommonButton
              label={
                <>
                  <Toolbox size={20} />
                  データメンテ (<u>M</u>)
                </>
              }
              variant="orange"
              onClick={handleDataMaint}
              disabled={false}
            />
            {/* window.close()は window.openで開いたウィンドウ以外に無効のため、ボタンを見せない
          <CommonButton
            label={
              <>
                <X size={20} />
                閉じる (<u>C</u>)
              </>
            }
            variant="outline"
            onClick={handleClose}
          />  */}
          </div>
          {/* 右側下段：ユーザー ＆ ログアウト */}
          <div className="flex flex-col flex-1 border-solid border-2 rounded-lg justify-around my-3 mr-1 p-1">
            {user ? (
              <div className="flex flex-col">
                <div className="flex justify-center text-lg my-2">ログイン中</div>
                <div className="flex justify-center">
                  <EditProfile user={user} />
                </div>
                <div className="flex justify-center mt-6">
                  <CommonButton
                    label={
                      <>
                        <LogOut size={20} />
                        ログアウト (<u>O</u>)
                      </>
                    }
                    variant="outline"
                    onClick={handleLogout}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="flex justify-center text-lg my-2">ログインしていません</div>
                <div className="flex justify-center mt-6">
                  <CommonButton
                    label={
                      <>
                        <LogIn size={20} />
                        ログイン
                      </>
                    }
                    variant="outline"
                    // もしログイン中にも関わらずuserを認識できていないならば
                    // いったんログアウトしてトップ画面に戻す
                    onClick={handleLogout}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
