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
import { CaretSortIcon } from "@radix-ui/react-icons";
import { useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";

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
  form: UseFormReturn;
}

export function KeywordSelector({ form }: KeywordSelectorProps) {
  const [open, setOpen] = useState(false);

  const keywords = form.watch("keywords", []) as string[];

  const keywordSearchInputRef = useRef<HTMLInputElement>(null);

  function onAddNewKeyword() {
    form.setValue("keywords", [
      ...keywords,
      keywordSearchInputRef.current!.value,
    ]);

    setOpen(false);
  }

  function onRemoveKeyword(keywordIndex: number) {
    form.setValue(
      "keywords",
      keywords.filter((_, index) => index !== keywordIndex)
    );
  }

  return (
    <FormItem>
      <FormLabel>Palavras-chave</FormLabel>

      <div className="flex flex-wrap gap-1">
        {keywords.map((keyword, index) => (
          <Badge key={keyword} onClick={() => onRemoveKeyword(index)}>
            {keyword}
          </Badge>
        ))}
      </div>

      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
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
                        form.setValue("keywords", [...keywords, currentValue]);
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

        <Button type="button">Gerar</Button>
      </div>

      <FormDescription>
        Liste todos os pontos principais do meme
      </FormDescription>
    </FormItem>
  );
}
