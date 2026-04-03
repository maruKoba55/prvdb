export function toWarekiYear(year: number) {
  if (year >= 2019) {
    return `R${year - 2018}`;
  } else if (year >= 1989) {
    return `H${year - 1988}`;
  } else if (year >= 1926) {
    return `S${year - 1925}`;
  } else if (year >= 1912) {
    return `T${year - 1911}`;
  } else if (year >= 1868) {
    return `M${year - 1867}`;
  } else {
    return year.toString();
  }
}
