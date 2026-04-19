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

interface DateFieldSpecification {
  length: number;
  minimum: number;
  maximum: number;
}

// Field ranges keyed by the date-fns format token: dd 01-31, MM 01-12, yyyy 0000-9999. The mask
// only allows typing characters that could still lead to a value inside the range; e.g. "3" as the
// first day digit is accepted (could become 30 or 31), but "4" is rejected since no completion in
// dd would be <= 31.
const dateFieldSpecifications: Record<string, DateFieldSpecification> = {
  d: { length: 2, minimum: 1, maximum: 31 },
  M: { length: 2, minimum: 1, maximum: 12 },
  y: { length: 4, minimum: 0, maximum: 9999 }
};

// True if `digits` is itself in range OR could be completed to an in-range value with more digits.
// Used to validate partial entries while typing -- "3" in dd is reachable (30 or 31 are valid) but
// "4" is not (40-49 all exceed 31, and 4 itself is also <= 31, so it's actually reachable too).
function isPartialInRange(digits: string, specification: DateFieldSpecification): boolean {
  const value = Number(digits);
  const remainingPlaces = 10 ** (specification.length - digits.length);
  const rangeLow = value * remainingPlaces;
  const rangeHigh = rangeLow + remainingPlaces - 1;
  const valueInRange = value >= specification.minimum && value <= specification.maximum;
  const completionInRange = rangeHigh >= specification.minimum && rangeLow <= specification.maximum;
  return valueInRange || completionInRange;
}

function hasAnyValidNextDigit(digits: string, specification: DateFieldSpecification): boolean {
  for (let nextDigit = 0; nextDigit < 10; nextDigit++) {
    if (isPartialInRange(digits + nextDigit, specification)) {
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
        // Accept the digit if the running partial is already in range OR if some completion with
        // more digits would still be in range -- "9" as a day is valid even though 90-99 isn't.
        if (!isPartialInRange(nextDigits, specification)) {
          return output;
        }
        output += inputCharacter;
        fieldDigits = nextDigits;
        // Auto-finalize the field: full length always counts; otherwise we finalize when no further
        // digit could keep the partial valid (e.g. typing "3" in MM -- nothing 30-39 is in range,
        // so pad to "03" and insert the trailing separator).
        const currentInRange = nextValue >= specification.minimum && nextValue <= specification.maximum;
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

// Per-segment validation that allows partial digits while typing. Each segment must consist only
// of digits (no letters), can't be longer than its format slot, and the partial value (or any
// completion of it) must fit the field's range. Rejects "Thomas" and "44/33/7843" while still
// allowing intermediate states like "0/12/2024" produced by deleting a digit mid-edit.
function isValidPartialDate(text: string, format: string): boolean {
  const separator = format.includes("/") ? "/" : "-";
  const segments = text.split(separator);
  const formatSegments = format.split(separator);
  if (segments.length > formatSegments.length) {
    return false;
  }
  for (let index = 0; index < segments.length; index++) {
    const segment = segments[index];
    const formatSegment = formatSegments[index];
    if (!/^\d*$/.test(segment)) {
      return false;
    }
    if (segment.length > formatSegment.length) {
      return false;
    }
    if (segment.length === 0) {
      continue;
    }
    const specification = dateFieldSpecifications[formatSegment[0]];
    if (!specification || !isPartialInRange(segment, specification)) {
      return false;
    }
  }
  return true;
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
  // Optional per-date predicate -- return true to disable the date in the calendar (e.g. weekends).
  // Combined with min/max so consumers can mix range limits with arbitrary exclusions.
  disabledDate?: (date: Date) => boolean;
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
  locale,
  disabledDate
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

  // The calendar should open on the date the user is currently typing -- not the last committed
  // value. The popover unmounts its content on close, so each open mounts a fresh Calendar that
  // picks up the latest defaultMonth. We don't remount mid-open: doing so would tear down the
  // calendar's internal focus while the user is navigating with arrows.
  const previewDate = (() => {
    const text = editingText.trim();
    if (!text) {
      return undefined;
    }
    const parsed = parse(expandShortYear(text), toParseFormat(inputFormat), new Date(), { locale: dateLocale });
    return isValid(parsed) ? parsed : undefined;
  })();
  const calendarMonth = previewDate ?? selectedDate;

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
      // Date doesn't parse (e.g. 31/02/2026). Clear instead of reverting -- shows the user the
      // entry was rejected without leaving stale text behind.
      setEditingText("");
      if (hasValue) {
        clearNow();
        onChange?.("");
      }
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

  // mousedown fires before focus, so a click sets this flag and the focus handler skips select-all
  // (the browser will place the caret where the user clicked instead).
  const focusedByClickRef = useRef(false);
  // Captured at mousedown so the click handler can tell whether the click landed on an input that
  // was already focused. Subsequent clicks on a focused input should just position the caret -- not
  // toggle the popover -- so the user can edit a date with the keyboard without re-opening the
  // calendar.
  const wasFocusedBeforeClickRef = useRef(false);
  // Captured at mousedown so the click handler knows whether the popover was open when this click
  // started. If it was open, BaseUI's outside-click dismiss will close it -- our click must not
  // re-open it. Reading at mousedown avoids the timer race where a setTimeout(0) flag could fire
  // between mousedown and click.
  const wasOpenAtMouseDownRef = useRef(false);

  const handleInputMouseDown = () => {
    focusedByClickRef.current = true;
    wasFocusedBeforeClickRef.current = inputRef.current === document.activeElement;
    wasOpenAtMouseDownRef.current = open;
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
    if (wasOpenAtMouseDownRef.current) {
      // Popover was open at mousedown -- BaseUI is closing it as part of this same click. Don't
      // re-open.
      return;
    }
    if (wasFocusedBeforeClickRef.current) {
      // Click on an already-focused input -- treat as caret positioning, not as a popover open.
      return;
    }
    openedByKeyboardRef.current = false;
    setOpen(true);
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    clearOnBlur();
    commitInputText();
    // Reset interaction-state refs so the next entry into the control behaves consistently. A label
    // click fires a synthesized click on the input but no mousedown, so without this reset the
    // stale ref values from the previous mousedown would suppress the click.
    wasFocusedBeforeClickRef.current = false;
    wasOpenAtMouseDownRef.current = false;
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
      <div className="group relative">
        <Popover open={readOnly ? false : open} onOpenChange={readOnly ? () => {} : setOpen}>
          <Input
            ref={inputRef}
            id={triggerId}
            aria-invalid={isInvalid || undefined}
            placeholder={isEditing ? inputFormat.toLowerCase() : placeholder}
            value={inputValue}
            onChange={(event) => {
              const input = event.currentTarget;
              const nextValue = input.value;
              // Reject the keystroke entirely if the resulting text isn't a valid partial date
              // (letters, out-of-range numbers, too many segments, etc.). This blocks "Thomas" and
              // "44/33/7843" while still allowing intermediate states like "0/12/2024" produced by
              // deleting a digit mid-edit.
              if (nextValue !== "" && !isValidPartialDate(nextValue, inputFormat)) {
                // Restore the caret to where it was before the rejected insert -- otherwise React
                // re-renders with the old value and the browser jumps the cursor to the end.
                const insertedLength = Math.max(0, nextValue.length - editingText.length);
                const restorePosition = Math.max(0, (input.selectionStart ?? 0) - insertedLength);
                requestAnimationFrame(() => {
                  input.setSelectionRange(restorePosition, restorePosition);
                });
                return;
              }
              markChanged();
              // Only run the mask (auto-pad / auto-insert separator) when the user is appending at
              // the end of the field. For mid-edits we accept the value verbatim -- the mask is
              // sequential-append-aware and would otherwise truncate or jump the caret. Final
              // validation happens on blur.
              const isAppendAtEnd = nextValue.length > editingText.length && nextValue.startsWith(editingText);
              setEditingText(isAppendAtEnd ? maskDateInput(nextValue, inputFormat) : nextValue);
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
            className={cn(
              startIcon != null && "pl-9",
              showTrailingControls && hasValue && (isEditing ? "pr-9" : "group-hover:pr-9")
            )}
          />
          {startIcon != null && (
            <button
              type="button"
              tabIndex={-1}
              disabled={readOnly || disabled}
              aria-label={t`Open calendar`}
              // mousedown preventDefault keeps the input focused when the icon is clicked, so the
              // input doesn't blur (and commit) just to open the calendar.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                if (readOnly || disabled) {
                  return;
                }
                openedByKeyboardRef.current = false;
                setOpen(true);
              }}
              className={cn(
                "absolute top-1/2 left-2.5 -translate-y-1/2 cursor-pointer rounded outline-ring focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                hasValue ? "text-foreground" : "text-muted-foreground",
                (readOnly || disabled) && "pointer-events-none cursor-default"
              )}
            >
              {startIcon}
            </button>
          )}
          {showTrailingControls && hasValue && (
            <Button
              variant="ghost"
              size="icon-xs"
              tabIndex={-1}
              // Hidden when the picker isn't being interacted with so the date has the full input
              // width to render. Stays visible while the input is focused, the popover is open, or
              // the user hovers anywhere on the field.
              className={cn(
                "absolute top-1/2 right-1 -translate-y-1/2 transition-opacity",
                isEditing ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
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
              defaultMonth={calendarMonth}
              numberOfMonths={1}
              startMonth={minDate ?? (showDropdowns ? new Date(1900, 0) : undefined)}
              endMonth={maxDate ?? (showDropdowns ? new Date() : undefined)}
              {...(showDropdowns && { captionLayout: "dropdown" as const })}
              disabled={(date) => {
                if (maxDate && date > maxDate) {
                  return true;
                }
                if (minDate && date < minDate) {
                  return true;
                }
                return disabledDate?.(date) ?? false;
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
