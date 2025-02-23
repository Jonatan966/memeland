import { GitHubLogoIcon, SunIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import { useState } from "react";
import { toast } from "sonner";

export function SignIn() {
  const [isLoading, setIsLoading] = useState(false);

  function onSignIn() {
    setIsLoading(true);

    try {
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

      window.location.href = mountedUrl.toString();
    } catch (error) {
      console.log(error);
      toast.error("Não foi possível fazer login no momento :(");

      setIsLoading(false);
    }
  }

  return (
    <Button onClick={onSignIn} disabled={isLoading}>
      {isLoading ? (
        <SunIcon className="animate-spin mr-1" />
      ) : (
        <GitHubLogoIcon className="mr-1" />
      )}
      Login com o Github
    </Button>
  );
}
