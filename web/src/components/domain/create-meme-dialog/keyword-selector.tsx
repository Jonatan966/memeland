import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SunIcon } from "@radix-ui/react-icons";
import { KeyboardEvent, useState } from "react";

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
  const [isGenerating, setIsGenerating] = useState(false);

  function onAddNewKeyword(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();

    onChange([...keywords, event.currentTarget.value]);

    event.currentTarget.value = "";
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
        <Input
          placeholder="Escreva uma palavra-chave e pressione Enter"
          onKeyDown={onAddNewKeyword}
        />

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

      <FormMessage />
    </FormItem>
  );
}
