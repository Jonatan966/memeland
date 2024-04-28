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

export function CreateMemeDialog() {
  const form = useForm();

  function onSubmit(data: unknown) {
    console.log(data);
  }

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
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="meme"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Meme</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="w-full"
                      type="file"
                      value={value?.fileName}
                      onChange={(event) => onChange(event.target.files![0])}
                    />
                  </FormControl>
                  <FormDescription>Selecione o arquivo do meme</FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
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

            <KeywordSelector {...{ form }} />

            <div className="grid grid-cols-2 gap-2">
              <DialogClose asChild>
                <Button variant="secondary" type="button">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit">Enviar</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
