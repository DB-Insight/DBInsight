import { cn } from "@/utils/tailwind";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ScrollArea } from "../ui/scroll-area";
import { useReactive } from "ahooks";

interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value?: string;
  placeholder: string;
  className?: string;
  onChange: (value: string) => void;
}

export default ({
  options,
  value = "",
  placeholder,
  className,
  onChange,
}: SearchableSelectProps) => {
  const state = useReactive({
    open: false,
  });
  return (
    <Popover modal open={state.open} onOpenChange={(e) => (state.open = e)}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("justify-between", className)}>
          {value
            ? options.find((option) => option.value === value)?.label
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0">
        <Command>
          <CommandInput placeholder={`Search ${placeholder}...`} />
          <CommandEmpty>No {placeholder.toLowerCase()} found.</CommandEmpty>
          <CommandGroup className="h-[200px] overflow-auto">
            {options.map((option) => (
              <CommandItem
                key={option.value}
                onSelect={() => {
                  state.open = false;
                  onChange(option.value);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    option.value === value ? "opacity-100" : "opacity-0",
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
