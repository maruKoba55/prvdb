/* 書籍管理（MyBooks）用マスタ値等を管理するContext */
'use client';
import React, { createContext, useContext } from 'react';
import { BookRoleMaster } from '@/utils/MyBooks/getBookRole';
import { BookClassMaster } from '@/utils/MyBooks/getBookClass';
import { BookFormMaster } from '@/utils/MyBooks/getBookForm';
import { BookPublisherList } from '@/utils/MyBooks/getBookPublisherList';

interface MyBooksContextType {
  bookRoleMaster: BookRoleMaster[];
  bookClassMaster: BookClassMaster[];
  bookFormMaster: BookFormMaster[];
  bookPublisherList: BookPublisherList[];
}
const MyBooksContext = createContext<MyBooksContextType | null>(null);

// プロバイダーコンポーネント（サーバーからデータを受け取る）
export function MyBooksContextProvider({
  children,
  initialBookRoleMaster,
  initialBookClassMaster,
  initialBookFormMaster,
  initialBookPublisherList
}: {
  children: React.ReactNode;
  initialBookRoleMaster: BookRoleMaster[];
  initialBookClassMaster: BookClassMaster[];
  initialBookFormMaster: BookFormMaster[];
  initialBookPublisherList: BookPublisherList[];
}) {
  return (
    <MyBooksContext.Provider
      value={{
        bookRoleMaster: initialBookRoleMaster,
        bookClassMaster: initialBookClassMaster,
        bookFormMaster: initialBookFormMaster,
        bookPublisherList: initialBookPublisherList
      }}
    >
      {children}
    </MyBooksContext.Provider>
  );
}

// 各種マスタ、リスト用フック
export function useBookRoleMaster(): BookRoleMaster[] {
  const context = useContext(MyBooksContext);
  if (!context) {
    throw new Error('useBookRoleMaster must be used within a MyBooksContextProvider');
  }
  return context.bookRoleMaster;
}
export function useBookClassMaster(): BookClassMaster[] {
  const context = useContext(MyBooksContext);
  if (!context) {
    throw new Error('useBookClassMaster must be used within a MyBooksContextProvider');
  }
  return context.bookClassMaster;
}
export function useBookFormMaster(): BookFormMaster[] {
  const context = useContext(MyBooksContext);
  if (!context) {
    throw new Error('useBookFormMaster must be used within a MyBooksContextProvider');
  }
  return context.bookFormMaster;
}
export function useBookPublisherList(): BookPublisherList[] {
  const context = useContext(MyBooksContext);
  if (!context) {
    throw new Error('useBookPublisherList must be used within a MyBooksContextProvider');
  }
  return context.bookPublisherList;
}
