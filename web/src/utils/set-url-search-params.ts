export function setUrlSearchParams(
  url: string,
  searchParams: Record<string, string>
) {
  const newUrl = new URL(url);

  newUrl.search = new URLSearchParams(searchParams).toString();

  return newUrl.toString();
}
