import { useState, useRef, useEffect } from 'react';
import { PublisherList } from '@/utils/MyBooks/getPublisherList';

export function usePublisherIncrementalSearch(
  publisherList: PublisherList[],
  currentValue: string,
  onSelect: (value: string) => void
) {
  const [isOpen, setIsOpen] = useState(false); // リストの表示・非表示
  const [activeIndex, setActiveIndex] = useState(-1); // キーボードで選択中の位置
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const filteredList = publisherList.filter((item) => item.publisher.startsWith(currentValue || ''));

  // カーソル上下（activeIndex）に応じてスクロール追従
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const activeElement = listRef.current.children[activeIndex] as HTMLElement;
      // block: "nearest" ：選択アイテムが見えない位置にある時のみスクロールが追従
      activeElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 日本語の変換確定時は、リストの決定処理を行わない
    if (e.nativeEvent.isComposing && e.key === 'Enter') return;
    // Alt + ↓ or Alt + ↑ ：リストを開き最初の要素へ
    if (e.altKey && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      setIsOpen(true);
      setActiveIndex(0);
      //      setTimeout(() => listRef.current?.focus(), 0);
      return;
    }
    // リストが閉じている時、↓ or ↑でリストを開く（移動しない）
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setIsOpen(true);
        setActiveIndex(0);
      }
      return;
    }
    // リストが開いている時のキー操作（input側）
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev < filteredList.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        //        if (!e.nativeEvent.isComposing) {
        e.preventDefault();
        if (activeIndex >= 0 && filteredList[activeIndex]) {
          onSelect(filteredList[activeIndex].publisher);
          setIsOpen(false);
          setActiveIndex(-1);
        }
        //        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  };
  // リスト側のキー操作
  const handleListKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev < filteredList.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        //        if (!e.nativeEvent.isComposing) {
        e.preventDefault();
        if (activeIndex >= 0 && filteredList[activeIndex]) {
          onSelect(filteredList[activeIndex].publisher);
          setIsOpen(false);
          setActiveIndex(-1);
        }
        //        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
        inputRef.current?.focus();
        break;
    }
  };

  return {
    isOpen,
    setIsOpen,
    activeIndex,
    setActiveIndex,
    listRef,
    filteredList,
    handleInputKeyDown,
    handleListKeyDown
  };
}
