import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { type ReactNode, useId } from "react";

import { cn } from "../utils";
import { Field, FieldLabel } from "./Field";
import { LabelWithTooltip } from "./LabelWithTooltip";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

export interface MultiSelectItem {
  id: string;
  label: string;
}

export interface MultiSelectProps {
  label?: string;
  tooltip?: string;
  placeholder?: string;
  emptyMessage?: ReactNode;
  items: MultiSelectItem[];
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
}

export function MultiSelect({
  label,
  tooltip,
  placeholder,
  emptyMessage,
  items,
  value,
  onChange,
  className
}: MultiSelectProps) {
  const id = useId();
  const displayLabel = value.length > 0 ? `${value.length} selected` : placeholder;

  const handleToggle = (itemId: string, checked: boolean) => {
    if (checked) {
      onChange([...value, itemId]);
    } else {
      onChange(value.filter((v) => v !== itemId));
    }
  };

  return (
    <Field className={cn("flex flex-col", className)}>
      {label && (
        <FieldLabel>{tooltip ? <LabelWithTooltip tooltip={tooltip}>{label}</LabelWithTooltip> : label}</FieldLabel>
      )}
      {items.length === 0 ? (
        emptyMessage && <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <Popover>
          <PopoverTrigger
            render={
              <button
                type="button"
                aria-label={label ?? placeholder}
                className="flex h-[var(--control-height)] w-full cursor-pointer items-center justify-between gap-1.5 rounded-md border border-input bg-white px-2.5 text-sm whitespace-nowrap shadow-xs outline-ring transition-[color,box-shadow] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:bg-accent disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 dark:active:bg-input/60"
              />
            }
          >
            <span className={cn("truncate", value.length === 0 && "text-muted-foreground")}>{displayLabel}</span>
            <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
          </PopoverTrigger>
          <PopoverContent className="w-(--anchor-width) p-1" align="start">
            <div className="flex flex-col">
              {items.map((item) => {
                const checked = value.includes(item.id);
                return (
                  <label
                    key={item.id}
                    htmlFor={`${id}-${item.id}`}
                    className={cn(
                      "relative flex cursor-pointer items-center gap-2 rounded-sm py-3 pr-8 pl-2 text-sm select-none hover:bg-accent active:bg-accent",
                      checked && "bg-accent"
                    )}
                  >
                    <input
                      type="checkbox"
                      id={`${id}-${item.id}`}
                      className="sr-only"
                      checked={checked}
                      onChange={(e) => handleToggle(item.id, e.target.checked)}
                    />
                    <span className="truncate">{item.label}</span>
                    {checked && (
                      <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
                        <CheckIcon className="size-4" />
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </Field>
  );
}
