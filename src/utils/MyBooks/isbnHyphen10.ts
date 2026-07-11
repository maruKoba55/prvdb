/** 10桁ハイフン有り無しISBNにハイフンを挿入 */
/** https://note.com/tosh1965/n/ndb9b11644c34 掲載のPHP関数を改変 */

let cd: string;

export function isbnHyphen10(str: string) {
  let a = str;
  if (!a) return null;

  // 全角数字を半角に変換、数値のみを抽出
  a = a.replace(/[０-９]/g, (s) => {
    return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
  });
  if (!a.startsWith('4')) return null; // 日本のISBNではない
  const originalCd = a.slice(-1);
  a = a.replace(/\D/g, '');
  if (a.length === 10) {
    //チェックデジット算出へ
  } else if (a.length === 9) {
    if (originalCd === 'X') {
      a += originalCd;
    } else {
      return null; // 元のチェックデジットが不正
    }
  } else {
    return null; //桁数が不正
  }

  // チェックデジット算出
  const step1 =
    parseInt(a[0]) * 10 +
    parseInt(a[1]) * 9 +
    parseInt(a[2]) * 8 +
    parseInt(a[3]) * 7 +
    parseInt(a[4]) * 6 +
    parseInt(a[5]) * 5 +
    parseInt(a[6]) * 4 +
    parseInt(a[7]) * 3 +
    parseInt(a[8]) * 2;
  const step2 = 11 - (step1 % 11);
  if (step2 === 10) {
    cd = 'X';
  } else {
    cd = String(step2).slice(-1);
  }
  if (cd !== originalCd) return null;

  // ハイフン挿入
  const pubCode2 = parseInt(a.substring(1, 3)); // 出版社記号判別用
  if (pubCode2 < 20) {
    a = `${a.substring(0, 1)}-${a.substring(1, 3)}-${a.substring(3, 9)}-${cd}`;
  } else if (pubCode2 < 70) {
    a = `${a.substring(0, 1)}-${a.substring(1, 4)}-${a.substring(4, 9)}-${cd}`;
  } else if (pubCode2 < 85) {
    a = `${a.substring(0, 1)}-${a.substring(1, 5)}-${a.substring(5, 9)}-${cd}`;
  } else if (pubCode2 < 90) {
    a = `${a.substring(0, 1)}-${a.substring(1, 6)}-${a.substring(6, 9)}-${cd}`;
  } else if (pubCode2 < 95) {
    a = `${a.substring(0, 1)}-${a.substring(1, 7)}-${a.substring(7, 9)}-${cd}`;
  } else {
    a = `${a.substring(0, 1)}-${a.substring(1, 8)}-${a.substring(8, 9)}-${cd}`;
  }

  return a;
}
