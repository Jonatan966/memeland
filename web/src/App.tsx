import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";

import { Meme, supabase, supabaseService } from "./services/supabase";
import { AppAuth } from "./components/domain/app-auth";
import { Input } from "./components/ui/input";
import { Profile } from "./components/domain/profile";
import { MemeCard } from "./components/domain/meme-card";
import { CreateMemeDialog } from "./components/domain/create-meme-dialog";
import { MemeDetailsDialog } from "./components/domain/meme-details-dialog";

import { cn } from "./lib/utils";
import customStyles from "./custom.module.css";

export function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [memes, setMemes] = useState<Meme[]>([]);

  const [selectedMeme, setSelectedMeme] = useState<Meme | null>(null);
  const [isMemeDialogOpen, setIsMemeDialogOpen] = useState(false);

  function onLoginSuccess(session: Session | null) {
    setSession(session);

    if (session) {
      supabaseService.findMemes(session.user.id).then(setMemes);
    }
  }

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => onLoginSuccess(session));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      onLoginSuccess(session)
    );

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return <AppAuth />;
  }

  return (
    <>
      <header className="container max-sm:px-4 mb-4">
        <nav
          className={cn(
            "py-4 grid grid-cols-[1fr_auto_auto] gap-4",
            customStyles.navigation
          )}
        >
          <h1
            className="font-bold text-2xl italic mr-auto"
            style={{ gridArea: "title" }}
          >
            🐸 memeland
          </h1>

          <CreateMemeDialog {...{ session }} />
          <Profile {...{ session }} />
        </nav>

        <div>
          <Input placeholder="pesquise por um termo" />
        </div>
      </header>

      <main className="container max-sm:px-4 columns-1 sm:columns-2 md:columns-3 lg:columns-5">
        {memes.map((meme) => (
          <MemeCard
            key={meme.id}
            meme={meme}
            onSelect={() => {
              setSelectedMeme(meme);
              setIsMemeDialogOpen(true);
            }}
          />
        ))}
      </main>

      <MemeDetailsDialog
        meme={selectedMeme}
        isOpen={isMemeDialogOpen}
        onClose={() => setIsMemeDialogOpen(false)}
      />
    </>
  );
}
