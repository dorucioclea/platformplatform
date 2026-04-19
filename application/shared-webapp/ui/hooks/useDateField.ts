import { translationContext } from "@repo/infrastructure/translations/TranslationContext";
import { format, isValid, type Locale, parse } from "date-fns";
import { da, enUS } from "date-fns/locale";
import { useContext, useEffect, useRef, useState } from "react";

import { FormValidationContext } from "../components/Form";
import { resolveInputFormat } from "../utils/dateInputFormat";
import { useFieldError } from "./useFieldError";
import { useFormatDate, useFormatLongDate, useFormatRelativeDate } from "./useSmartDate";

export type DateFieldDisplayFormat = "input" | "short" | "long" | "relative" | (string & {});

const dateFnsLocaleMap: Record<string, Locale> = {
  "en-US": enUS,
  "da-DK": da
};

interface DateFieldSpecification {
  length: number;
  minimum: number;
  maximum: number;
}

// Field ranges keyed by date-fns format tokens. The mask only allows typing characters that could
// still lead to a value inside the range; e.g. "3" as the first day digit is accepted (could
// become 30 or 31), but "4" is rejected since no completion in dd would be <= 31.
const dateFieldSpecifications: Record<string, DateFieldSpecification> = {
  d: { length: 2, minimum: 1, maximum: 31 },
  M: { length: 2, minimum: 1, maximum: 12 },
  y: { length: 4, minimum: 0, maximum: 9999 }
};

function toIsoDateString(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// True if `digits` is itself in range OR could be completed to an in-range value with more digits.
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

// Applies the mask to text, auto-padding single-digit fields on separator and auto-inserting
// separators after a full field. Designed for sequential-append input (e.g. user typing at the end
// of the value); callers should avoid running the mask on mid-text edits.
export function maskDateInput(text: string, format: string): string {
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
      if (fieldDigits === "" && position > 0 && inputCharacter === output[position - 1]) {
        continue;
      }
      if (/\d/.test(inputCharacter)) {
        const nextDigits = fieldDigits + inputCharacter;
        const nextValue = Number(nextDigits);
        if (!isPartialInRange(nextDigits, specification)) {
          return output;
        }
        output += inputCharacter;
        fieldDigits = nextDigits;
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

// date-fns "dd"/"MM" require exactly two digits; "d"/"M" allow one or two. The lenient form is
// used for parsing on commit so single-digit entries still parse correctly.
function toParseFormat(format: string): string {
  return format.replace(/dd/g, "d").replace(/MM/g, "M");
}

// Per-segment validation that allows partial digits while typing. Rejects letters and out-of-range
// numbers while still allowing intermediate edits like "0/12/2024" produced by deleting a digit.
export function isValidPartialDate(text: string, format: string): boolean {
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

function expandShortYear(text: string, inputFormat: string): string {
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
}

function parseIsoDate(iso: string | undefined): Date | undefined {
  if (!iso) {
    return undefined;
  }
  const date = new Date(`${iso}T00:00:00`);
  return isValid(date) ? date : undefined;
}

export interface UseDateFieldOptions {
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  errorMessage?: string;
  min?: string;
  max?: string;
  locale?: string;
  displayFormat?: DateFieldDisplayFormat;
  // When true the input stays in "editing" display mode even without DOM focus. DatePicker uses
  // this to keep the editable format visible while the calendar popover has focus.
  externalEditingOverride?: boolean;
}

export function useDateField({
  value,
  onChange,
  name,
  errorMessage,
  min,
  max,
  locale,
  displayFormat = "input",
  externalEditingOverride = false
}: UseDateFieldOptions) {
  const { currentLocale } = useContext(translationContext);
  const resolvedLocale = locale ?? currentLocale ?? "en-US";
  const dateLocale = dateFnsLocaleMap[resolvedLocale] ?? enUS;
  const inputFormat = resolveInputFormat(resolvedLocale);

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

  const selectedDate = parseIsoDate(value);
  const maxDate = parseIsoDate(max);
  const minDate = parseIsoDate(min);

  const formatShortDate = useFormatDate();
  const formatLongDate = useFormatLongDate();
  const formatRelativeDate = useFormatRelativeDate();

  const safeFormat = (date: Date | undefined, pattern: string) =>
    date && isValid(date) ? format(date, pattern, { locale: dateLocale }) : "";
  const formatForInput = (date: Date | undefined) => safeFormat(date, inputFormat);
  const formatForDisplay = (date: Date | undefined): string => {
    if (!date || !isValid(date)) {
      return "";
    }
    const isoLocal = `${toIsoDateString(date)}T00:00:00`;
    if (displayFormat === "relative") {
      return formatRelativeDate(isoLocal);
    }
    if (displayFormat === "short") {
      return formatShortDate(isoLocal);
    }
    if (displayFormat === "long") {
      return formatLongDate(isoLocal);
    }
    const pattern = displayFormat === "input" ? inputFormat : displayFormat;
    return safeFormat(date, pattern);
  };

  const [editingText, setEditingText] = useState<string>(() => formatForInput(selectedDate));
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // Flag set on blur and consumed on next focus to place the caret at the end of the value.
  const placeCursorAtEndOnNextFocusRef = useRef(false);
  // mousedown fires before focus, so a click sets this flag and the focus handler skips select-all
  // (browser places the caret at the click position instead).
  const focusedByClickRef = useRef(false);

  useEffect(() => {
    setEditingText(formatForInput(selectedDate));
    // formatForInput closes over inputFormat and dateLocale; both are derived from resolvedLocale.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, resolvedLocale]);

  const hasValue = !!value;
  const isEditing = isFocused || externalEditingOverride;
  const displayText = formatForDisplay(selectedDate);
  const inputValue = isEditing ? editingText : displayText;

  const previewDate = (() => {
    const text = editingText.trim();
    if (!text) {
      return undefined;
    }
    const parsed = parse(expandShortYear(text, inputFormat), toParseFormat(inputFormat), new Date(), {
      locale: dateLocale
    });
    return isValid(parsed) ? parsed : undefined;
  })();

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
    // Expand short years up front so parsing always sees a 4-digit year. date-fns would otherwise
    // consume "26" as year 26 and the ISO round-trip would break.
    const normalizedText = expandShortYear(text, inputFormat);
    const parsed = parse(normalizedText, parseFormat, reference, { locale: dateLocale });
    const isOutOfRange = !isValid(parsed) || (maxDate && parsed > maxDate) || (minDate && parsed < minDate);
    if (isOutOfRange) {
      // Date doesn't parse (e.g. 31/02/2026). Clear instead of reverting so the user sees the
      // entry was rejected without stale text being left behind.
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
      setEditingText(formatForInput(parsed));
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const nextValue = input.value;
    if (nextValue !== "" && !isValidPartialDate(nextValue, inputFormat)) {
      // Reject: restore the caret to where it was before the insert so React's re-render doesn't
      // jump the cursor to the end.
      const insertedLength = Math.max(0, nextValue.length - editingText.length);
      const restorePosition = Math.max(0, (input.selectionStart ?? 0) - insertedLength);
      requestAnimationFrame(() => {
        input.setSelectionRange(restorePosition, restorePosition);
      });
      return;
    }
    markChanged();
    const isAppendAtEnd = nextValue.length > editingText.length && nextValue.startsWith(editingText);
    setEditingText(isAppendAtEnd ? maskDateInput(nextValue, inputFormat) : nextValue);
  };

  const handleInputMouseDown = () => {
    focusedByClickRef.current = true;
  };

  const handleInputFocus = () => {
    setIsFocused(true);
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

  const handleInputBlur = () => {
    setIsFocused(false);
    clearOnBlur();
    commitInputText();
  };

  const handleInputKeyDownDefault = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      // Commit the typed value without submitting the enclosing form; React state updates would
      // otherwise race the form's submit handler reading the hidden input.
      event.preventDefault();
      commitInputText();
    }
  };

  const handleClear = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    clearNow();
    onChange?.("");
    inputRef.current?.focus();
  };

  const commitDate = (date: Date) => {
    clearNow();
    onChange?.(toIsoDateString(date));
    placeCursorAtEndOnNextFocusRef.current = true;
  };

  return {
    inputRef,
    inputFormat,
    dateLocale,
    resolvedLocale,
    editingText,
    setEditingText,
    isFocused,
    isEditing,
    hasValue,
    inputValue,
    selectedDate,
    previewDate,
    maxDate,
    minDate,
    errors,
    isInvalid,
    handleInputChange,
    handleInputMouseDown,
    handleInputFocus,
    handleInputBlur,
    handleInputKeyDown: handleInputKeyDownDefault,
    handleClear,
    commitInputText,
    commitDate,
    placeCursorAtEndOnNextFocusRef,
    focusedByClickRef,
    markChanged
  };
}

export { toIsoDateString };
