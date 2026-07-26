/* app全体のシステム定数、マスタ値を管理するContext */
'use client';
import React, { createContext, useContext } from 'react';
import { SystemConstant } from '@/utils/getSystemConstants';

interface AppContextType {
  constants: SystemConstant[];
}
const AppContext = createContext<AppContextType | null>(null);

// プロバイダーコンポーネント（サーバーからデータを受け取る）
export function AppContextProvider({
  children,
  initialConstants
}: {
  children: React.ReactNode;
  initialConstants: SystemConstant[];
}) {
  return (
    <AppContext.Provider
      value={{
        constants: initialConstants
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
