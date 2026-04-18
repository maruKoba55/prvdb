/** 10桁13桁ハイフン有り無しISBNから13桁ハイフン有りISBNを作成 */
/** https://note.com/tosh1965/n/ndb9b11644c34 掲載のPHP関数をJavascriptに書き換え */

export function isbnHyphenate(str: string) {
  let a = str;

  // 全角数字を半角に変換
  a = a.replace(/[０-９]/g, (s) => {
    return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
  });

  // 数値のみを抽出
  a = a.replace(/\D/g, '');

  // 10桁ISBN（またはチェックデジットがXで数値のみ抽出され9桁になったもの）を13桁に変換
  if (a.length === 9 || a.length === 10) {
    const step1 = 9 + 8 + parseInt(a[1]) + parseInt(a[3]) + parseInt(a[5]) + parseInt(a[7]);
    const step2 = (7 + 4 + parseInt(a[2]) + parseInt(a[4]) + parseInt(a[6]) + parseInt(a[8])) * 3;
    const cd = (10 - Number(String(step1 + step2).slice(-1))) % 10;

    // 接頭記号978 + 10桁の先頭9桁 + 算出したチェックデジット
    a = '978' + a.substring(0, 9) + String(cd).slice(-1);
  }

  // 13桁ISBNのハイフン付け処理
  if (a.length === 13) {
    const pubCode2 = parseInt(a.substring(4, 6)); // 出版社記号判別用

    if (pubCode2 < 20) {
      a = `978-4-${a.substring(4, 6)}-${a.substring(6, 12)}-${a.substring(12, 13)}`;
    } else if (pubCode2 < 70) {
      a = `978-4-${a.substring(4, 7)}-${a.substring(7, 12)}-${a.substring(12, 13)}`;
    } else if (pubCode2 < 85) {
      a = `978-4-${a.substring(4, 8)}-${a.substring(8, 12)}-${a.substring(12, 13)}`;
    } else if (pubCode2 < 90) {
      a = `978-4-${a.substring(4, 9)}-${a.substring(9, 12)}-${a.substring(12, 13)}`;
    } else if (pubCode2 < 95) {
      a = `978-4-${a.substring(4, 10)}-${a.substring(10, 12)}-${a.substring(12, 13)}`;
    } else {
      a = `978-4-${a.substring(4, 11)}-${a.substring(11, 12)}-${a.substring(12, 13)}`;
    }
  } else {
    a = ''; // ISBNではない場合
  }

  return a;
}
