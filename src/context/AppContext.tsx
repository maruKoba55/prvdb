/* システム定数、マスタ値を管理するContext */
'use client';
import React, { createContext, useContext } from 'react';
import { SystemConstant } from '@/utils/getSystemConstants';
import { BookRoleMaster } from '@/utils/getBookRole';
import { BookClassMaster } from '@/utils/getBookClass';
import { BookFormMaster } from '@/utils/getBookForm';

interface AppContextType {
  constants: SystemConstant[];
  bookRoleMaster: BookRoleMaster[];
  bookClassMaster: BookClassMaster[];
  bookFormMaster: BookFormMaster[];
}
const AppContext = createContext<AppContextType | null>(null);

// プロバイダーコンポーネント（サーバーからデータを受け取る）
export function AppContextProvider({
  children,
  initialConstants,
  initialBookRoleMaster,
  initialBookClassMaster,
  initialBookFormMaster
}: {
  children: React.ReactNode;
  initialConstants: SystemConstant[];
  initialBookRoleMaster: BookRoleMaster[];
  initialBookClassMaster: BookClassMaster[];
  initialBookFormMaster: BookFormMaster[];
}) {
  return (
    <AppContext.Provider
      value={{
        constants: initialConstants,
        bookRoleMaster: initialBookRoleMaster,
        bookClassMaster: initialBookClassMaster,
        bookFormMaster: initialBookFormMaster
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// システム定数用フック；指定された定数を型に応じて返却
export function useSystemConstant(constantName: string): number | string | boolean | null {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useSystemConstant must be used within a AppContextProvider');
  }
  const target = context.constants.find((c) => c.constant_name === constantName);
  if (!target) return null;
  switch (target.constant_type) {
    case 'numeric':
      return Number(target.constant_value);
    case 'boolean':
      return target.constant_value === 'true';
    default:
      return target.constant_value; // text や timestamp はそのまま文字列
  }
}

// 各種マスタ用フック
export function useBookRoleMaster(): BookRoleMaster[] {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useBookRoleMaster must be used within a AppContextProvider');
  }
  return context.bookRoleMaster;
}
export function useBookClassMaster(): BookClassMaster[] {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useBookClassMaster must be used within a AppContextProvider');
  }
  return context.bookClassMaster;
}
export function useBookFormMaster(): BookFormMaster[] {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useBookFormMaster must be used within a AppContextProvider');
  }
  return context.bookFormMaster;
}
