import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FormDescription, FormItem, FormLabel } from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CaretSortIcon, SunIcon } from "@radix-ui/react-icons";
import { useRef, useState } from "react";

const frameworks = [
  {
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
];

interface KeywordSelectorProps {
  keywords?: string[];
  onChange(newKeywords: string[]): void;
  onGenerateKeywords(): Promise<void>;
}

export function KeywordSelector({
  keywords = [],
  onChange,
  onGenerateKeywords,
}: KeywordSelectorProps) {
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const keywordSearchInputRef = useRef<HTMLInputElement>(null);

  function onAddNewKeyword() {
    onChange([...keywords, keywordSearchInputRef.current!.value]);

    setOpen(false);
  }

  function onRemoveKeyword(keywordIndex: number) {
    onChange(keywords.filter((_, index) => index !== keywordIndex));
  }

  async function handleGenerateKeywords() {
    setIsGenerating(true);

    await onGenerateKeywords();

    setIsGenerating(false);
  }

  return (
    <FormItem>
      <FormLabel>Palavras-chave</FormLabel>

      <div className="flex flex-wrap gap-1">
        {keywords.map((keyword, index) => (
          <Badge
            key={keyword}
            onClick={() => !isGenerating && onRemoveKeyword(index)}
          >
            {keyword}
          </Badge>
        ))}
      </div>

      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild disabled={isGenerating}>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="justify-between w-full"
            >
              Selecione uma palavra chave...
              <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="p-0">
            <Command>
              <CommandInput
                placeholder="Search framework..."
                className="h-9"
                ref={keywordSearchInputRef}
              />
              <Button
                className="mx-1 mt-1"
                variant="secondary"
                type="button"
                onClick={onAddNewKeyword}
              >
                Adicionar palavra-chave
              </Button>

              <CommandEmpty>Nenhuma palavra-chave foi encontrada.</CommandEmpty>

              <CommandGroup>
                <CommandList>
                  {frameworks.map((framework) => (
                    <CommandItem
                      key={framework.value}
                      value={framework.value}
                      onSelect={(currentValue: string) => {
                        onChange([...keywords, currentValue]);
                        setOpen(false);
                      }}
                    >
                      {framework.label}
                    </CommandItem>
                  ))}
                </CommandList>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        <Button
          type="button"
          onClick={handleGenerateKeywords}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              Gerando... <SunIcon className="animate-spin ml-2" />
            </>
          ) : (
            "Gerar"
          )}
        </Button>
      </div>

      <FormDescription>
        Liste todos os pontos principais do meme
      </FormDescription>
    </FormItem>
  );
}
