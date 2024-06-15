import { MemeOrderingConfig } from "@/services/supabase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

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
  return (
    <Select defaultValue={props.defaultValue} onValueChange={props.onChange}>
      <SelectTrigger className="sm:w-64">
        <SelectValue />
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
