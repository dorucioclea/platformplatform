import { format, type Locale } from "date-fns";
import { da, enUS } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useContext, useState } from "react";

import { cn } from "../utils";
import { Button } from "./Button";
import { Calendar } from "./Calendar";
import { Field, FieldDescription, FieldError } from "./Field";
import { FormValidationContext } from "./Form";
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
  tooltip?: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
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
  isDisabled,
  isReadOnly,
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
  const errors = errorMessage
    ? [{ message: errorMessage }]
    : fieldErrorMessages.length > 0
      ? fieldErrorMessages.map((error) => ({ message: error }))
      : undefined;

  const triggerId = id ?? name;
  const focusTrigger = () => {
    if (!triggerId) return;
    const focusOptions = { preventScroll: true, focusVisible: true };
    document.getElementById(triggerId)?.focus(focusOptions);
  };

  const selectedDate = value ? new Date(`${value}T00:00:00`) : undefined;
  const maxDate = max ? new Date(`${max}T00:00:00`) : undefined;
  const minDate = min ? new Date(`${min}T00:00:00`) : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      onChange?.(`${year}-${month}-${day}`);
      setOpen(false);
    }
  };

  return (
    <Field className={cn("flex flex-col", className)}>
      {label && (
        <span
          data-slot="field-label"
          className="flex items-center gap-2 text-sm leading-snug font-medium select-none"
          onClick={focusTrigger}
        >
          {tooltip ? <LabelWithTooltip tooltip={tooltip}>{label}</LabelWithTooltip> : label}
        </span>
      )}
      {name && <input type="hidden" name={name} value={value ?? ""} />}
      <Popover open={isReadOnly ? false : open} onOpenChange={isReadOnly ? () => {} : setOpen}>
        <PopoverTrigger
          render={
            <Button
              id={id ?? name}
              variant="outline"
              className={cn(
                "w-full justify-start border border-input font-normal hover:bg-white dark:hover:bg-input/30",
                !value && "text-muted-foreground"
              )}
              disabled={isDisabled}
            >
              <CalendarIcon className="shrink-0" />
              <span className="truncate">
                {selectedDate ? format(selectedDate, "PP", { locale: dateLocale }) : placeholder}
              </span>
            </Button>
          }
        />
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
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
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={errors} />
    </Field>
  );
}
