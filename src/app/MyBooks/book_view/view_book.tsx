'use client';

import { useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSearchParams } from 'next/navigation';
import { supabaseClient } from '@/lib/Client';
import { ArrowLeft, ArrowRight, Notebook, Pencil, RefreshCw, Trash2, X } from 'lucide-react';
import { CommonButton } from '@/components/ui/button';
import { BookForm } from '@/components/BookForm';

export default function ViewBook() {
  const searchParams = useSearchParams();
  const initialIds = searchParams.get('ids')?.split(',') || []; // 初期値としてのみ使用
  const queryIndex = Number(searchParams.get('index')) || 0; //現在のインデックス（なければ0）
  const [bookIds, setBookIds] = useState<string[]>(initialIds);
  const [currentIndex, setCurrentIndex] = useState(queryIndex); //URLからの取得を初期値とする
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true); // 読み込み状態を管理

  const readOnly_f = true;
  const isPrevDisabled = currentIndex <= 0;
  const isNextDisabled = currentIndex >= bookIds.length - 1;

  // 各ボタンの処理（ホットキー設定は return ,if文より前に書かないとエラーになる）
  //［前］
  const handlePrev = () => {
    if (!isPrevDisabled) {
      setCurrentIndex((prev) => {
        const nextIdx = prev - 1;
        updateUrl(nextIdx); // 更新後の値でURLを書き換え
        return nextIdx;
      });
    }
  };
  useHotkeys(
    'alt+p',
    (event) => {
      event.preventDefault(); // ブラウザのデフォルト挙動を防止
      handlePrev(); // handlePrev内の「!isPrevDisabled」判定が通る時だけ実行される
    },
    [isPrevDisabled, handlePrev]
  );
  // ［次］
  const handleNext = () => {
    if (!isNextDisabled) {
      setCurrentIndex((prev) => {
        const nextIdx = prev + 1;
        updateUrl(nextIdx);
        return nextIdx;
      });
    }
  };
  useHotkeys(
    'alt+n',
    (event) => {
      event.preventDefault(); // ブラウザのデフォルト挙動を防止
      handleNext(); // handleNext内の「!isNextDisabled」判定が通る時だけ実行される
    },
    [isNextDisabled, handleNext]
  );
  //［読書ノートへ］
  const handleNote = () => {
    const { book_id, title } = book;
    const params = new URLSearchParams({
      book_id: book_id?.toString() || '',
      title: title || ''
    });
    window.open(`/MyBooks/note_list?${params.toString()}`, '_blank', 'width=820,height=600');
  };
  //［編集］
  const handleEdit = () => {
    const { book_id } = book;
    const params = new URLSearchParams({
      book_id: book_id?.toString() || ''
    });
    window.open(`/MyBooks/book_edit?${params.toString()}`, '_blank');
  };
  //［削除］
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
        console.error(error);
        alert(`削除失敗 code=${error.code} : ${error.message}`);
      }
    }
  };
  //［画面最新化］
  const handleRefresh = () => {
    fetchBookData(bookIds, currentIndex);
  };
  useHotkeys('alt+r', (event) => {
    event.preventDefault(); // ブラウザのデフォルト挙動を防止
    handleRefresh();
  });
  //［閉じる］
  const handleClose = () => {
    window.close();
  };
  useHotkeys('alt+c', (event) => {
    event.preventDefault(); // ブラウザのデフォルト挙動を防止
    handleClose(); //
  });

  // indexが変わったらURLを同期させる関数
  const updateUrl = (newIndex: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('index', newIndex.toString());
    // historyを書き換え（画面はリロードされない）
    window.history.replaceState(null, '', `?${params.toString()}`);
  };

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
      screenTitle="書籍管理（閲覧）"
      bookId={book.book_id}
      formData={book}
      isReadOnly={readOnly_f}
      totalCount={bookIds.length}
      currentCount={currentIndex + 1}
      extraFields={
        <div className="w-full">
          <div className="border-solid border-2 rounded-lg p-1">
            <div className="font-bold border-b mb-2">役割情報［検索用］</div>
            <div className="grid grid-cols-5 gap-x-2 gap-y-1">
              {book.book_role?.map((r: any) => (
                <div key={r.id} className="flex items-start text-sm border-b border-gray-50 flex-col">
                  <div className="mr-2">
                    {r.role_master?.role_name}：{r.person_name}
                  </div>
                  <div className="ml-4">{r.remarks}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="border-solid border-2 rounded-lg mt-2 p-1">
            <div className="font-bold border-b mb-2">保有情報</div>
            <div className="grid grid-cols-3 gap-x-2 gap-y-1 divide-x">
              {book.book_possess?.map((p: any) => (
                <div key={p.book_possess_id} className="flex items-start text-sm border-b border-gray-50">
                  <div className="flex flex-col mr-2">
                    <div>種　別：{p.booktype_master?.booktype}</div>
                    <div>入手日：{p.get_date}</div>
                    <div>処分日：{p.dispose_date}</div>
                    <div>備　考：</div>
                    <textarea className="ml-2" cols={20} rows={3} readOnly={readOnly_f}>
                      {p.remarks}
                    </textarea>
                  </div>
                  <div className="flex flex-col">
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
            label={
              <>
                <ArrowLeft size={20} />前 (<u>P</u>)
              </>
            }
            variant="blue"
            onClick={handlePrev}
            disabled={isPrevDisabled}
          />
          <CommonButton
            label={
              <>
                <Notebook size={20} />
                読書ノートへ
              </>
            }
            variant="orange"
            onClick={handleNote}
          />
          <CommonButton
            label={
              <>
                <Pencil size={20} />
                編集
              </>
            }
            variant="orange"
            onClick={handleEdit}
          />
          <CommonButton
            label={
              <>
                <Trash2 size={20} />
                削除
              </>
            }
            variant="red"
            title="書籍情報を削除します。読書ノートが存在する場合は、先に削除してください。"
            onClick={handleDelete}
          />
          <CommonButton
            type="button"
            label={
              <>
                <RefreshCw size={20} />
                画面最新化 (<u>R</u>)
              </>
            }
            variant="blue"
            onClick={handleRefresh}
          />
          <CommonButton
            label={
              <>
                次 <ArrowRight size={20} /> (<u>N</u>)
              </>
            }
            variant="blue"
            onClick={handleNext}
            disabled={isNextDisabled}
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
  );
}
