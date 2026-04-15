export function toWarekiYear(year: number) {
  if (year >= 2019) {
    return `令和${year - 2018}年`;
  } else if (year >= 1989) {
    return `平成${year - 1988}年`;
  } else if (year >= 1926) {
    return `昭和${year - 1925}年`;
  } else if (year >= 1912) {
    return `大正${year - 1911}年`;
  } else if (year >= 1868) {
    return `明治${year - 1867}年`;
  } else {
    return null;
  }
}
