/* 書籍管理（MyBooks）用マスタ値等を管理するContext */
'use client';
import React, { createContext, useContext } from 'react';
import { BookRoleMaster } from '@/utils/MyBooks/getBookRole';
import { BookClassMaster } from '@/utils/MyBooks/getBookClass';
import { BookFormMaster } from '@/utils/MyBooks/getBookForm';
import { PublisherList } from '@/utils/MyBooks/getPublisherList';

interface MyBooksContextType {
  bookRoleMaster: BookRoleMaster[];
  bookClassMaster: BookClassMaster[];
  bookFormMaster: BookFormMaster[];
  publisherList: PublisherList[];
}
const MyBooksContext = createContext<MyBooksContextType | null>(null);

// プロバイダーコンポーネント（サーバーからデータを受け取る）
export function MyBooksContextProvider({
  children,
  initialBookRoleMaster,
  initialBookClassMaster,
  initialBookFormMaster,
  initialPublisherList
}: {
  children: React.ReactNode;
  initialBookRoleMaster: BookRoleMaster[];
  initialBookClassMaster: BookClassMaster[];
  initialBookFormMaster: BookFormMaster[];
  initialPublisherList: PublisherList[];
}) {
  return (
    <MyBooksContext.Provider
      value={{
        bookRoleMaster: initialBookRoleMaster,
        bookClassMaster: initialBookClassMaster,
        bookFormMaster: initialBookFormMaster,
        publisherList: initialPublisherList
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
export function usePublisherList(): PublisherList[] {
  const context = useContext(MyBooksContext);
  if (!context) {
    throw new Error('usePublisherList must be used within a MyBooksContextProvider');
  }
  return context.publisherList;
}
