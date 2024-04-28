import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./services/supabase";
import { AppAuth } from "./components/domain/app-auth";

export function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return <AppAuth />;
  }

  return <div>Logged in!</div>;
}
