import { auth, User, workerService } from "@/services/worker";
import { createContext, ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";
import { SunIcon, GitHubLogoIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { mountGithubAuthUrl } from "@/utils/mount-github-auth-url";
import { setUrlSearchParams } from "@/utils/set-url-search-params";

interface AuthContextProps {
  user?: User;
  signOut(): void;
}

export const AuthContext = createContext({} as AuthContextProps);

const searchParams = new URLSearchParams(window.location.search);

export function AuthProvider(props: { children: ReactNode }) {
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [user, setUser] = useState<User>();

  function signOut() {
    // TODO: Clear session via API

    auth.clearTokens();
    setUser(undefined);
  }

  useEffect(() => {
    async function processAuth() {
      try {
        const code = searchParams.get("code");

        if (code) {
          await workerService.authenticate(code);
        }

        const userInfo = await workerService.getUserInfo();

        setUser(userInfo);
      } catch (error) {
        console.log(error);
        toast.error("Não foi possível fazer login no momento :(");
      }

      const newUrl = setUrlSearchParams(window.location.href, {});
      window.history.pushState({ path: newUrl }, "", newUrl);

      setIsLoadingSession(false);
    }

    processAuth();
  }, []);

  if (isLoadingSession) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <SunIcon className="animate-spin w-8 h-8" />
        <strong>Carregando sessão...</strong>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Button onClick={() => (window.location.href = mountGithubAuthUrl())}>
          <GitHubLogoIcon className="mr-1" />
          Login com o Github
        </Button>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        signOut,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
