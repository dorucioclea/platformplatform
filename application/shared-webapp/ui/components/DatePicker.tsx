import { t } from "@lingui/core/macro";
import { translationContext } from "@repo/infrastructure/translations/TranslationContext";
import { format, isValid, type Locale, parse } from "date-fns";
import { da, enUS } from "date-fns/locale";
import { CalendarIcon, XIcon } from "lucide-react";
import { type ReactNode, useContext, useEffect, useRef, useState } from "react";

import { useFieldError } from "../hooks/useFieldError";
import { cn } from "../utils";
import { Button } from "./Button";
import { Calendar } from "./Calendar";
import { Field, FieldDescription, FieldError } from "./Field";
import { FormValidationContext } from "./Form";
import { Input } from "./Input";
import { Label } from "./Label";
import { LabelWithTooltip } from "./LabelWithTooltip";
import { Popover, PopoverContent } from "./Popover";

const dateFnsLocaleMap: Record<string, Locale> = {
  "en-US": enUS,
  "da-DK": da
};

// Per-locale input format. Default is dd/MM/yyyy (day first, slash separator); Danish keeps the
// dd-MM-yyyy convention with dashes that's standard locally.
const inputFormatMap: Record<string, string> = {
  "en-US": "dd/MM/yyyy",
  "da-DK": "dd-MM-yyyy"
};
const defaultInputFormat = "dd/MM/yyyy";

function toIsoDateString(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Field ranges keyed by the date-fns format token: dd 01-31, MM 01-12, yyyy 0000-9999. The mask
// only allows typing characters that could still lead to a value inside the range; e.g. "3" as the
// first day digit is accepted (could become 30 or 31), but "4" is rejected since no completion in
// dd would be <= 31.
const dateFieldSpecifications: Record<string, { length: number; minimum: number; maximum: number }> = {
  d: { length: 2, minimum: 1, maximum: 31 },
  M: { length: 2, minimum: 1, maximum: 12 },
  y: { length: 4, minimum: 0, maximum: 9999 }
};

interface DateFieldSpecification {
  length: number;
  minimum: number;
  maximum: number;
}

function hasAnyValidNextDigit(digits: string, specification: DateFieldSpecification): boolean {
  for (let nextDigit = 0; nextDigit < 10; nextDigit++) {
    const candidate = digits + nextDigit;
    const value = Number(candidate);
    const remainingPlaces = 10 ** (specification.length - candidate.length);
    const rangeLow = value * remainingPlaces;
    const rangeHigh = rangeLow + remainingPlaces - 1;
    const valueInRange = value >= specification.minimum && value <= specification.maximum;
    const completionInRange = rangeHigh >= specification.minimum && rangeLow <= specification.maximum;
    if (valueInRange || completionInRange) {
      return true;
    }
  }
  return false;
}

function maskDateInput(text: string, format: string): string {
  let output = "";
  let currentField = "";
  let fieldDigits = "";

  const finalizeField = (separatorPosition: number) => {
    if (separatorPosition < format.length && !dateFieldSpecifications[format[separatorPosition]]) {
      output += format[separatorPosition];
      currentField = "";
      fieldDigits = "";
    }
  };

  for (const inputCharacter of text) {
    const position = output.length;
    if (position >= format.length) {
      return output;
    }
    const formatCharacter = format[position];
    const specification = dateFieldSpecifications[formatCharacter];
    if (specification) {
      if (formatCharacter !== currentField) {
        currentField = formatCharacter;
        fieldDigits = "";
      }
      // Skip a separator the user re-types right after we auto-inserted it.
      if (fieldDigits === "" && position > 0 && inputCharacter === output[position - 1]) {
        continue;
      }
      if (/\d/.test(inputCharacter)) {
        const nextDigits = fieldDigits + inputCharacter;
        const nextValue = Number(nextDigits);
        const remainingPlaces = 10 ** (specification.length - nextDigits.length);
        const rangeLow = nextValue * remainingPlaces;
        const rangeHigh = rangeLow + remainingPlaces - 1;
        // Accept the digit if the running partial is already in range (user could stop here) OR
        // if some completion with more digits would still be in range. This is what lets a user
        // type "9" as a day -- 9 itself is valid, even though 90-99 wouldn't be.
        const currentInRange = nextValue >= specification.minimum && nextValue <= specification.maximum;
        const completionInRange = rangeHigh >= specification.minimum && rangeLow <= specification.maximum;
        if (!currentInRange && !completionInRange) {
          return output;
        }
        output += inputCharacter;
        fieldDigits = nextDigits;
        // Auto-finalize the field: full length always counts; otherwise we finalize when no further
        // digit could keep the partial valid (e.g. typing "3" in MM -- nothing 30-39 is in range,
        // so pad to "03" and insert the trailing separator).
        const isFull = nextDigits.length === specification.length;
        const isImplicitlyDone = !isFull && currentInRange && !hasAnyValidNextDigit(nextDigits, specification);
        if (isFull || isImplicitlyDone) {
          if (nextDigits.length < specification.length) {
            const padded = nextDigits.padStart(specification.length, "0");
            output = output.slice(0, -nextDigits.length) + padded;
            fieldDigits = padded;
          }
          finalizeField(output.length);
        }
        continue;
      }
      // Non-digit inside a field: auto-pad the partial with leading zeros if the user typed the
      // trailing separator, e.g. "9-" in a "dd-MM-yyyy" field becomes "09-".
      const fieldEndPosition = position + (specification.length - fieldDigits.length);
      if (
        fieldEndPosition < format.length &&
        format[fieldEndPosition] === inputCharacter &&
        fieldDigits.length > 0 &&
        fieldDigits.length < specification.length
      ) {
        const partialValue = Number(fieldDigits);
        if (partialValue >= specification.minimum && partialValue <= specification.maximum) {
          const padded = fieldDigits.padStart(specification.length, "0");
          output = output.slice(0, -fieldDigits.length) + padded + inputCharacter;
          currentField = "";
          fieldDigits = "";
          continue;
        }
      }
      return output;
    }
    currentField = "";
    fieldDigits = "";
    if (inputCharacter !== formatCharacter) {
      return output;
    }
    output += inputCharacter;
  }
  return output;
}

// date-fns treats "dd"/"MM" as exactly-two-digit parse tokens but "d"/"M" as one-or-two. Swapping
// them gives a lenient parse format that still accepts the padded output of the mask, but also
// lets users get away with single-digit entries that never reached a trailing separator.
function toParseFormat(format: string): string {
  return format.replace(/dd/g, "d").replace(/MM/g, "M");
}

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
  startIcon = <CalendarIcon className="size-4 shrink-0" />,
  disabled,
  readOnly,
  max,
  min,
  showDropdowns,
  locale
}: Readonly<DatePickerProps>) {
  const { currentLocale } = useContext(translationContext);
  const resolvedLocale = locale ?? currentLocale ?? "en-US";
  const dateLocale = dateFnsLocaleMap[resolvedLocale] ?? enUS;
  const inputFormat = inputFormatMap[resolvedLocale] ?? defaultInputFormat;
  const [open, setOpen] = useState(false);

  const formErrors = useContext(FormValidationContext);
  const fieldValidationErrors = name && formErrors && name in formErrors ? formErrors[name] : undefined;
  const fieldErrorMessages = fieldValidationErrors
    ? Array.isArray(fieldValidationErrors)
      ? fieldValidationErrors
      : [fieldValidationErrors]
    : [];
  const { displayError, markChanged, clearOnBlur, clearNow } = useFieldError(errorMessage);
  const errors = displayError
    ? [{ message: displayError }]
    : fieldErrorMessages.length > 0
      ? fieldErrorMessages.map((error) => ({ message: error }))
      : undefined;
  const isInvalid = errors && errors.length > 0;

  const triggerId = id ?? name;

  const parseIsoDate = (iso: string | undefined): Date | undefined => {
    if (!iso) {
      return undefined;
    }
    const date = new Date(`${iso}T00:00:00`);
    return isValid(date) ? date : undefined;
  };
  const selectedDate = parseIsoDate(value);
  const maxDate = parseIsoDate(max);
  const minDate = parseIsoDate(min);

  // Guard both format helpers against invalid dates so a momentary bad value can't crash the render
  // (e.g. a partially typed date that parsed to something isValid() flags later).
  const safeFormat = (date: Date | undefined, pattern: string) =>
    date && isValid(date) ? format(date, pattern, { locale: dateLocale }) : "";
  const formatForInput = (date: Date | undefined) => safeFormat(date, inputFormat);
  // Long natural-language format shown when the field isn't being edited (e.g. "19. april 2026").
  const formatForDisplay = (date: Date | undefined) => safeFormat(date, "PPP");

  const displayText = formatForDisplay(selectedDate);
  const [editingText, setEditingText] = useState<string>(() => formatForInput(selectedDate));
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Re-sync the editable text whenever the committed value or format changes (calendar pick,
  // controlled update, locale switch). The display text is derived inline so no effect is needed
  // for it.
  useEffect(() => {
    setEditingText(formatForInput(selectedDate));
    // formatForInput closes over inputFormat and dateLocale; those are derived from resolvedLocale.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, resolvedLocale]);

  const hasValue = !!value;
  const showTrailingControls = !readOnly && !disabled;
  // The input is "editing" both while the user is typing and while the calendar popover is open --
  // the popover may steal DOM focus, but visually the field stays in edit mode so the user sees the
  // editable format, not the long display format.
  const isEditing = isFocused || open;
  const inputValue = isEditing ? editingText : displayText;

  const handleClear = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    clearNow();
    onChange?.("");
    inputRef.current?.focus();
  };

  // After picking a date in the calendar we re-focus the input but want the cursor placed at the
  // end (not the default "select all"), so the user can continue editing without losing the value.
  const placeCursorAtEndOnNextFocusRef = useRef(false);

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      clearNow();
      onChange?.(toIsoDateString(date));
      setOpen(false);
      placeCursorAtEndOnNextFocusRef.current = true;
      inputRef.current?.focus();
    }
  };

  // Two-digit year windowing: 00-29 reads as 2000-2029, 30-99 as 1930-1999. Matches the user's
  // expectation that "26" means 2026 and "71" means 1971, and mirrors the default Excel/SimpleDateFormat
  // convention.
  const expandShortYear = (text: string): string => {
    const separator = inputFormat.includes("/") ? "/" : "-";
    const textParts = text.split(separator);
    const formatParts = inputFormat.split(separator);
    if (textParts.length !== formatParts.length) {
      return text;
    }
    const adjustedParts = textParts.map((part, index) => {
      if (formatParts[index].toLowerCase() === "yyyy" && /^\d{1,2}$/.test(part)) {
        const yearNumber = Number(part);
        return String(yearNumber < 30 ? 2000 + yearNumber : 1900 + yearNumber);
      }
      return part;
    });
    return adjustedParts.join(separator);
  };

  const commitInputText = () => {
    const text = editingText.trim();
    if (text === "") {
      if (hasValue) {
        clearNow();
        onChange?.("");
      }
      return;
    }
    const parseFormat = toParseFormat(inputFormat);
    const reference = new Date();
    // Expand short years up front so parsing always sees a 4-digit year. date-fns will otherwise
    // happily consume "26" as year 26 and we'd round-trip it into an invalid ISO string.
    const normalizedText = expandShortYear(text);
    const parsed = parse(normalizedText, parseFormat, reference, { locale: dateLocale });
    const isOutOfRange = !isValid(parsed) || (maxDate && parsed > maxDate) || (minDate && parsed < minDate);
    if (isOutOfRange) {
      setEditingText(formatForInput(selectedDate));
      return;
    }
    const iso = toIsoDateString(parsed);
    if (iso !== value) {
      clearNow();
      onChange?.(iso);
    } else {
      // Input was the same date but typed loosely (e.g. different separators); normalize the display.
      setEditingText(formatForInput(parsed));
    }
  };

  // Track how the popover was opened so the Calendar only steals focus when triggered by the
  // keyboard. Mouse opens (input click) keep focus on the input so the user can keep typing while
  // the calendar is visible.
  const openedByKeyboardRef = useRef(false);
  // Set when BaseUI dismisses the popover via outside-click (which fires just before our input
  // click handler). Prevents the click from immediately re-opening the popover that was just
  // dismissed by clicking the input.
  const suppressNextInputToggleRef = useRef(false);

  // mousedown fires before focus, so a click sets this flag and the focus handler skips select-all
  // (the browser will place the caret where the user clicked instead).
  const focusedByClickRef = useRef(false);

  const handleInputMouseDown = () => {
    focusedByClickRef.current = true;
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    // Defer one frame so React has swapped the input's value from display format to editable
    // format first. After picking a date in the calendar we just place the cursor at the end so the
    // user keeps the value visible. On click we leave the cursor where the user clicked. On tab we
    // select-all so the user can overtype immediately.
    if (placeCursorAtEndOnNextFocusRef.current) {
      placeCursorAtEndOnNextFocusRef.current = false;
      requestAnimationFrame(() => {
        const input = inputRef.current;
        if (input) {
          const cursorPosition = input.value.length;
          input.setSelectionRange(cursorPosition, cursorPosition);
        }
      });
      return;
    }
    if (focusedByClickRef.current) {
      focusedByClickRef.current = false;
      return;
    }
    requestAnimationFrame(() => inputRef.current?.select());
  };

  const handleInputClick = () => {
    if (readOnly || disabled) {
      return;
    }
    if (suppressNextInputToggleRef.current) {
      // BaseUI just closed the popover because of this same click; don't re-open it.
      suppressNextInputToggleRef.current = false;
      return;
    }
    openedByKeyboardRef.current = false;
    setOpen((current) => !current);
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    clearOnBlur();
    commitInputText();
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" && !open) {
      event.preventDefault();
      openedByKeyboardRef.current = true;
      setOpen(true);
      return;
    }
    if (event.key === "Enter") {
      // Commit the typed value without submitting the enclosing form -- users can Tab or click the
      // form's submit button afterwards. Submitting here would race React state updates against the
      // hidden-input value the form reads.
      event.preventDefault();
      commitInputText();
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
        <Popover
          open={readOnly ? false : open}
          onOpenChange={
            readOnly
              ? () => {}
              : (next) => {
                  if (!next) {
                    // BaseUI's outside-click dismiss fires before our input click handler -- mark
                    // the close so the click handler can ignore the immediate re-open attempt.
                    suppressNextInputToggleRef.current = true;
                  }
                  setOpen(next);
                }
          }
        >
          <Input
            ref={inputRef}
            id={triggerId}
            aria-invalid={isInvalid || undefined}
            placeholder={isEditing ? inputFormat.toLowerCase() : placeholder}
            value={inputValue}
            onChange={(event) => {
              markChanged();
              setEditingText(maskDateInput(event.target.value, inputFormat));
            }}
            onMouseDown={handleInputMouseDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            onClick={handleInputClick}
            disabled={disabled}
            readOnly={readOnly}
            autoComplete="off"
            inputMode={isEditing ? "numeric" : undefined}
            className={cn(startIcon != null && "pl-9", showTrailingControls && hasValue && "pr-9")}
          />
          {startIcon != null && (
            <div
              className={cn(
                "pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2",
                hasValue ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {startIcon}
            </div>
          )}
          {showTrailingControls && hasValue && (
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
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="start"
            anchor={() => inputRef.current}
            onKeyDown={(event: React.KeyboardEvent) => {
              if (event.key === "Tab") {
                event.preventDefault();
                setOpen(false);
                inputRef.current?.focus();
              }
            }}
          >
            <Calendar
              autoFocus={openedByKeyboardRef.current}
              mode="single"
              selected={selectedDate}
              onSelect={handleCalendarSelect}
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
      </div>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={errors} />
    </Field>
  );
}
