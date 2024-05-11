/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../../ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "../../ui/form";
import { Textarea } from "../../ui/textarea";
import { useForm } from "react-hook-form";
import { Input } from "../../ui/input";
import { KeywordSelector } from "./keyword-selector";
import { workerService } from "@/services/worker";
import { Session } from "@supabase/supabase-js";
import { useState } from "react";
import { ImageIcon, SunIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";

interface CreateMemeDialogProps {
  session: Session;
}

interface CreateMemeDTO {
  meme: File;
  description: string;
  keywords: string[];
}

export function CreateMemeDialog({ session }: CreateMemeDialogProps) {
  const form = useForm<CreateMemeDTO>();
  const [isSendingMeme, setIsSendingMeme] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  async function onSubmit(data: CreateMemeDTO) {
    const maxFileSize = 1024 * 1500; //1.5MB

    if (data.meme.size > maxFileSize) {
      form.setError("meme", {
        message: "O tamanho do arquivo pode ser até 1.5MB",
      });

      toast.error("O tamanho do arquivo pode ser até 1.5MB");

      return;
    }

    setIsSendingMeme(true);

    try {
      await workerService.sendMeme({
        ...data,
        userToken: session.access_token,
      });

      setIsDialogOpen(false);

      toast.success("Meme enviado com sucesso!");
    } catch (error) {
      console.log(error);
    }

    setIsSendingMeme(false);
  }

  async function onGenerateKeywords() {
    const [description, oldKeywords = []] = form.getValues([
      "description",
      "keywords",
    ]);

    if (!description?.trim()) {
      return;
    }

    const { keywords: newKeywords } = await workerService.generateKeywords({
      description,
      userToken: session.access_token,
    });

    form.setValue("keywords", [...new Set([...oldKeywords, ...newKeywords])]);
  }

  function onOpenChange(isOpen: boolean) {
    if (isOpen) {
      form.reset();
    }

    setIsDialogOpen(isOpen);
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="h-full" style={{ gridArea: "newMeme" }}>
          <ImageIcon className="mr-1" />
          Novo meme
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo meme</DialogTitle>
          <DialogDescription>
            Preencha as informações abaixo para adicionar um novo meme
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="meme"
              rules={{
                required: true,
              }}
              render={({ field: { onChange, value: _, ...field } }) => (
                <FormItem>
                  <FormLabel>Meme</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="w-full"
                      type="file"
                      onChange={(event) => onChange(event.target.files![0])}
                      accept="image/jpeg,image/webp,image/png,video/mp4,image/gif"
                    />
                  </FormControl>
                  <FormDescription>Selecione o arquivo do meme</FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              rules={{
                required: true,
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormDescription>
                    Descreva o meme detalhadamente
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="keywords"
              rules={{
                required: true,
              }}
              render={({ field }) => (
                <KeywordSelector
                  onChange={field.onChange}
                  keywords={field.value}
                  onGenerateKeywords={onGenerateKeywords}
                />
              )}
            />

            <div className="grid grid-cols-2 gap-2">
              <DialogClose asChild>
                <Button
                  variant="secondary"
                  type="button"
                  disabled={isSendingMeme}
                >
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSendingMeme}>
                {isSendingMeme ? (
                  <SunIcon className="animate-spin" />
                ) : (
                  "Enviar"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
