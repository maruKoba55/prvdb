'use client';
import { useState, useRef } from 'react';
import EditBooks from '@/app/books/edit_books';

export default function Home() {
  return (
    <div>
      <EditBooks />
    </div>
  );
}
