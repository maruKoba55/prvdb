'use client';

import { useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSearchParams } from 'next/navigation';
import { supabaseClient } from '@/lib/Client';
import { CommonButton } from '@/components/ui/button';
import { BookForm } from '@/components/BookForm';

export default function EditBooks() {
  const searchParams = useSearchParams();
  const initialIds = searchParams.get('ids')?.split(',') || []; // 初期値としてのみ使用
  const [bookIds, setBookIds] = useState<string[]>(initialIds);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true); // 読み込み状態を管理

  const readOnly_f = true;
  const isPrevDisabled = currentIndex <= 0;
  const isNextDisabled = currentIndex >= bookIds.length - 1;
  //  console.log('Before Delete:', bookIds);

  // 各ボタンの処理（ホットキー設定は return ,if文より前に書かないとエラーになる）
  //［前のデータ］
  const handlePrev = () => {
    if (!isPrevDisabled) setCurrentIndex((i) => i - 1);
  };
  useHotkeys(
    'alt+p',
    (event) => {
      event.preventDefault(); // ブラウザのデフォルト挙動を防止
      handlePrev(); // handlePrev内の「!isNextDisabled」判定が通る時だけ実行される
    },
    [isPrevDisabled]
  );
  // ［次のデータ］
  const handleNext = () => {
    if (!isNextDisabled) setCurrentIndex((i) => i + 1);
  };
  useHotkeys(
    'alt+n',
    (event) => {
      event.preventDefault(); // ブラウザのデフォルト挙動を防止
      handleNext(); // handleNext内の「!isNextDisabled」判定が通る時だけ実行される
    },
    [isNextDisabled]
  );
  //［読書ノートへ］
  const handleNote = () => {
    const { book_id, title } = book;
    const params = new URLSearchParams({
      book_id: book_id?.toString() || '',
      title: title || ''
    });
    window.open(`/book_note?${params.toString()}`, '_blank', 'width=780,height=440');
  };
  //［書籍削除］
  const handleDelete = async () => {
    const confirmed = confirm(`『${book.title}』（${book.publisher}）を削除しますか？`);
    if (!confirmed) return;
    try {
      const { error } = await supabaseClient.from('books').delete().eq('book_id', book.book_id);
      if (error) throw error;
      alert(`『${book.title}』（${book.publisher}）を削除しました`);
      //削除したIDを除去した新しいリストを作成
      const nextIds = bookIds.filter((_, index) => index !== currentIndex);
      if (nextIds.length === 0) {
        window.close();
        return;
      }
      if (currentIndex >= nextIds.length) {
        setCurrentIndex(nextIds.length - 1); // 末尾を削除した場合のインデックス調整
      }
      setBookIds(nextIds); // IDリストを更新 ⇒ useEffectがトリガーされてデータfetch
      //      console.log('After Delete:', bookIds);
    } catch (error: any) {
      if (error.code === '23503') {
        alert(`読書ノートが存在します。先に読書ノートを削除してください。`);
      } else {
        console.error('Delete error:', error.code);
        alert(`削除失敗: ${error.message}`);
      }
    }
  };
  //［閉じる］
  const handleClose = () => {
    window.close();
  };
  useHotkeys('alt+c', (event) => {
    event.preventDefault(); // ブラウザのデフォルト挙動を防止
    handleClose(); // handlePrev内の「!isNextDisabled」判定が通る時だけ実行される
  });

  // bookIdsかcurrentIndexが変わったらデータ取得
  useEffect(() => {
    if (bookIds.length > 0 && bookIds[currentIndex]) {
      fetchBookData(bookIds, currentIndex);
    }
  }, [currentIndex, bookIds]);

  const fetchBookData = async (targetIds: string[], index: number) => {
    setBook(null);
    setLoading(true);
    const { data, error } = await supabaseClient
      .from('books')
      .select(
        `
        *,
        book_role (
          *,
          role_master (
            role_name
          )
        ),
        book_possess (
          *,
          booktype_master (
            booktype
          )
        )
        `
      )
      .eq('book_id', targetIds[index])
      .order('role_cd', { referencedTable: 'book_role', ascending: true })
      .order('role_order', { referencedTable: 'book_role', ascending: true })
      .order('booktype_cd', { referencedTable: 'book_possess', ascending: true })
      .order('get_date', { referencedTable: 'book_possess', ascending: true })
      .single();

    if (data) {
      setBook(data);
    }
    setLoading(false);
  };

  if (bookIds.length === 0) return <div>データがありません</div>;
  if (loading || !book) return <div>読み込み中...</div>;

  return (
    <BookForm
      screenTitle="書籍管理"
      bookId={book.book_id}
      formData={book}
      isReadOnly={readOnly_f}
      totalCount={bookIds.length}
      currentCount={currentIndex + 1}
      extraFields={
        <div className="w-full">
          <div className="border-solid border-2 rounded-lg p-2">
            <h2 className="font-bold border-b mb-2">役割情報［検索用］</h2>
            <div className="grid grid-cols-5 gap-x-4 gap-y-2">
              {book.book_role?.map((r: any) => (
                <div key={r.id} className="flex items-start text-sm border-b border-gray-50 flex-col">
                  <span>
                    <span className="mr-2">{r.role_master?.role_name}：</span>
                    <span>{r.person_name}</span>
                  </span>
                  <span className="ml-4">{r.remarks}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border-solid border-2 rounded-lg mt-2 p-1">
            <h2 className="font-bold border-b mb-2">保有情報</h2>
            <div className="grid grid-cols-3 gap-x-4 gap-y-2 divide-x">
              {book.book_possess?.map((p: any) => (
                <div key={p.book_possess_id} className="flex items-start text-sm border-b border-gray-50">
                  <span className="flex flex-col mr-2">
                    <span>種　別：{p.booktype_master?.booktype}</span>
                    <span>入手日：{p.get_date}</span>
                    <span>処分日：{p.dispose_date}</span>
                    <span>備　考：</span>
                    <textarea className="ml-2" cols={20} rows={3} readOnly={readOnly_f}>
                      {p.remarks}
                    </textarea>
                  </span>
                  <span className="flex flex-col">
                    <span>
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt="Book Cover"
                          width={100}
                          className="object-contain"
                          onError={(e) => {
                            e.currentTarget.src = '/images/book_unavailable.jpg';
                          }}
                        />
                      ) : (
                        <img src="/images/book_NoImage.jpg" alt="No Image" width={100} />
                      )}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      }
      buttons={
        <>
          <CommonButton
            label={
              <>
                前のデータ (<u>P</u>)
              </>
            }
            variant="blue"
            onClick={handlePrev}
            disabled={isPrevDisabled}
          />
          <CommonButton
            label={
              <>
                次のデータ (<u>N</u>)
              </>
            }
            variant="blue"
            onClick={handleNext}
            disabled={isNextDisabled}
          />
          <CommonButton label="読書ノートへ" variant="orange" onClick={handleNote} />
          <CommonButton
            label="書籍削除"
            variant="red"
            title="書籍情報を削除します。読書ノートが存在する場合は、先に削除してください。"
            onClick={handleDelete}
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
        </>
      }
    />
  );
}
