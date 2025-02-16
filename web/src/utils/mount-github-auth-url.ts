export function mountGithubAuthUrl() {
  const mountedUrl = new URL("https://github.com/login/oauth/authorize");

  mountedUrl.searchParams.set(
    "client_id",
    import.meta.env.VITE_GITHUB_CLIENT_ID
  );
  mountedUrl.searchParams.set(
    "redirect_uri",
    import.meta.env.VITE_GITHUB_REDIRECT_URL
  );
  mountedUrl.searchParams.set("state", import.meta.env.VITE_GITHUB_STATE);
  mountedUrl.searchParams.set("scope", "read:user");
  console.log(mountedUrl.toString());
  return mountedUrl.toString();
}
