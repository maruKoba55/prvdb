'use client';

import { useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSearchParams } from 'next/navigation';
import { supabaseClient } from '@/lib/Client';
import { CommonButton } from '@/components/ui/button';

const styleItems =
  'ml-2 border border-[#ccc] p-1 rounded outline-none hover:border-[#999] focus:border-[#007bff] focus:ring-4 focus:ring-[#007bff]/25';
const screenMinW = 720; //画面最小幅

const initialFormState = {
  role_cd: '',
  role_order: '',
  person_name: '',
  remarks: ''
};

type RoleMaster = {
  role_cd: string;
  role_name: string;
  selectable: boolean;
};

export default function EditRole() {
  const searchParams = useSearchParams();
  const bookId = searchParams.get('book_id');
  const title = searchParams.get('title');
  const [formData, setFormData] = useState(initialFormState);
  const [registeredRole, setRegisteredRole] = useState<any>(null);
  const [roles, setRoles] = useState<RoleMaster[]>([]);

  // 各ボタンの処理（ホットキー設定は return ,if文より前に書かないとエラーになる）
  // ［役割情報を登録］
  const handleRegist = async () => {
    try {
      const data = await editRoleData();
      if (data) {
        setRegisteredRole(data); // 画面に表示
        alert('書籍役割情報を登録しました');
      }
    } catch (error: any) {
      if (
        (error instanceof Error && (error as any).code === '23505') ||
        (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505')
      ) {
        alert('このデータは登録済みです');
      } else {
        console.error(error);
        alert(`登録失敗（Insert to Table 'book_role' error.code=${(error as any).code || 'unknown'}）`);
      }
    }
  };
  useHotkeys('alt+r', (event) => {
    event.preventDefault(); // ブラウザのデフォルト挙動を防止
    handleRegist();
  });
  // ［画面初期化］
  const handleErase = () => {
    setFormData(initialFormState);
    setRegisteredRole(null);
  };
  useHotkeys('alt+e', (event) => {
    event.preventDefault(); // ブラウザのデフォルト挙動を防止
    handleErase();
  });
  // ［閉じる］
  const handleClose = () => {
    window.close();
  };
  useHotkeys('alt+c', (event) => {
    event.preventDefault(); // ブラウザのデフォルト挙動を防止
    handleClose();
  });

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

  // 画面内容をTable 'book_role' へ登録
  const editRoleData = async () => {
    if (!formData.role_cd || !formData.person_name.trim()) {
      alert('必須項目が未入力です');
      return null;
    }
    const insertData = {
      book_id: bookId || null,
      role_cd: formData.role_cd || null,
      role_order: formData.role_order || null,
      person_name: formData.person_name || null,
      remarks: formData.remarks || null
    };

    // Table 'book_role'をinsert
    const { data, error } = await supabaseClient.from('book_role').insert([insertData]).select();
    if (error) throw error;
    return data ? data[0] : null;
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
  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      role_cd: e.target.value // ここでrole_cdが取得される
    });
  };

  return (
    <div style={{ minWidth: `${screenMinW}px` }} className="w-full">
      <h1 className="text-center text-3xl font-bold underline bg-cyan-500">書籍管理</h1>
      <div className="border-solid border-2 rounded-lg flex m-4 p-2">
        {/* 入力フォーム */}
        <div className="flex-1">
          <p>
            <span className="text-xl font-bold text-blue-500 m-2">書籍役割情報</span>
            &nbsp;
            <span className="text-xl font-bold text-gray-500">{title ? '『' + title + '』' : ''}</span>
            <span className="text-gray-500">（書籍ID：{bookId ? bookId : '---'}）</span>
          </p>
          <p className="ml-6">
            （<span className="font-bold text-orange-500">オレンジ色</span>項目は入力必須）
          </p>
          <p className="ml-2">
            <label htmlFor="role" className="font-bold text-orange-500">
              役　割
            </label>
            <select id="role" className={styleItems} required value={formData.role_cd} onChange={handleSelect}>
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
          </p>
          <p className="ml-2">
            <label htmlFor="role_order" className="inline-block ml-14">
              役割内順序
            </label>
            <input
              id="role_order"
              className={styleItems}
              type="number"
              min={1}
              max={999}
              value={formData.role_order}
              onChange={handleChange}
            />
            <label htmlFor="person_name" className="inline-block  font-bold text-orange-500 ml-6">
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
            <label htmlFor="remarks" className="inline-block  align-top">
              備　考
            </label>
            <textarea
              id="remarks"
              className={styleItems}
              cols={80}
              rows={4}
              value={formData.remarks}
              onChange={handleChange}
            ></textarea>
          </p>
        </div>
      </div>

      {/* 下段：ボタンエリア */}
      <div className="flex m-2 justify-around">
        <CommonButton
          label={
            <>
              役割情報を登録 (<u>R</u>)
            </>
          }
          variant="blue"
          onClick={handleRegist}
        />
        <CommonButton
          label={
            <>
              画面初期化 (<u>E</u>)
            </>
          }
          variant="outline"
          onClick={handleErase}
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
  );
}
