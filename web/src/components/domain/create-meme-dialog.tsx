import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
} from "../ui/form";
import { Textarea } from "../ui/textarea";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { Badge } from "../ui/badge";

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

export function CreateMemeDialog() {
  const form = useForm();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  return (
    <Dialog>
      <DialogTrigger>
        <Button>Novo meme</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo meme</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4">
            <FormItem>
              <FormLabel>Meme</FormLabel>
              <FormControl>
                <input className="w-full" type="file" name="meme" id="meme" />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea />
              </FormControl>
              <FormDescription>Descreva o meme detalhadamente</FormDescription>
            </FormItem>

            <FormItem>
              <FormLabel>Palavras-chave</FormLabel>

              <div className="flex flex-wrap gap-1">
                <Badge>Batata</Badge>
                <Badge>Batata</Badge>
                <Badge>Batata</Badge>
                <Badge>Batata</Badge>
                <Badge>Batata</Badge>
                <Badge>Batata</Badge>
                <Badge>Batata</Badge>
                <Badge>Batata</Badge>
                <Badge>Batata</Badge>
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
                      {value
                        ? frameworks.find(
                            (framework) => framework.value === value
                          )?.label
                        : "Selecione uma palavra chave..."}
                      <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search framework..."
                        className="h-9"
                      />
                      <CommandEmpty>No framework found.</CommandEmpty>
                      <CommandGroup>
                        <CommandList>
                          {frameworks.map((framework) => (
                            <CommandItem
                              key={framework.value}
                              value={framework.value}
                              onSelect={(currentValue: any) => {
                                setValue(
                                  currentValue === value ? "" : currentValue
                                );
                                setOpen(false);
                              }}
                            >
                              {framework.label}
                              <CheckIcon
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  value === framework.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
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
          </form>
        </Form>

        <div className="grid grid-cols-2 gap-2">
          <DialogClose asChild>
            <Button variant="secondary">Cancelar</Button>
          </DialogClose>
          <Button>Enviar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
