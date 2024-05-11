export async function sha1(data: any) {
  const digest = await crypto.subtle.digest("SHA-1", data);
  const array = Array.from(new Uint8Array(digest));

  return array.map((b) => b.toString(16).padStart(2, "0")).join("");
}
