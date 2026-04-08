import type { DateRange } from "react-day-picker";

import { useLingui } from "@lingui/react";
import { format, type Locale } from "date-fns";
import { da, enUS } from "date-fns/locale";
import { CalendarIcon, XIcon } from "lucide-react";
import { useContext, useState } from "react";

import { useFieldError } from "../hooks/useFieldError";
import { cn } from "../utils";
import { Button } from "./Button";
import { Calendar } from "./Calendar";
import { Field, FieldDescription, FieldError } from "./Field";
import { FormValidationContext } from "./Form";
import { LabelWithTooltip } from "./LabelWithTooltip";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

/**
 * Maps app locale codes to date-fns locale objects.
 * Add new locales here when extending language support.
 */
const dateFnsLocaleMap: Record<string, Locale> = {
  "en-US": enUS,
  "da-DK": da
};

export interface DateRangeValue {
  start: Date;
  end: Date;
}

export interface DateRangePickerProps {
  name?: string;
  label?: string;
  description?: string;
  errorMessage?: string;
  tooltip?: React.ReactNode;
  value?: DateRangeValue | null;
  onChange?: (value: DateRangeValue | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  isReadOnly?: boolean;
}

export function DateRangePicker({
  name,
  label,
  description,
  errorMessage,
  tooltip,
  value,
  onChange,
  placeholder = "Select dates",
  className,
  disabled,
  isReadOnly
}: Readonly<DateRangePickerProps>) {
  const { i18n } = useLingui();
  const dateLocale = dateFnsLocaleMap[i18n.locale] ?? enUS;
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
  const focusTrigger = () => {
    if (!name) return;
    const focusOptions = { preventScroll: true, focusVisible: true };
    document.getElementById(name)?.focus(focusOptions);
  };
  const [selectionsCount, setSelectionsCount] = useState(0);
  // Track the first clicked date separately since react-day-picker's onSelect
  // doesn't reliably tell us which date was clicked
  const [firstClickDate, setFirstClickDate] = useState<Date | null>(null);

  const dateRange: DateRange | undefined = value ? { from: value.start, to: value.end } : undefined;

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setSelectionsCount(0);
      setFirstClickDate(null);
    }
  };

  const handleDayClick = (day: Date) => {
    const newCount = selectionsCount + 1;
    setSelectionsCount(newCount);

    if (newCount === 1) {
      // First click: use existing start as pivot (matches react-day-picker behavior)
      const existingStart = value?.start;
      const existingEnd = value?.end;
      setFirstClickDate(day);

      if (existingStart && existingEnd) {
        if (day.getTime() < existingStart.getTime()) {
          // Clicked before existing start: clicked becomes start, keep end
          onChange?.({ start: day, end: existingEnd });
        } else {
          // Clicked on or after existing start: keep start, clicked becomes end
          onChange?.({ start: existingStart, end: day });
        }
      } else {
        // No existing range: clicked becomes both start and end
        onChange?.({ start: day, end: day });
      }
    } else {
      // Second click: combine with the first click to form the range
      const firstDate = firstClickDate ?? day;

      // Earlier date becomes start, later becomes end
      let newStart = firstDate;
      let newEnd = day;
      if (newStart.getTime() > newEnd.getTime()) {
        [newStart, newEnd] = [newEnd, newStart];
      }

      clearNow();
      onChange?.({ start: newStart, end: newEnd });

      // Close if we have a valid range with different dates
      if (newStart.getTime() !== newEnd.getTime()) {
        setTimeout(() => setOpen(false), 100);
      }
    }
  };

  const handleClear = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onChange?.(null);
  };

  const formatDateRange = () => {
    if (!value?.start || !value?.end) {
      return placeholder;
    }
    return `${format(value.start, "PPP", { locale: dateLocale })} - ${format(value.end, "PPP", { locale: dateLocale })}`;
  };

  const hasValue = value !== null && value !== undefined;

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
      <div className="relative">
        <Popover open={isReadOnly ? false : open} onOpenChange={isReadOnly ? () => {} : handleOpenChange}>
          <PopoverTrigger
            render={
              <Button
                id={name}
                variant="outline"
                aria-invalid={isInvalid || undefined}
                // NOTE: This diverges from stock ShadCN to prevent hover background change on the trigger button.
                className={cn(
                  "w-full justify-between border border-input font-normal hover:bg-white aria-invalid:outline aria-invalid:outline-2 aria-invalid:outline-offset-2 aria-invalid:outline-destructive aria-invalid:focus-visible:shadow-[0_0_0_2px_color-mix(in_oklch,var(--destructive)_40%,transparent)] dark:hover:bg-input/30",
                  hasValue && !isReadOnly && !disabled && "pr-9",
                  isReadOnly && "focus:outline focus:outline-2 focus:outline-offset-2"
                )}
                disabled={disabled}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === "ArrowDown" && !open) {
                    e.preventDefault();
                    setOpen(true);
                  }
                }}
              >
                <div className={cn("flex min-w-0 items-center gap-2", !hasValue && "text-muted-foreground")}>
                  <CalendarIcon className="shrink-0" />
                  <span className="truncate">{formatDateRange()}</span>
                </div>
              </Button>
            }
          />
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="start"
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === "Tab") {
                setOpen(false);
              }
            }}
          >
            <Calendar
              mode="range"
              selected={dateRange}
              onDayClick={handleDayClick}
              numberOfMonths={1}
              defaultMonth={value?.start}
            />
          </PopoverContent>
        </Popover>
        {hasValue && !isReadOnly && !disabled && (
          <Button
            variant="ghost"
            size="icon-xs"
            className="absolute top-1/2 right-1 -translate-y-1/2"
            onClick={handleClear}
            aria-label="Clear dates"
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

export function parseDateString(dateString: string): Date {
  return new Date(dateString);
}
