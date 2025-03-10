import {
  useState,
  useEffect,
  KeyboardEvent,
  useCallback,
  useRef,
  useContext,
} from "react";
import { SunIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";

import { Input } from "./components/ui/input";
import { SignOut } from "./components/domain/sign-out";
import { MemeCard } from "./components/domain/meme-card";
import { CreateMemeDialog } from "./components/domain/create-meme-dialog";
import { MemeDetailsDialog } from "./components/domain/meme-details-dialog";

import { cn } from "./lib/utils";
import customStyles from "./custom.module.css";
import { workerService, Meme } from "./services/worker";
import { Button } from "./components/ui/button";
import { useDebounce } from "./hooks/use-debounce";
import {
  MemesOrderSelector,
  orderingConfigs,
  OrderingType,
} from "./components/domain/memes-order-selector";
import { AuthContext } from "./contexts/AuthContext";
import { SignIn } from "./components/domain/sign-in";

export function App() {
  const { user } = useContext(AuthContext);
  const navigationButtonRef = useRef<HTMLButtonElement>(null);

  const [pagination, setPagination] = useState({
    itemsPerPage: 25,
    currentPage: 0,
    order: "creation_new" as OrderingType,
  });
  const [totalMemes, setTotalMemes] = useState(0);
  const [memes, setMemes] = useState<Meme[]>([]);
  const [isRetrievingMemes, setIsRetrievingMemes] = useState(false);

  const [selectedMeme, setSelectedMeme] = useState<Meme | null>(null);
  const [isMemeDialogOpen, setIsMemeDialogOpen] = useState(false);

  const hasNextPage = !!user && memes.length < totalMemes;

  const onFetchMemes = useCallback(async () => {
    const reset = pagination.currentPage === 0;

    const { memes, count } = await workerService.listMemes({
      itemsPerPage: pagination.itemsPerPage,
      currentPage: pagination.currentPage,
      order: orderingConfigs[pagination.order],
    });

    setMemes((old) => (reset ? memes : [...old, ...memes]));
    setTotalMemes(count);
  }, [pagination]);

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

    if (event.key !== "Enter") {
      return;
    }

    setIsRetrievingMemes(true);

    try {
      if (query) {
        const memesResult = await workerService.searchMemes({
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
    if (!user) {
      setMemes([]);
      return;
    }

    onFetchMemes();
  }, [onFetchMemes, user]);

  useEffect(() => {
    const handleInfiniteScroll = () => {
      const endOfPage =
        window.innerHeight + window.scrollY >= document.body.offsetHeight;

      if (endOfPage) {
        debounceRequestNextPage();
      }
    };

    window.addEventListener("scroll", handleInfiniteScroll);

    return () => window.removeEventListener("scroll", handleInfiniteScroll);
  }, []);

  return (
    <>
      <header className="container max-sm:px-4 pb-4 sticky top-0 z-10 bg-background">
        <nav className={cn("py-4 flex gap-4", customStyles.navigation)}>
          <h1
            className="font-bold text-2xl italic mr-auto max-sm:text-xl flex items-center flex-1"
            style={{ gridArea: "title" }}
          >
            🐸 memeland
          </h1>

          {user && (
            <>
              <CreateMemeDialog onAfterCreate={onRequestFirstPage} />
              <SignOut />
            </>
          )}
        </nav>

        <div className="flex gap-2">
          <Input
            placeholder="pesquise por um termo"
            onKeyDown={handleSearchMemes}
            disabled={!user}
          />

          <MemesOrderSelector
            defaultValue={pagination.order}
            disabled={!user}
            onChange={(newOrder) =>
              setPagination((old) => ({
                ...old,
                currentPage: 0,
                order: newOrder,
              }))
            }
          />
        </div>
      </header>

      {isRetrievingMemes && (
        <SunIcon className="animate-spin w-8 h-8 mx-auto" />
      )}

      <main className="container max-sm:px-4 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
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

      {!user && (
        <div className="absolute inset-0 flex items-center justify-center">
          <SignIn />
        </div>
      )}
    </>
  );
}
