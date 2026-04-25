'use client';

import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/Client';
import { CommonButton } from '@/components/ui/button';
import { BookForm } from '@/components/BookForm';

export default function EditBook({ book }: { book: any }) {
  const router = useRouter();
  const [formData, setFormData] = useState(book);
  const [deleteRoles, setDeleteRoles] = useState<number[]>([]);
  const [deletePossessions, setDeletePossessions] = useState<number[]>([]);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [selectedPossessId, setSelectedPossessId] = useState<string | null>(null);

  const styleItems =
    'ml-2 border border-[#ccc] p-1 rounded outline-none hover:border-[#999] focus:border-[#007bff] focus:ring-4 focus:ring-[#007bff]/25';
  const styleMiniBotton = 'border border-red-500 rounded-md text-sm text-red-500 p-1';

  const readOnly_f = false;
  let partErr = false;
  console.log('formData:', formData);

  if (!formData) {
    return null;
  }

  const handleSave = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.publisher.trim() || String(formData.first_publish_year).trim() === '') {
      alert('基本情報の必須項目が未入力です');
      return null;
    }
    if (formData.first_publish_year > new Date().getFullYear() + 1) {
      alert('初版年を確認してください');
      return null;
    }

    // 書籍基本情報（Books）の更新
    const { error: bookErr } = await supabaseClient
      .from('books')
      .update({
        isbn10: formData.isbn10,
        isbn13: formData.isbn13,
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
      console.error(bookErr);
      alert(`更新失敗 code=${bookErr.code} : ${bookErr.message}`);
      return null;
    }

    // 選択された役割情報（book_role）、保有情報（book_possess）の削除
    if (deleteRoles.length > 0) {
      const { error: deleteRoleErr } = await supabaseClient.from('book_role').delete().in('id', deleteRoles);
      if (deleteRoleErr) {
        console.error(deleteRoleErr);
        alert(`削除失敗（役割情報） code=${deleteRoleErr.code} : ${deleteRoleErr.message}`);
        partErr = true;
      }
    }
    if (deletePossessions.length > 0) {
      const { error: deletePossessErr } = await supabaseClient
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
        const { error: updateRoleErr } = await supabaseClient
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
      }
    }
    for (const possess of formData.book_possess) {
      if (!deletePossessions.includes(possess.book_possess_id)) {
        const { error: updatePossessErr } = await supabaseClient
          .from('book_possess')
          .update({
            get_date: possess.get_date,
            dispose_date: possess.dispose_date,
            remarks: possess.remarks,
            image_url: possess.image_url
          })
          .eq('book_possess_id', possess.book_possess_id);
        if (updatePossessErr) {
          console.error(updatePossessErr);
          alert(`更新失敗（役割情報） code=${updatePossessErr.code} : ${updatePossessErr.message}`);
          partErr = true;
        }
      }
    }

    if (partErr) {
      alert('保存しましたが、役割情報または保有情報の更新・削除に失敗しています。');
    } else {
      alert('保存しました');
    }
    router.refresh();
  };

  // 各ボタンの処理
  //［閉じる］
  const handleClose = () => {
    window.close();
  };
  useHotkeys('alt+c', (event) => {
    event.preventDefault(); // ブラウザのデフォルト挙動を防止
    handleClose(); // handlePrev内の「!isNextDisabled」判定が通る時だけ実行される
  });

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

  return (
    <form className="space-y-8">
      <BookForm
        screenTitle="書籍管理"
        bookId={formData.book_id}
        formData={formData}
        onChange={handleChange}
        isReadOnly={readOnly_f}
        extraFields={
          <div className="w-full">
            <div className="border-solid border-2 rounded-lg p-1">
              <h2 className="font-bold border-b mb-2">役割情報［検索用］</h2>
              <div className="grid grid-cols-3 gap-x-2 gap-y-1">
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
                          value={r.role_order || ''}
                          className={`${styleItems} text-sm inline-block w-12 mr-1`}
                          onChange={(e) => handleRoleChange(r.id, 'role_order', e.target.value)}
                        />
                        )
                      </div>
                      <button
                        type="button"
                        onClick={() => setDeleteRoles([...deleteRoles, r.id])}
                        className={`${styleMiniBotton} mt-2`}
                      >
                        削除
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
              <h2 className="font-bold border-b mb-2">保有情報</h2>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                {formData.book_possess.map((p: any) => (
                  <div
                    key={p.book_possess_id}
                    className={`flex items-center text-sm gap-2 ${deletePossessions.includes(p.book_possess_id) ? 'opacity-30' : ''}`}
                  >
                    <div className="w-22">
                      <div className="underline flex flex-col"> {p.booktype_master?.booktype}</div>
                      <button
                        type="button"
                        onClick={() => setDeletePossessions([...deletePossessions, p.book_possess_id])}
                        className={`${styleMiniBotton} mt-4`}
                      >
                        削除
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
                          value={p.get_date || ''}
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
                          value={p.dispose_date || ''}
                          className={`${styleItems} text-sm`}
                          onChange={(e) => handlePossessChange(p.book_possess_id, 'dispose_date', e.target.value)}
                        />
                      </div>
                      <div>
                        <label htmlFor={`possess_remarks-${p.book_possess_id}`} className="align-top inline-block w-14">
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
                          <label htmlFor={`urlUp_f-${p.book_possess_id}`}>URLを基本情報へコピー</label>
                          <input
                            id={`urlUp_f-${p.book_possess_id}`}
                            className="ml-2"
                            type="checkbox"
                            checked={selectedPossessId === p.book_possess_id}
                            onChange={() => handleUrlCopy(p.book_possess_id, p.image_url)}
                          />
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
            <CommonButton type="submit" label="変更を保存" variant="blue" onClick={handleSave} />
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
    </form>
  );
}
