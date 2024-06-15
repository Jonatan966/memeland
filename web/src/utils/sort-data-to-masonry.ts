export function sortDataToMasonry<T>(
  data: T[],
  columns: number,
  getDummy: () => T,
) {
  const newList: T[] = [];

  const rows = Math.ceil(data.length / columns);

  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      const targetMeme = data[j * columns + i];

      newList.push(targetMeme || getDummy());
    }
  }

  return newList;
}
