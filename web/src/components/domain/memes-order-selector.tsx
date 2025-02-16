import { MemeOrderingConfig } from "@/services/worker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useRef } from "react";

export type OrderingType =
  | "creation_new"
  | "creation_old"
  | "frequency_big"
  | "frequency_small";

interface MemesOrderSelectorProps {
  defaultValue: OrderingType;
  onChange(newValue: OrderingType): void;
}

export function MemesOrderSelector(props: MemesOrderSelectorProps) {
  const selectRef = useRef<HTMLButtonElement>(null);
  const isOnDesktop = useMediaQuery(["(max-width: 639px)"]);

  function onValueChange(newValue: OrderingType) {
    props.onChange(newValue);

    if (!selectRef.current) {
      return;
    }

    let colorToChange = "hsl(var(--input))";

    if (newValue !== "creation_new") {
      colorToChange = "var(--foreground)";
    }

    selectRef.current.style.borderColor = colorToChange;
  }

  return (
    <Select defaultValue={props.defaultValue} onValueChange={onValueChange}>
      <SelectTrigger className="w-auto" ref={selectRef}>
        <MixerHorizontalIcon className="mr-1" />

        {!!isOnDesktop && <SelectValue />}
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="creation_new">Criação (Mais recente)</SelectItem>
        <SelectItem value="creation_old">Criação (Mais antigo)</SelectItem>
        <SelectItem value="frequency_big">Frequência (Maior)</SelectItem>
        <SelectItem value="frequency_small">Frequência (Menor)</SelectItem>
      </SelectContent>
    </Select>
  );
}

export const orderingConfigs = {
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
