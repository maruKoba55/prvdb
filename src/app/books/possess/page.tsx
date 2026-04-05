'use client';
import { useState, useRef } from 'react';
import InsertPossess from '@/app/books/possess/insert_possess';

//vercelによるdeploy時の <Error occurred prerendering page>避け
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div>
      <InsertPossess />
    </div>
  );
}
