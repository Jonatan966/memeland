import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";

export function SignIn() {
  function mountGithubAuthUrl() {
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

  return (
    <Button onClick={() => (window.location.href = mountGithubAuthUrl())}>
      <GitHubLogoIcon className="mr-1" />
      Login com o Github
    </Button>
  );
}
