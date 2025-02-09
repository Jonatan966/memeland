import { User, workerService } from "@/services/worker";
import { createContext, ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";
import { SunIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";

interface AuthContextProps {
  user?: User;
}

const AuthContext = createContext({} as AuthContextProps);

export function AuthProvider(props: { children: ReactNode }) {
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [user, setUser] = useState<User>();

  useEffect(() => {
    workerService
      .getUserInfo()
      .then((userInfo) => setUser(userInfo))
      .catch((error) => {
        console.log(error);
        toast.error("Não foi possível fazer login no momento :(");
      })
      .finally(() => setIsLoadingSession(false));
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
        <Button onClick={() => (window.location.href = "https://ojonatan.dev")}>
          Login com o Github
        </Button>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}
