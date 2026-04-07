import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { type ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";

import { cn } from "../utils";
import { Field, FieldDescription, FieldError } from "./Field";
import { FormValidationContext } from "./Form";
import { LabelWithTooltip } from "./LabelWithTooltip";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

export interface MultiSelectItem {
  id: string;
  label: string;
  icon?: ReactNode;
}

export interface MultiSelectProps {
  name?: string;
  label?: string;
  description?: string;
  errorMessage?: string;
  tooltip?: string;
  placeholder?: string;
  emptyMessage?: ReactNode;
  startIcon?: ReactNode;
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
  startIcon,
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
  const [open, setOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const focusTrigger = () => {
    if (!name) return;
    const focusOptions = { preventScroll: true, focusVisible: true };
    document.getElementById(name)?.focus(focusOptions);
  };
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
      if (e.key === "Tab") {
        setOpen(false);
        return;
      }
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
      } else if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        document.getElementById(name ?? "")?.focus();
      }
    },
    [handleToggle, name, setOpen]
  );

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      const firstOption = listRef.current?.querySelector("[role=option]") as HTMLElement | null;
      firstOption?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [open]);

  return (
    <Field className={cn("flex flex-col", className)}>
      {label && (
        <label
          data-slot="field-label"
          className="flex items-center gap-2 text-sm leading-snug font-medium select-none"
          onClick={focusTrigger}
        >
          {tooltip ? <LabelWithTooltip tooltip={tooltip}>{label}</LabelWithTooltip> : label}
        </label>
      )}
      {items.length === 0 ? (
        emptyMessage && <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <Popover open={isReadOnly ? false : open} onOpenChange={isReadOnly ? undefined : handleOpenChange}>
          <PopoverTrigger
            render={
              <button
                id={name}
                type="button"
                aria-label={label ?? placeholder}
                data-invalid={isInvalid || undefined}
                disabled={isDisabled}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === "ArrowDown" && !open) {
                    e.preventDefault();
                    handleOpenChange(true);
                  }
                }}
                className={cn(
                  "flex h-[var(--control-height)] w-full cursor-pointer items-center justify-between gap-1.5 rounded-md border border-input bg-white px-2.5 text-sm whitespace-nowrap shadow-xs outline-ring transition-[color,box-shadow] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:bg-accent disabled:pointer-events-none disabled:opacity-50 data-[invalid]:outline data-[invalid]:outline-2 data-[invalid]:outline-offset-2 data-[invalid]:outline-destructive dark:bg-input/30 dark:active:bg-input/60",
                  isReadOnly && "focus:outline focus:outline-2 focus:outline-offset-2"
                )}
              />
            }
          >
            {startIcon && (
              <span className="shrink-0 text-muted-foreground [&_svg:not([class*='size-'])]:size-4">{startIcon}</span>
            )}
            <span className={cn("flex-1 truncate text-left", value.length === 0 && "text-muted-foreground")}>
              {displayLabel}
            </span>
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
                    tabIndex={-1}
                    onClick={() => handleToggle(item.id)}
                    onKeyDown={(e) => handleKeyDown(e, item.id)}
                    className={cn(
                      "relative flex cursor-pointer items-center gap-2 rounded-sm py-3 pr-8 pl-2 text-sm outline-hidden select-none hover:bg-accent focus:bg-accent active:bg-accent",
                      checked && "bg-accent"
                    )}
                  >
                    {item.icon && <span className="shrink-0 [&_svg:not([class*='size-'])]:size-4">{item.icon}</span>}
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
