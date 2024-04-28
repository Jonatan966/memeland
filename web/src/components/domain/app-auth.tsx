import { supabase } from "@/services/supabase";
import { Auth, AuthCard } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

export function AppAuth() {
  return (
    <div className="h-svh flex items-center justify-center">
      <AuthCard
        appearance={{
          className: "bg-zinc-950",
        }}
      >
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="dark"
        />
      </AuthCard>
    </div>
  );
}
