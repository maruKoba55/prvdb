/** 10桁13桁ハイフン有り無しISBNから13桁ハイフン有りISBNを作成 */
/** https://note.com/tosh1965/n/ndb9b11644c34 掲載のPHP関数を改変 */

const prefixJapan = '978';

export function isbnHyphenate(str: string) {
  let a = str;
  if (!a) return null;

  // 全角数字を半角に変換、数値のみを抽出
  a = a.replace(/[０-９]/g, (s) => {
    return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
  });
  a = a.replace(/\D/g, '');
  if (a.startsWith('4') && (a.length === 9 || a.length === 10)) {
    a = prefixJapan + a;
  } else if (a.startsWith(`${prefixJapan}4`) && a.length === 13) {
    // チェックデジット算出へ
  } else {
    return null; // 日本のISBNではない
  }

  // チェックデジット算出
  const step1 = parseInt(a[0]) + parseInt(a[2]) + parseInt(a[4]) + parseInt(a[6]) + parseInt(a[8]) + parseInt(a[10]);
  const step2 =
    (parseInt(a[1]) + parseInt(a[3]) + parseInt(a[5]) + parseInt(a[7]) + parseInt(a[9]) + parseInt(a[11])) * 3;
  const cd = (10 - Number(String(step1 + step2).slice(-1))) % 10;

  // 13桁ISBNのハイフン挿入
  const pubCode2 = parseInt(a.substring(4, 6)); // 出版社記号判別用
  if (pubCode2 < 20) {
    a = `978-${a.substring(3, 4)}-${a.substring(4, 6)}-${a.substring(6, 12)}-${cd}`;
  } else if (pubCode2 < 70) {
    a = `978-${a.substring(3, 4)}-${a.substring(4, 7)}-${a.substring(7, 12)}-${cd}`;
  } else if (pubCode2 < 85) {
    a = `978-${a.substring(3, 4)}-${a.substring(4, 8)}-${a.substring(8, 12)}-${cd}`;
  } else if (pubCode2 < 90) {
    a = `978-${a.substring(3, 4)}-${a.substring(4, 9)}-${a.substring(9, 12)}-${cd}`;
  } else if (pubCode2 < 95) {
    a = `978-${a.substring(3, 4)}-${a.substring(4, 10)}-${a.substring(10, 12)}-${cd}`;
  } else {
    a = `978-${a.substring(3, 4)}-${a.substring(4, 11)}-${a.substring(11, 12)}-${cd}`;
  }

  return a;
}
