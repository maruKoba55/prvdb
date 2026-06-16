'use client';

import { useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSearchParams } from 'next/navigation';
import { supabaseClient } from '@/lib/Client';
import { BookImage, DatabaseBackup, FolderPen, Landmark, UserCheck, X } from 'lucide-react';
import { CommonButton } from '@/components/ui/button';

export default function DataMaint() {
  const supabase = supabaseClient();
  const searchParams = useSearchParams();
  const user = searchParams.get('user');

  // 各ボタンの処理
  // ［書籍役割マスタ］
  const handleBookRoleMaster = () => {
    const params = new URLSearchParams({
      user: user || ''
    });
    window.open(`/MyBooks/data_maintenance/book_role_master/?${params.toString()}`, '_blank', 'width=800,height=820');
  };
  // ［書籍形態マスタ］
  const handleBookFormMaster = () => {
    const params = new URLSearchParams({
      user: user || ''
    });
    window.open(`/MyBooks/data_maintenance/bookform_master/?${params.toString()}`, '_blank', 'width=800,height=820');
  };
  // ［書籍分類マスタ］
  const handleBookClassMaster = () => {
    const params = new URLSearchParams({
      user: user || ''
    });
    window.open(`/MyBooks/data_maintenance/bookclass_master/?${params.toString()}`, '_blank', 'width=800,height=820');
  };
  // ［システム定数］
  const handleSystemConstants = () => {
    const params = new URLSearchParams({
      user: user || ''
    });
    window.open(`/MyBooks/data_maintenance/system_constants/?${params.toString()}`, '_blank', 'width=800,height=640');
  };
  // ［データ保存］
  const handleDataBackup = async () => {
    const { data, error } = await supabase.rpc('backup_books', {});
    if (!error) {
      alert('データ保存完了');
      fetchBackupHistory(); // バックアップ履歴の表示を更新
    } else {
      console.error(error);
      alert(`データ保存失敗  code=${error.code} : ${error.message}`);
    }
  };
  // ［閉じる］
  const handleClose = () => {
    window.close();
  };
  useHotkeys('alt+c', (event) => {
    event.preventDefault();
    handleClose();
  });

  // バックアップ履歴取得
  const [backupDates, setBackupDates] = useState<string[]>([]);
  const fetchBackupHistory = async () => {
    const { data, error } = await supabase
      .from('backup_history')
      .select('backup_date')
      .eq('data_name', 'books')
      .order('backup_date', { ascending: false })
      .limit(2);
    if (!error && data) {
      setBackupDates(data.map((item: any) => item.backup_date));
    } else {
      console.error('バックアップ履歴取得エラー:', error);
    }
  };
  // 初期表示の履歴取得
  useEffect(() => {
    fetchBackupHistory();
  }, []);

  const screenW = 640; //画面幅

  return (
    <div style={{ width: `${screenW}px` }}>
      <div className="text-center text-3xl font-bold underline bg-cyan-500">書籍管理</div>
      <div className="flex flex-col border-solid border-2 rounded-lg m-3 p-1">
        <div className="text-xl font-bold text-blue-500 m-1">データメンテナンス</div>
        <div className="flex flex-col justify-around ml-4 p-2">
          <div className="flex mt-1">
            <div className="flex flex-col justify-center w-40">
              <CommonButton
                label={
                  <>
                    <UserCheck size={20} />
                    書籍役割マスタ
                  </>
                }
                variant="orange"
                onClick={handleBookRoleMaster}
                disabled={false}
              />
            </div>
            <div className="flex flex-col justify-center ml-1">： </div>
            <div className="flex flex-col justify-center ml-1">書籍に関わる人・団体に付与する【役割】の管理</div>
          </div>
          <div className="flex mt-3">
            <div className="flex flex-col justify-center w-40">
              <CommonButton
                label={
                  <>
                    <BookImage size={20} />
                    書籍形態マスタ
                  </>
                }
                variant="orange"
                onClick={handleBookFormMaster}
                disabled={false}
              />
            </div>
            <div className="flex flex-col justify-center ml-1">： </div>
            <div className="flex flex-col justify-center ml-1">書籍を保有する【形態】の管理</div>
          </div>
          <div className="flex mt-3">
            <div className="flex flex-col justify-center w-40">
              <CommonButton
                label={
                  <>
                    <FolderPen size={20} />
                    書籍分類マスタ
                  </>
                }
                variant="orange"
                onClick={handleBookClassMaster}
                disabled={false}
              />
            </div>
            <div className="flex flex-col justify-center ml-1">： </div>
            <div className="flex flex-col justify-center ml-1">書籍に割り当てる【分類】の管理</div>
          </div>
          <div className="flex mt-3">
            <div className="flex flex-col justify-center w-40">
              <CommonButton
                label={
                  <>
                    <Landmark size={20} />シ ス テ ム 定 数
                  </>
                }
                variant="orange"
                onClick={handleSystemConstants}
              />
            </div>
            <div className="flex flex-col justify-center ml-1">： </div>
            <div className="flex flex-col justify-center ml-1">書籍管理システムで参照する定数の調整</div>
          </div>
          <div className="flex mt-3">
            <div className="flex flex-col justify-center w-40">
              <CommonButton
                label={
                  <>
                    <DatabaseBackup size={20} />デ ー タ 保 存
                  </>
                }
                variant="blue"
                onClick={handleDataBackup}
              />
            </div>
            <div className="flex flex-col justify-center ml-1">： </div>
            <div className="flex flex-col justify-center ml-1">
              <div>バックアップ用領域（スキーマ）にデータをコピー</div>
              <div className="text-sm">
                <span className="ml-2">
                  履歴 {backupDates[0] ? `(1) ${new Date(backupDates[0]).toLocaleString('ja-JP')}` : '【なし】'}
                </span>
                <span className="ml-2">
                  {backupDates[1] && ` (2) ${new Date(backupDates[1]).toLocaleString('ja-JP')}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-around mt-3">
        <div className="flex flex-col justify-center">
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
