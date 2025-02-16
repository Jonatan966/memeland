import { ExitIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import { AuthContext } from "@/contexts/AuthContext";
import { useContext } from "react";

export function SignOut() {
  const { signOut } = useContext(AuthContext);

  return (
    <Button variant="secondary" onClick={signOut}>
      <ExitIcon className="mr-2" /> sair
    </Button>
  );
}
