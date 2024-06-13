import { useState, useEffect, KeyboardEvent, useCallback, useRef } from "react";
import { Session } from "@supabase/supabase-js";
import { SunIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";

import {
  Meme,
  MemeOrderingConfig,
  supabase,
  supabaseService,
} from "./services/supabase";
import { AppAuth } from "./components/domain/app-auth";
import { Input } from "./components/ui/input";
import { Profile } from "./components/domain/profile";
import { MemeCard } from "./components/domain/meme-card";
import { CreateMemeDialog } from "./components/domain/create-meme-dialog";
import { MemeDetailsDialog } from "./components/domain/meme-details-dialog";

import { cn } from "./lib/utils";
import customStyles from "./custom.module.css";
import { workerService } from "./services/worker";
import { Button } from "./components/ui/button";
import { useDebounce } from "./hooks/use-debounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";

type OrderingType =
  | "creation_new"
  | "creation_old"
  | "frequency_big"
  | "frequency_small";

const orderingConfigs = {
  creation_new: {
    by: "created_at",
    ascending: false,
  },
  creation_old: {
    by: "created_at",
    ascending: true,
  },
  frequency_big: {
    by: "frequency",
    ascending: false,
  },
  frequency_small: {
    by: "frequency",
    ascending: true,
  },
} satisfies Record<OrderingType, MemeOrderingConfig>;

export function App() {
  const navigationButtonRef = useRef<HTMLButtonElement>(null);

  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  const [pagination, setPagination] = useState({
    itemsPerPage: 20,
    currentPage: 0,
    order: "creation_new" as OrderingType,
  });
  const [totalMemes, setTotalMemes] = useState(0);
  const [memes, setMemes] = useState<Meme[]>([]);
  const [isRetrievingMemes, setIsRetrievingMemes] = useState(false);

  const [selectedMeme, setSelectedMeme] = useState<Meme | null>(null);
  const [isMemeDialogOpen, setIsMemeDialogOpen] = useState(false);

  const hasNextPage = memes.length < totalMemes;

  const onFetchMemes = useCallback(async () => {
    if (!session?.user?.id) {
      return;
    }

    const reset = pagination.currentPage === 0;

    const { data: memes, count } = await supabaseService.findMemes({
      user_id: session.user.id,
      items_per_page: pagination.itemsPerPage,
      current_page: pagination.currentPage,
      order: orderingConfigs[pagination.order],
    });

    setMemes((old) => (reset ? memes : [...old, ...memes]));
    setTotalMemes(count);
  }, [session?.user?.id, pagination]);

  const debounceRequestNextPage = useDebounce(
    () => navigationButtonRef?.current?.click(),
    200
  );

  function onRequestNextPage() {
    setPagination((oldPagination) => ({
      ...oldPagination,
      currentPage: oldPagination.currentPage + 1,
    }));
  }

  function onRequestFirstPage() {
    setPagination((old) => ({ ...old, currentPage: 0 }));
  }

  async function handleSearchMemes(event: KeyboardEvent<HTMLInputElement>) {
    const query = event.currentTarget.value.trim();

    if (event.key !== "Enter" || !session?.access_token) {
      return;
    }

    setIsRetrievingMemes(true);

    try {
      if (query) {
        const memesResult = await workerService.searchMemes({
          userToken: session.access_token,
          query,
        });

        setMemes(memesResult.data);
        setTotalMemes(memesResult.data.length);
      } else {
        onRequestFirstPage();
      }
    } catch (error) {
      console.log(error);
      toast.error("Não foi possível fazer uma busca precisa no momento.");
    }

    setIsRetrievingMemes(false);
  }

  useEffect(() => {
    function onLoginSuccess(session: Session | null) {
      setSession(session);
      setTimeout(() => setIsLoadingSession(false), 500);
    }

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

  useEffect(() => {
    onFetchMemes();
  }, [onFetchMemes]);

  useEffect(() => {
    const handleInfiniteScroll = () => {
      const endOfPage =
        window.innerHeight + window.pageYOffset >= document.body.offsetHeight;

      if (endOfPage) {
        debounceRequestNextPage();
      }
    };

    window.addEventListener("scroll", handleInfiniteScroll);

    return () => window.removeEventListener("scroll", handleInfiniteScroll);
  }, []);

  if (isLoadingSession) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <SunIcon className="animate-spin w-8 h-8" />
        <strong>Carregando sessão...</strong>
      </div>
    );
  }

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
            className="font-bold text-2xl italic mr-auto max-sm:text-xl flex items-center"
            style={{ gridArea: "title" }}
          >
            🐸 memeland
          </h1>

          <CreateMemeDialog
            session={session}
            onAfterCreate={onRequestFirstPage}
          />
          <Profile {...{ session }} />
        </nav>

        <div className="flex gap-2 max-sm:flex-col">
          <Input
            placeholder="pesquise por um termo"
            onKeyDown={handleSearchMemes}
          />

          <Select
            defaultValue={pagination.order}
            onValueChange={(newOrder: OrderingType) =>
              setPagination((old) => ({
                ...old,
                currentPage: 0,
                order: newOrder,
              }))
            }
          >
            <SelectTrigger className="sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="creation_new">
                Criação (Mais recente)
              </SelectItem>
              <SelectItem value="creation_old">
                Criação (Mais antigo)
              </SelectItem>
              <SelectItem value="frequency_big">Frequência (Maior)</SelectItem>
              <SelectItem value="frequency_small">
                Frequência (Menor)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      {isRetrievingMemes && (
        <SunIcon className="animate-spin w-8 h-8 mx-auto" />
      )}

      <main className="container max-sm:px-4 columns-1 sm:columns-2 md:columns-3 lg:columns-5">
        {!isRetrievingMemes &&
          memes.map((meme) => (
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

      <div className="container flex justify-center my-2">
        {hasNextPage && (
          <Button ref={navigationButtonRef} onClick={onRequestNextPage}>
            Ver mais
          </Button>
        )}
      </div>

      <MemeDetailsDialog
        meme={selectedMeme}
        isOpen={isMemeDialogOpen}
        onClose={() => setIsMemeDialogOpen(false)}
      />
    </>
  );
}
