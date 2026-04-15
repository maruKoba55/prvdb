import React from 'react';
import { toWarekiYear } from '@/utils/toWarekiYear';

export type BookFormData = {
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
};

type Props = {
  screenTitle: string; // 画面の見出し
  bookId: string; // 表示対象の書籍ID
  formData: BookFormData;
  isReadOnly?: boolean; // 表示専用モード
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onClearField?: (field: keyof BookFormData) => void; //入力内容消去ボタン用
  extraFields?: React.ReactNode; // 追加表示項目
  buttons?: React.ReactNode; // ボタンエリア
};

const styleItems =
  'ml-2 border border-[#ccc] p-1 rounded outline-none hover:border-[#999] focus:border-[#007bff] focus:ring-4 focus:ring-[#007bff]/25';

export const BookForm = ({
  screenTitle,
  bookId,
  formData,
  isReadOnly = false,
  onChange,
  onClearField,
  extraFields,
  buttons
}: Props) => {
  return (
    <div className="min-w-[1100px] w-full">
      <h1 className="w-[1108px] text-center text-3xl font-bold underline bg-cyan-500">{screenTitle}</h1>
      <div className="w-[1092px] border-solid border-2 rounded-lg m-4 p-2">
        <div className="flex">
          {/* 左側：入力フォーム */}
          <div className="flex-1">
            <p className="flex ml-2">
              <span className="text-xl font-bold text-blue-500">書籍基本情報</span>
              <span className="text-gray-500">（書籍ID：{bookId ? bookId : '---'}）</span>
            </p>
            <p className="ml-6">
              （<span className="font-bold text-orange-500">オレンジ色</span>項目は入力必須）
            </p>
            <p className="ml-2">
              <span>
                <label htmlFor="isbn10" className="inline-block w-15">
                  ISBN-10
                </label>
                <input
                  id="isbn10"
                  className={styleItems}
                  type="text"
                  size={13}
                  maxLength={13}
                  readOnly={isReadOnly}
                  value={formData.isbn10}
                  onChange={onChange}
                />
              </span>
              <span className="ml-4">
                <label htmlFor="isbn13">ISBN-13</label>
                <input
                  id="isbn13"
                  className={styleItems}
                  type="text"
                  size={17}
                  maxLength={17}
                  readOnly={isReadOnly}
                  value={formData.isbn13}
                  onChange={onChange}
                />
              </span>
              <span className="ml-4">
                <label htmlFor="c_cd">Cコード</label>
                <input
                  id="c_cd"
                  className={styleItems}
                  type="text"
                  size={5}
                  maxLength={5}
                  readOnly={isReadOnly}
                  value={formData.c_cd}
                  onChange={onChange}
                />
              </span>
              <span className="ml-4">
                <label htmlFor="ndc">十進分類</label>
                <input
                  id="ndc"
                  className={styleItems}
                  type="text"
                  size={10}
                  maxLength={10}
                  readOnly={isReadOnly}
                  value={formData.ndc}
                  onChange={onChange}
                />
              </span>
            </p>
            <p className="ml-2">
              <label htmlFor="title" className="inline-block w-15 font-bold text-orange-500">
                題　名
              </label>
              <input
                id="title"
                className={styleItems}
                type="text"
                required
                size={94}
                readOnly={isReadOnly}
                value={formData.title}
                onChange={onChange}
              />
            </p>
            <p className="ml-2">
              <label htmlFor="original_title" className="inline-block w-15">
                原題名
              </label>
              <input
                id="original_title"
                className={styleItems}
                type="text"
                size={94}
                readOnly={isReadOnly}
                value={formData.original_title}
                onChange={onChange}
              />
            </p>
            <p className="ml-2">
              <span>
                <label htmlFor="colophon" className="inline-block w-15 align-top">
                  奥　付
                </label>
                <textarea
                  id="colophon"
                  className={styleItems}
                  cols={80}
                  rows={4}
                  readOnly={isReadOnly}
                  value={formData.colophon}
                  onChange={onChange}
                ></textarea>
              </span>
              <span className="ml-2 align-top">
                {!isReadOnly ? (
                  <button
                    type="button"
                    className="py-2 px-3 text-base rounded-md font-semibold bg-blue-300"
                    onClick={() => onClearField?.('colophon')}
                  >
                    奥付消去
                  </button>
                ) : null}
              </span>
            </p>
            <p className="ml-2">
              <label htmlFor="publisher" className="inline-block w-15 font-bold text-orange-500">
                出版社
              </label>
              <input
                id="publisher"
                className={styleItems}
                type="text"
                required
                size={24}
                readOnly={isReadOnly}
                value={formData.publisher}
                onChange={onChange}
              />
              &nbsp;※不詳の場合はカッコで括り、（不明）（自費出版）等
            </p>
            <p className="ml-19">
              <span>
                <label htmlFor="publish_series">出版シリーズ</label>
                <input
                  id="publish_series"
                  className={styleItems}
                  type="text"
                  size={26}
                  readOnly={isReadOnly}
                  value={formData.publish_series}
                  onChange={onChange}
                />
              </span>
              <span>
                <label htmlFor="publish_series_no" className="ml-4">
                  シリーズ番号
                </label>
                <input
                  id="publish_series_no"
                  className={styleItems}
                  type="text"
                  size={8}
                  readOnly={isReadOnly}
                  value={formData.publish_series_no}
                  onChange={onChange}
                />
              </span>
            </p>
            <p className="ml-2">
              <label htmlFor="first_publish_year" className="inline-block w-15 font-bold text-orange-500">
                初版年
              </label>
              <input
                id="first_publish_year"
                className={styleItems}
                type="number"
                required
                size={4}
                min={0}
                max={9999}
                readOnly={isReadOnly}
                value={formData.first_publish_year}
                onChange={onChange}
              />
              {toWarekiYear(parseInt(String(formData.first_publish_year))) //nullでない＝和暦変換成功
                ? formData.first_publish_year && (
                    <span>（{toWarekiYear(parseInt(String(formData.first_publish_year)) || 0)}）</span>
                  )
                : null}
              &nbsp;※不詳の場合は 0（zero）
            </p>
            <p className="ml-2">
              <label htmlFor="remarks" className="inline-block w-15 align-top">
                備　考
              </label>
              <textarea
                id="remarks"
                className={styleItems}
                cols={80}
                rows={2}
                readOnly={isReadOnly}
                value={formData.remarks}
                onChange={onChange}
              ></textarea>
            </p>
          </div>

          {/* 右側：画像表示エリア */}
          <div className="w-[200px] flex flex-col ml-2 p-2">
            <p className="w-[170px] h-full flex items-center justify-center mb-2">
              {formData.image_url ? (
                <img
                  src={formData.image_url}
                  alt="Book Cover"
                  width={170}
                  height={200}
                  className="object-contain"
                  onError={(e) => {
                    e.currentTarget.src = '/images/book_unavailable.jpg';
                  }}
                />
              ) : (
                <img src="/images/book_NoImage.jpg" alt="No Image" width={170} height={200} />
              )}
            </p>
            <p className="w-full flex flex-col">
              <textarea
                id="image_url"
                className={`${styleItems} w-full resize-none`}
                cols={20}
                rows={1}
                readOnly={isReadOnly}
                value={formData.image_url}
                onChange={onChange}
              ></textarea>
              <label htmlFor="image_url" className="text-sm font-medium text-gray-700 flex justify-end mb-1">
                （書影URL）
              </label>
            </p>
            <p className="flex mt-6 justify-end">
              <label htmlFor="comic_f">コミック</label>
              <input
                id="comic_f"
                className="ml-2"
                type="checkbox"
                readOnly={isReadOnly}
                checked={formData.comic_f}
                onChange={onChange}
              />
            </p>
          </div>
        </div>

        {/* 下段：ボタンエリア */}
        <div className="flex m-2 justify-around">{buttons}</div>
      </div>
    </div>
  );
};
