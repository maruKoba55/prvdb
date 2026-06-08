export function toWarekiYear(year: number) {
  if (year >= 2020) {
    return `令和${year - 2018}年`;
  } else if (year === 2019) {
    return `平成31/令和元年`;
  } else if (year >= 1990) {
    return `平成${year - 1988}年`;
  } else if (year === 1989) {
    return `昭和64/平成元年`;
  } else if (year >= 1927) {
    return `昭和${year - 1925}年`;
  } else if (year === 1926) {
    return `大正15/昭和元年`;
  } else if (year >= 1913) {
    return `大正${year - 1911}年`;
  } else if (year === 1912) {
    return `明治45/大正元年`;
  } else if (year >= 1869) {
    return `明治${year - 1867}年`;
  } else if (year === 1868) {
    return `慶応4/明治元年`;
  } else {
    return null;
  }
}
