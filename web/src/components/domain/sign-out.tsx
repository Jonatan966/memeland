import { supabase } from "@/services/supabase";
import { useState } from "react";
import { ExitIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";

export function SignOut() {
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function onSignOut() {
    setIsSigningOut(true);

    await supabase.auth.signOut();

    setIsSigningOut(false);
  }

  return (
    <Button variant="secondary" disabled={isSigningOut} onClick={onSignOut}>
      {isSigningOut ? (
        "Saindo..."
      ) : (
        <>
          <ExitIcon className="mr-2" /> sair
        </>
      )}
    </Button>
  );
}
