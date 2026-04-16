import { t } from "@lingui/core/macro";
import { format, type Locale } from "date-fns";
import { da, enUS } from "date-fns/locale";
import { CalendarIcon, XIcon } from "lucide-react";
import { type ReactNode, useContext, useState } from "react";

import { useFieldError } from "../hooks/useFieldError";
import { cn } from "../utils";
import { Button } from "./Button";
import { Calendar } from "./Calendar";
import { Field, FieldDescription, FieldError } from "./Field";
import { FormValidationContext } from "./Form";
import { Label } from "./Label";
import { LabelWithTooltip } from "./LabelWithTooltip";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

const dateFnsLocaleMap: Record<string, Locale> = {
  "en-US": enUS,
  "da-DK": da
};

export interface DatePickerProps {
  id?: string;
  name?: string;
  label?: string;
  description?: string;
  errorMessage?: string;
  tooltip?: React.ReactNode;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  startIcon?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  max?: string;
  min?: string;
  showDropdowns?: boolean;
  locale?: string;
}

export function DatePicker({
  id,
  name,
  label,
  description,
  errorMessage,
  tooltip,
  className,
  value,
  onChange,
  placeholder,
  startIcon = <CalendarIcon className="shrink-0" />,
  disabled,
  readOnly,
  max,
  min,
  showDropdowns,
  locale = "en-US"
}: Readonly<DatePickerProps>) {
  const dateLocale = dateFnsLocaleMap[locale] ?? enUS;
  const [open, setOpen] = useState(false);

  const formErrors = useContext(FormValidationContext);
  const fieldValidationErrors = name && formErrors && name in formErrors ? formErrors[name] : undefined;
  const fieldErrorMessages = fieldValidationErrors
    ? Array.isArray(fieldValidationErrors)
      ? fieldValidationErrors
      : [fieldValidationErrors]
    : [];
  const { displayError, clearNow } = useFieldError(errorMessage);
  const errors = displayError
    ? [{ message: displayError }]
    : fieldErrorMessages.length > 0
      ? fieldErrorMessages.map((error) => ({ message: error }))
      : undefined;
  const isInvalid = errors && errors.length > 0;

  const triggerId = id ?? name;

  const selectedDate = value ? new Date(`${value}T00:00:00`) : undefined;
  const maxDate = max ? new Date(`${max}T00:00:00`) : undefined;
  const minDate = min ? new Date(`${min}T00:00:00`) : undefined;

  const hasValue = !!value;

  const handleClear = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onChange?.("");
  };

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      clearNow();
      onChange?.(`${year}-${month}-${day}`);
      setOpen(false);
    }
  };

  return (
    <Field className={cn("flex flex-col", className)}>
      {label && (
        <Label
          htmlFor={disabled ? undefined : triggerId}
          data-slot="field-label"
          className="cursor-default leading-snug"
        >
          {tooltip ? <LabelWithTooltip tooltip={tooltip}>{label}</LabelWithTooltip> : label}
        </Label>
      )}
      {name && <input type="hidden" name={name} value={value ?? ""} />}
      <div className="relative">
        <Popover open={readOnly ? false : open} onOpenChange={readOnly ? () => {} : setOpen}>
          <PopoverTrigger
            render={
              <Button
                id={id ?? name}
                variant="outline"
                aria-invalid={isInvalid || undefined}
                className={cn(
                  "w-full justify-start border border-input px-2.5 font-normal hover:bg-white hover:text-foreground active:bg-white aria-invalid:outline aria-invalid:outline-2 aria-invalid:outline-offset-2 aria-invalid:outline-destructive aria-invalid:focus-visible:shadow-[0_0_0_2px_color-mix(in_oklch,var(--destructive)_40%,transparent)] dark:hover:bg-input/30 dark:active:bg-input/30",
                  !value && "text-muted-foreground hover:text-muted-foreground",
                  hasValue && !readOnly && !disabled && "pr-9",
                  readOnly && "focus:outline focus:outline-2 focus:outline-offset-2"
                )}
                disabled={disabled}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === "ArrowDown" && !open) {
                    e.preventDefault();
                    setOpen(true);
                  }
                }}
              >
                {startIcon}
                <span className="truncate">
                  {selectedDate ? format(selectedDate, "PPP", { locale: dateLocale }) : placeholder}
                </span>
              </Button>
            }
          />
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="start"
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === "Tab") {
                e.preventDefault();
                setOpen(false);
                document.getElementById(triggerId ?? "")?.focus();
              }
            }}
          >
            <Calendar
              autoFocus
              mode="single"
              selected={selectedDate}
              onSelect={handleSelect}
              defaultMonth={selectedDate}
              numberOfMonths={1}
              {...(showDropdowns && {
                captionLayout: "dropdown" as const,
                startMonth: minDate ?? new Date(1900, 0),
                endMonth: maxDate ?? new Date()
              })}
              disabled={(date) => {
                if (maxDate && date > maxDate) {
                  return true;
                }
                if (minDate && date < minDate) {
                  return true;
                }
                return false;
              }}
            />
          </PopoverContent>
        </Popover>
        {hasValue && !readOnly && !disabled && (
          <Button
            variant="ghost"
            size="icon-xs"
            className="absolute top-1/2 right-1 -translate-y-1/2"
            onClick={handleClear}
            aria-label={t`Clear date`}
          >
            <XIcon className="size-5" />
          </Button>
        )}
      </div>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={errors} />
    </Field>
  );
}
