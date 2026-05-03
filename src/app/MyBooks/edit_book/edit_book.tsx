'use client';

import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/Client';
import { Plus, Save, RefreshCw, Trash2, X } from 'lucide-react';
import { CommonButton } from '@/components/ui/button';
import { BookForm } from '@/components/BookForm';
import { AddRoleModal } from '@/components/AddRoleModal';
import { AddPossessModal } from '@/components/AddPossessModal';
import { isbnHyphenate } from '@/utils/isbnHyphenate';
import { styleItems } from '@/app/constants';

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

export default function EditBook({ book }: { book: any }) {
  const supabase = supabaseClient();
  const router = useRouter();
  const [formData, setFormData] = useState(book);
  const [deleteRoles, setDeleteRoles] = useState<number[]>([]);
  const [deletePossessions, setDeletePossessions] = useState<number[]>([]);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [selectedPossessId, setSelectedPossessId] = useState<string | null>(null);
  const [isAddRoleModal, setIsAddRoleModal] = useState(false);
  const [isAddPossessModal, setIsAddPossessModal] = useState(false);

  const readOnly_f = false;
  let partErr = false;

  if (!formData) {
    return null;
  }

  const handleSave = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.publisher.trim() || String(formData.first_publish_year).trim() === '') {
      alert('基本情報の必須項目が未入力です。');
      return null;
    }
    if (formData.first_publish_year > new Date().getFullYear() + 1) {
      alert('初版年を確認してください。');
      return null;
    }
    if (formData.isbn10 && !formData.isbn13 && isbnHyphenate(formData.isbn10)) {
      if (confirm('ISBN-10を変換してISBN-13としますか？')) {
        formData.isbn13 = isbnHyphenate(formData.isbn10);
        router.refresh();
      }
    }

    // 書籍基本情報（Books）の更新
    const { error: bookErr } = await supabase
      .from('books')
      .update({
        isbn10: formData.isbn10 ? formData.isbn10.replaceAll('-', '') : '',
        isbn13: formData.isbn13 ? formData.isbn13.replaceAll('-', '') : '',
        c_cd: formData.c_cd,
        ndc: formData.ndc,
        title: formData.title,
        original_title: formData.original_title,
        colophon: formData.colophon,
        publisher: formData.publisher,
        publish_series: formData.publish_series,
        publish_series_no: formData.publish_series_no,
        first_publish_year: formData.first_publish_year,
        remarks: formData.remarks,
        comic_f: formData.comic_f,
        image_url: formData.image_url
      })
      .eq('book_id', book.book_id);
    if (bookErr) {
      if (bookErr.code === '23505') {
        alert(`『${formData.title}』（${formData.publisher}、${formData.first_publish_year}）は別に登録されています。`);
      } else {
        console.error(bookErr);
        alert(`登録失敗  code=${bookErr.code} : ${bookErr.message}`);
      }
      return null;
    }

    // 選択された役割情報（book_role）、保有情報（book_possess）の削除
    if (deleteRoles.length > 0) {
      const { error: deleteRoleErr } = await supabase.from('book_role').delete().in('id', deleteRoles);
      if (deleteRoleErr) {
        console.error(deleteRoleErr);
        alert(`削除失敗（役割情報） code=${deleteRoleErr.code} : ${deleteRoleErr.message}`);
        partErr = true;
      }
    }
    if (deletePossessions.length > 0) {
      const { error: deletePossessErr } = await supabase
        .from('book_possess')
        .delete()
        .in('book_possess_id', deletePossessions);
      if (deletePossessErr) {
        console.error(deletePossessErr);
        alert(`削除失敗（保有情報） code=${deletePossessErr.code} : ${deletePossessErr.message}`);
        partErr = true;
      }
    }

    // 役割情報（book_role）、保有情報（book_possess）の更新
    for (const role of formData.book_role) {
      if (!deleteRoles.includes(role.id)) {
        if (role.person_name.trim()) {
          const { error: updateRoleErr } = await supabase
            .from('book_role')
            .update({
              role_order: role.role_order,
              person_name: role.person_name,
              remarks: role.remarks
            })
            .eq('id', role.id);
          if (updateRoleErr) {
            console.error(updateRoleErr);
            alert(`更新失敗（役割情報） code=${updateRoleErr.code} : ${updateRoleErr.message}`);
            partErr = true;
          }
        } else {
          alert('役割情報の人(団体)名は省略できません。');
          partErr = true;
        }
      }
    }
    for (const possess of formData.book_possess) {
      if (!deletePossessions.includes(possess.book_possess_id)) {
        if (possess.get_date) {
          const { error: updatePossessErr } = await supabase
            .from('book_possess')
            .update({
              get_date: possess.get_date || null,
              dispose_date: possess.dispose_date || null,
              remarks: possess.remarks,
              image_url: possess.image_url
            })
            .eq('book_possess_id', possess.book_possess_id);
          if (updatePossessErr) {
            console.error(updatePossessErr);
            alert(`更新失敗（役割情報） code=${updatePossessErr.code} : ${updatePossessErr.message}`);
            partErr = true;
          }
        } else {
          alert('保有情報の入手日は省略できません。');
          partErr = true;
        }
      }
    }

    if (partErr) {
      alert('保存しましたが、役割情報または保有情報の更新・削除に失敗しています。');
    } else {
      alert('保存しました。');
    }
    router.refresh();
  };

  //［閉じる］ボタンの処理
  const handleClose = () => {
    window.close();
  };
  useHotkeys('alt+c', (event) => {
    event.preventDefault(); // ブラウザのデフォルト挙動を防止
    handleClose(); // handlePrev内の「!isNextDisabled」判定が通る時だけ実行される
  });
  const handleRefresh = () => {
    //router.refresh();
    window.location.reload();
  };

  // 入力変更ハンドラ
  // 汎用：チェックボックスの場合はchecked、それ以外はvalueを格納
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev: any) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };
  // 関数を介する項目用（ISBN等）
  const handleChangeF = (id: any, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [id]: value
    }));
  };
  // book_role更新用（配列対応）
  const handleRoleChange = (id: number, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      book_role: prev.book_role.map((r: any) => (r.id === id ? { ...r, [field]: value } : r))
    }));
  };
  // book_possess更新用（配列対応）
  const handlePossessChange = (id: number, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      book_possess: prev.book_possess.map((p: any) => (p.book_possess_id === id ? { ...p, [field]: value } : p))
    }));
  };

  // 保有情報の画像URLを基本情報にコピーするチェックボックスの処理
  const handleUrlCopy = (id: string, pImageUrl: string) => {
    if (selectedPossessId === id) {
      // 同じものをクリックして外す場合
      setFormData((prev: any) => ({ ...prev, image_url: originalUrl }));
      setSelectedPossessId(null);
    } else {
      // 新しくチェックする場合（他がチェックされていても上書き）
      if (selectedPossessId === null) {
        // 最初の一個目の時だけ、本当のオリジナルを保存
        setOriginalUrl(formData.image_url);
      }
      setFormData((prev: any) => ({ ...prev, image_url: pImageUrl }));
      setSelectedPossessId(id);
    }
  };

  // フィールド名を指定して値を空にする関数
  const handleEraseField = (field: keyof BookFormData) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: ''
    }));
  };

  return (
    <div>
      <form className="space-y-8">
        <BookForm
          screenTitle="書籍管理（編集）"
          bookId={formData.book_id}
          formData={formData}
          onChange={handleChange}
          onChangeF={handleChangeF}
          onClearField={handleEraseField}
          isReadOnly={readOnly_f}
          extraFields={
            <div className="w-full">
              <div className="border-solid border-2 rounded-lg p-1">
                <div className="flex items-center">
                  <div className="font-bold border-b mb-2">役割情報［検索用］</div>
                  <button
                    type="button"
                    title="子画面での追加データは、本画面とは無関係に保存されます。"
                    onClick={() => setIsAddRoleModal(true)}
                    className="flex items-center bg-blue-600 rounded-md text-sm text-white p-1 ml-2 hover:bg-blue-700"
                  >
                    <Plus size={16} /> 追加
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-x-2 gap-y-1 p-2">
                  {formData.book_role.map((r: any) => (
                    <div
                      key={r.id}
                      className={`flex items-center text-sm gap-2 mb-1 ${deleteRoles.includes(r.id) ? 'opacity-30' : ''}`}
                    >
                      <div>
                        <div className="flex flex-col text-sm inline-block w-17"> {r.role_master?.role_name}</div>
                        <div className="flex items-center">
                          (
                          <input
                            id={`role_order-${r.id}`}
                            type="number"
                            min={0}
                            max={999}
                            value={r.role_order || 0}
                            className={`${styleItems} text-sm inline-block w-12 mr-1`}
                            onChange={(e) => handleRoleChange(r.id, 'role_order', e.target.value)}
                          />
                          )
                        </div>
                        <button
                          type="button"
                          title="実際の削除は、下の［変更を保存］により実行されます。"
                          onClick={() => setDeleteRoles([...deleteRoles, r.id])}
                          className="flex items-center bg-red-600 rounded-md text-sm text-white p-1 mt-2 hover:bg-red-700"
                        >
                          <Trash2 size={16} /> 削除
                        </button>
                      </div>
                      <div>
                        <input
                          id={`person_name-${r.id}`}
                          type="text"
                          size={30}
                          value={r.person_name || ''}
                          className={`${styleItems} text-sm`}
                          onChange={(e) => handleRoleChange(r.id, 'person_name', e.target.value)}
                        />
                        <textarea
                          id={`role_remarks-${r.id}`}
                          cols={30}
                          rows={2}
                          value={r.remarks || ''}
                          className={`${styleItems} text-sm`}
                          onChange={(e) => handleRoleChange(r.id, 'remarks', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-solid border-2 rounded-lg mt-2 p-1">
                <div className="flex items-center">
                  <div className="font-bold border-b mb-2">保有情報</div>
                  <button
                    type="button"
                    title="子画面での追加データは、本画面とは無関係に保存されます。"
                    onClick={() => setIsAddPossessModal(true)}
                    className="flex items-center bg-blue-600 rounded-md text-sm text-white p-1 ml-2 hover:bg-blue-700"
                  >
                    <Plus size={16} /> 追加
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 p-2 divide-x divide-y">
                  {formData.book_possess.map((p: any) => (
                    <div
                      key={p.book_possess_id}
                      className={`flex items-center text-sm gap-2 ${deletePossessions.includes(p.book_possess_id) ? 'opacity-30' : ''}`}
                    >
                      <div className="w-22">
                        <div className="underline flex flex-col"> {p.booktype_master?.booktype}</div>
                        <button
                          type="button"
                          title="実際の削除は、下の［変更を保存］により実行されます。"
                          onClick={() => setDeletePossessions([...deletePossessions, p.book_possess_id])}
                          className="flex items-center bg-red-600 rounded-md text-sm text-white p-1 mt-2 hover:bg-red-700"
                        >
                          <Trash2 size={16} /> 削除
                        </button>
                      </div>
                      <div>
                        <div>
                          <label htmlFor={`get_date-${p.book_possess_id}`} className="inline-block w-14">
                            入 手 日
                          </label>
                          <input
                            id={`get_date-${p.book_possess_id}`}
                            type="date"
                            value={p.get_date || null}
                            className={`${styleItems} text-sm`}
                            onChange={(e) => handlePossessChange(p.book_possess_id, 'get_date', e.target.value)}
                          />
                        </div>
                        <div>
                          <label htmlFor={`dispose_date-${p.book_possess_id}`} className="inline-block w-14">
                            処 分 日
                          </label>
                          <input
                            id={`dispose_date-${p.book_possess_id}`}
                            type="date"
                            value={p.dispose_date || null}
                            min={p.get_date || null}
                            className={`${styleItems} text-sm`}
                            onChange={(e) => handlePossessChange(p.book_possess_id, 'dispose_date', e.target.value)}
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`possess_remarks-${p.book_possess_id}`}
                            className="align-top inline-block w-14"
                          >
                            備　考
                          </label>
                          <textarea
                            id={`possess_remarks-${p.book_possess_id}`}
                            cols={24}
                            rows={2}
                            value={p.remarks || ''}
                            className={`${styleItems} text-sm`}
                            onChange={(e) => handlePossessChange(p.book_possess_id, 'remarks', e.target.value)}
                          />
                        </div>
                        <div>
                          <label htmlFor={`possess_image_url-${p.book_possess_id}`} className="inline-block w-14">
                            書影URL
                          </label>
                          <input
                            id={`possess_image_url-${p.book_possess_id}`}
                            type="text"
                            size={23}
                            value={p.image_url || ''}
                            className={`${styleItems} text-sm`}
                            onChange={(e) => handlePossessChange(p.book_possess_id, 'image_url', e.target.value)}
                          />
                        </div>
                        {p.image_url ? (
                          <div className="flex justify-end">
                            <input
                              id={`urlUp_f-${p.book_possess_id}`}
                              className="mr-2"
                              type="checkbox"
                              checked={selectedPossessId === p.book_possess_id}
                              onChange={() => handleUrlCopy(p.book_possess_id, p.image_url)}
                            />
                            基本情報の書影とする
                          </div>
                        ) : (
                          <br />
                        )}
                      </div>
                      <div>
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt="Book Cover"
                            width={120}
                            className="object-contain"
                            onError={(e) => {
                              e.currentTarget.src = '/images/book_unavailable.jpg';
                            }}
                          />
                        ) : (
                          <img src="/images/book_NoImage.jpg" alt="No Image" width={120} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          }
          buttons={
            <>
              <CommonButton
                type="submit"
                label={
                  <>
                    <Save size={20} />
                    変更を保存
                  </>
                }
                variant="blue"
                onClick={handleSave}
              />
              <CommonButton
                type="button"
                label={
                  <>
                    <RefreshCw size={20} />
                    画面最新化 (<u>R</u>)
                  </>
                }
                variant="outline"
                onClick={handleRefresh}
              />
              <CommonButton
                label={
                  <>
                    <X size={20} />
                    キャンセル (<u>C</u>)
                  </>
                }
                variant="outline"
                onClick={handleClose}
              />
            </>
          }
        />
      </form>
      {isAddRoleModal && (
        <AddRoleModal
          bookId={Number(formData.book_id) || 0}
          bookTitle={formData.title || ''}
          onClose={() => setIsAddRoleModal(false)}
          onSuccess={() => {
            setIsAddRoleModal(false);
            router.refresh();
            //  window.location.reload();
            // ↑これで画面更新すると、追加したbook_roleが表示される一方、
            //  他の変更内容が元に戻ってしまう。
          }}
        />
      )}
      {isAddPossessModal && (
        <AddPossessModal
          bookId={Number(formData.book_id) || 0}
          bookTitle={formData.title || ''}
          onClose={() => setIsAddPossessModal(false)}
          onSuccess={() => {
            setIsAddPossessModal(false);
            router.refresh();
            //  window.location.reload();
            // ↑これで画面更新すると、追加したbook_possessが表示される一方、
            //  他の変更内容が元に戻ってしまう。
          }}
        />
      )}
    </div>
  );
}
