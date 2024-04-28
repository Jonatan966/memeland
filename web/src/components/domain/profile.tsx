import { Session } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { supabase } from "@/services/supabase";
import { useState } from "react";

interface ProfileProps {
  session: Session;
}

export function Profile({ session }: ProfileProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function onSignOut() {
    setIsSigningOut(true);

    await supabase.auth.signOut();

    setIsSigningOut(false);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center h-10 gap-2 bg-zinc-800 rounded-full p-1 pr-4">
          {isSigningOut ? (
            <span>Saindo...</span>
          ) : (
            <>
              <Avatar className="w-8 h-8">
                <AvatarImage src="https://github.com/Jonatan966.png" />
                <AvatarFallback>JO</AvatarFallback>
              </Avatar>
              <span className="font-semibold">Usuário Tal</span>
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={onSignOut}>Sair</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
