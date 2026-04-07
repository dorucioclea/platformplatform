import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { type ReactNode, useCallback, useContext, useRef } from "react";

import { cn } from "../utils";
import { Field, FieldDescription, FieldError, FieldLabel } from "./Field";
import { FormValidationContext } from "./Form";
import { LabelWithTooltip } from "./LabelWithTooltip";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

export interface MultiSelectItem {
  id: string;
  label: string;
}

export interface MultiSelectProps {
  name?: string;
  label?: string;
  description?: string;
  errorMessage?: string;
  tooltip?: string;
  placeholder?: string;
  emptyMessage?: ReactNode;
  items: MultiSelectItem[];
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
}

export function MultiSelect({
  name,
  label,
  description,
  errorMessage,
  tooltip,
  placeholder,
  emptyMessage,
  items,
  value,
  onChange,
  className,
  isDisabled,
  isReadOnly
}: MultiSelectProps) {
  const formErrors = useContext(FormValidationContext);
  const fieldValidationErrors = name && formErrors && name in formErrors ? formErrors[name] : undefined;
  const fieldErrorMessages = fieldValidationErrors
    ? Array.isArray(fieldValidationErrors)
      ? fieldValidationErrors
      : [fieldValidationErrors]
    : [];
  const errors = errorMessage
    ? [{ message: errorMessage }]
    : fieldErrorMessages.length > 0
      ? fieldErrorMessages.map((error) => ({ message: error }))
      : undefined;
  const isInvalid = errors && errors.length > 0;
  const listRef = useRef<HTMLDivElement>(null);
  const displayLabel = value.length > 0 ? `${value.length} selected` : placeholder;

  const handleToggle = useCallback(
    (itemId: string) => {
      if (isReadOnly) return;
      if (value.includes(itemId)) {
        onChange(value.filter((v) => v !== itemId));
      } else {
        onChange([...value, itemId]);
      }
    },
    [value, onChange, isReadOnly]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, itemId: string) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleToggle(itemId);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = (e.currentTarget as HTMLElement).nextElementSibling as HTMLElement | null;
        next?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const previous = (e.currentTarget as HTMLElement).previousElementSibling as HTMLElement | null;
        previous?.focus();
      }
    },
    [handleToggle]
  );

  return (
    <Field className={cn("flex flex-col", className)}>
      {label && (
        <FieldLabel>{tooltip ? <LabelWithTooltip tooltip={tooltip}>{label}</LabelWithTooltip> : label}</FieldLabel>
      )}
      {items.length === 0 ? (
        emptyMessage && <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <Popover open={isReadOnly ? false : undefined}>
          <PopoverTrigger
            render={
              <button
                type="button"
                aria-label={label ?? placeholder}
                aria-invalid={isInvalid || undefined}
                disabled={isDisabled}
                className="flex h-[var(--control-height)] w-full cursor-pointer items-center justify-between gap-1.5 rounded-md border border-input bg-white px-2.5 text-sm whitespace-nowrap shadow-xs outline-ring transition-[color,box-shadow] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:bg-accent disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:outline aria-invalid:outline-2 aria-invalid:outline-offset-2 aria-invalid:outline-destructive dark:bg-input/30 dark:active:bg-input/60"
              />
            }
          >
            <span className={cn("truncate", value.length === 0 && "text-muted-foreground")}>{displayLabel}</span>
            <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
          </PopoverTrigger>
          <PopoverContent className="w-(--anchor-width) p-1" align="start">
            <div ref={listRef} role="listbox" aria-multiselectable="true" className="flex flex-col">
              {items.map((item) => {
                const checked = value.includes(item.id);
                return (
                  <div
                    key={item.id}
                    role="option"
                    aria-selected={checked}
                    tabIndex={0}
                    onClick={() => handleToggle(item.id)}
                    onKeyDown={(e) => handleKeyDown(e, item.id)}
                    className={cn(
                      "relative flex cursor-pointer items-center gap-2 rounded-sm py-3 pr-8 pl-2 text-sm outline-hidden select-none hover:bg-accent focus:bg-accent active:bg-accent",
                      checked && "bg-accent"
                    )}
                  >
                    <span className="truncate">{item.label}</span>
                    {checked && (
                      <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
                        <CheckIcon className="size-4" />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      )}
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={errors} />
    </Field>
  );
}
