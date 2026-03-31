import { useState, useRef } from 'react';
import styles from './page.module.css';
import { BookTypeList } from './options.booktype.tsx';

export default function input_book_possess() {
  return (
    <div className={styles.container}>
      <h1>書籍管理</h1>
      <h2>ID</h2>
      <select defaultValue="紙">
        <BookTypeList />
      </select>
    </div>
  );
}
