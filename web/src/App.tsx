import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";

import { supabase } from "./services/supabase";
import { AppAuth } from "./components/domain/app-auth";
import { Input } from "./components/ui/input";
import { Profile } from "./components/domain/profile";
import { MemeCard } from "./components/domain/meme-card";
import { CreateMemeDialog } from "./components/domain/create-meme-dialog";

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

  return (
    <>
      <header className="container mb-4">
        <nav className="py-4 flex items-center gap-4">
          <h1 className="font-bold text-2xl italic mr-auto">🐸 memeland</h1>

          <CreateMemeDialog />
          <Profile {...{ session }} />
        </nav>

        <div>
          <Input placeholder="pesquise por um termo" />
        </div>
      </header>

      <main className="container columns-1 sm:columns-2 md:columns-3 lg:columns-5">
        <MemeCard />
        <MemeCard />
        <MemeCard />
        <MemeCard />
        <MemeCard />
        <MemeCard />
        <MemeCard />
        <MemeCard />
        <MemeCard />
        <MemeCard />
        <MemeCard />
        <MemeCard />
        <MemeCard />
        <MemeCard />
        <MemeCard />
      </main>
    </>
  );
}
