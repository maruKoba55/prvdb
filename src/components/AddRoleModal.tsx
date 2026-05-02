'use client';

import { useEffect, useRef, useState } from 'react';
import { supabaseClient } from '@/lib/Client';
import { Save, X } from 'lucide-react';
import { CommonButton } from '@/components/ui/button';
import { styleItems } from '@/app/constants';

type RoleMaster = {
  role_cd: string;
  role_order: number;
  role_name: string;
  selectable: boolean;
};

export function AddRoleModal({
  bookId,
  bookTitle,
  onClose,
  onSuccess
}: {
  bookId: number;
  bookTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const supabase = supabaseClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    role_cd: '',
    role_order: '',
    person_name: '',
    remarks: ''
  });
  const insertData = {
    book_id: bookId,
    role_cd: formData.role_cd,
    role_order: formData.role_order || 0,
    person_name: formData.person_name,
    remarks: formData.remarks
  };

  // 画面マウント時のフォーカス用(役割セレクトに当てるため、HTMLSelectElement)
  const firstInputRef = useRef<HTMLSelectElement>(null);
  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!bookId) {
      alert('Missing book_id!');
      return;
    }

    if (!formData.role_cd || !formData.person_name.trim()) {
      alert('必須項目が未入力です。');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('book_role').insert([insertData]);
    setLoading(false);
    if (!error) {
      onSuccess();
    } else {
      if (error.code === '23505') {
        alert(`『${bookTitle}』に登録済みの役割です。`);
      } else {
        console.error(error);
        alert(`登録失敗 code=${error.code} : ${error.message}`);
      }
    }
  };

  // 役割マスターの展開・取得
  const [roles, setRoles] = useState<RoleMaster[]>([]);
  useEffect(() => {
    const fetchRoles = async () => {
      const { data, error } = await supabase
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
  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      role_cd: e.target.value // ここでrole_cdが取得される
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-xl">
        <div>
          <span className="text-xl font-bold text-blue-500 mr-2">役割情報追加</span>（
          <span className="font-bold text-orange-500">オレンジ色</span>
          項目は空白不可）
        </div>
        <div className="flex items-center text-xl font-bold text-gray-500 mb-2">『{bookTitle}』</div>
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="mt-1 ml-2">
            <label htmlFor="role" className="font-bold text-orange-500">
              役　割
            </label>
            <select
              id="role"
              className={styleItems}
              required
              ref={firstInputRef}
              value={formData.role_cd}
              onChange={handleSelect}
            >
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
          </div>
          <div className="mt-1 ml-2">
            <label htmlFor="role_order" className="inline-block ml-4">
              順序
            </label>
            <input
              id="role_order"
              className={styleItems}
              type="number"
              min={0}
              max={999}
              value={formData.role_order}
              onChange={(e) => setFormData({ ...formData, role_order: e.target.value })}
            />
            <label htmlFor="person_name" className="inline-block font-bold text-orange-500 ml-4">
              人(団体)名
            </label>
            <input
              id="person_name"
              className={styleItems}
              type="text"
              size={33}
              required
              value={formData.person_name}
              onChange={(e) => setFormData({ ...formData, person_name: e.target.value })}
            />
          </div>
          <div className="mt-1 ml-2">
            <label htmlFor="remarks" className="inline-block  align-top">
              備　考
            </label>
            <textarea
              id="remarks"
              className={styleItems}
              cols={65}
              rows={4}
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            ></textarea>
          </div>

          <div className="flex justify-end gap-4">
            <CommonButton
              type="submit"
              label={
                <>
                  <Save size={20} />
                  {loading ? '保存中...' : '保存'}
                </>
              }
              variant="blue"
              disabled={loading}
            />
            <CommonButton
              label={
                <>
                  <X size={20} />
                  キャンセル
                </>
              }
              variant="outline"
              onClick={onClose}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
