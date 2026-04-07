import { useLingui } from "@lingui/react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useContext, useEffect, useMemo, useRef, useState } from "react";

import { cn } from "../utils";
import { Field, FieldDescription, FieldError, FieldLabel } from "./Field";
import { FormValidationContext } from "./Form";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./InputGroup";
import { LabelWithTooltip } from "./LabelWithTooltip";

export interface NumberFieldProps extends Omit<React.ComponentProps<"input">, "className" | "onChange" | "type"> {
  label?: string;
  description?: string;
  errorMessage?: string;
  tooltip?: string;
  className?: string;
  inputClassName?: string;
  startIcon?: React.ReactNode;
  onChange?: (value: number | null) => void;
  minValue?: number;
  maxValue?: number;
  step?: number;
  decimalPlaces?: number;
  allowEmpty?: boolean;
  isRequired?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
}

export function NumberField({
  label,
  description,
  errorMessage,
  tooltip,
  className,
  inputClassName,
  startIcon,
  name,
  value,
  defaultValue,
  onChange,
  autoFocus,
  minValue,
  maxValue,
  step = 1,
  decimalPlaces,
  allowEmpty,
  isRequired,
  isDisabled,
  isReadOnly,
  ...props
}: Readonly<NumberFieldProps>) {
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

  const { i18n } = useLingui();
  const decimalSeparator = useMemo(
    () =>
      Intl.NumberFormat(i18n.locale)
        .formatToParts(1.1)
        .find((p) => p.type === "decimal")?.value ?? ".",
    [i18n.locale]
  );

  const stepDecimals = String(step).includes(".") ? String(step).split(".")[1].length : 0;
  const displayDecimals = decimalPlaces ?? stepDecimals;
  const roundToStep = (number: number) => parseFloat(number.toFixed(Math.max(stepDecimals, displayDecimals)));

  const formatNumber = (num: number) => {
    const str = displayDecimals > 0 ? num.toFixed(displayDecimals) : String(num);
    return decimalSeparator !== "." ? str.replace(".", decimalSeparator) : str;
  };

  const parseInput = (str: string) => {
    const normalized = str.replace(",", ".").replace(decimalSeparator, ".");
    return parseFloat(normalized);
  };

  const initial = value !== undefined ? value : defaultValue;
  const [internalValue, setInternalValue] = useState<string>(
    initial !== undefined ? formatNumber(Number(initial)) : ""
  );
  const [isFocused, setIsFocused] = useState(false);

  const displayValue = isFocused ? internalValue : value !== undefined ? formatNumber(Number(value)) : internalValue;
  const numericValue = parseInput(displayValue);

  const clamp = (number: number) => {
    let result = number;
    if (minValue !== undefined) result = Math.max(result, minValue);
    if (maxValue !== undefined) result = Math.min(result, maxValue);
    return result;
  };

  const handleIncrement = () => {
    const next = clamp(roundToStep((isNaN(numericValue) ? (minValue ?? 0) : numericValue) + step));
    setInternalValue(formatNumber(next));
    onChange?.(next);
  };

  const handleDecrement = () => {
    const next = clamp(roundToStep((isNaN(numericValue) ? (minValue ?? 0) : numericValue) - step));
    setInternalValue(formatNumber(next));
    onChange?.(next);
  };

  // Refs for button long-press repeat (avoids stale closures in timers)
  const incrementRef = useRef(handleIncrement);
  const decrementRef = useRef(handleDecrement);
  incrementRef.current = handleIncrement;
  decrementRef.current = handleDecrement;
  const repeatTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const startRepeat = (actionRef: { current: () => void }) => {
    let delay = 300;
    const repeat = () => {
      actionRef.current();
      delay = Math.max(40, delay * 0.8);
      repeatTimerRef.current = setTimeout(repeat, delay);
    };
    repeatTimerRef.current = setTimeout(repeat, 400);
  };

  const stopRepeat = () => {
    clearTimeout(repeatTimerRef.current);
  };

  useEffect(() => () => clearTimeout(repeatTimerRef.current), []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
    if (e.target.value === "" && allowEmpty) {
      onChange?.(null);
    } else {
      const parsed = parseInput(e.target.value);
      if (!isNaN(parsed)) onChange?.(parsed);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (value !== undefined) {
      setInternalValue(formatNumber(Number(value)));
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (internalValue === "" || internalValue.trim() === "") {
      if (allowEmpty) {
        setInternalValue("");
        onChange?.(null);
        return;
      }
      const fallback = minValue ?? 0;
      setInternalValue(formatNumber(fallback));
      onChange?.(fallback);
      return;
    }
    const parsed = parseInput(internalValue);
    if (isNaN(parsed)) {
      const fallback = minValue ?? 0;
      setInternalValue(formatNumber(fallback));
      onChange?.(fallback);
    } else {
      const clamped = clamp(parsed);
      setInternalValue(formatNumber(clamped));
      if (clamped !== parsed) onChange?.(clamped);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isReadOnly) return;
    if (e.key === "ArrowUp") {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      handleDecrement();
    }
  };

  const atMin = minValue !== undefined && !isNaN(numericValue) && numericValue <= minValue;
  const atMax = maxValue !== undefined && !isNaN(numericValue) && numericValue >= maxValue;

  return (
    <Field className={cn("flex flex-col", className)}>
      {label && (
        <FieldLabel htmlFor={name}>
          {tooltip ? <LabelWithTooltip tooltip={tooltip}>{label}</LabelWithTooltip> : label}
        </FieldLabel>
      )}
      <InputGroup data-disabled={isDisabled || undefined}>
        {startIcon && <InputGroupAddon>{startIcon}</InputGroupAddon>}
        <InputGroupInput
          id={name}
          name={name}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          required={isRequired}
          disabled={isDisabled}
          readOnly={isReadOnly}
          aria-invalid={isInvalid || undefined}
          className={cn("pr-10 text-right", inputClassName)}
          {...props}
        />
        <div className="absolute top-0 right-0 flex h-full flex-col border-l border-input">
          <button
            type="button"
            tabIndex={-1}
            onPointerDown={(e) => {
              e.preventDefault();
              handleIncrement();
              startRepeat(incrementRef);
            }}
            onPointerUp={stopRepeat}
            onPointerLeave={stopRepeat}
            disabled={isDisabled || isReadOnly || atMax}
            aria-label="Increase"
            className="flex w-7 flex-1 items-center justify-center rounded-tr-[calc(var(--radius)-1px)] border-b border-input text-muted-foreground hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
          >
            <ChevronUpIcon className="size-3" />
          </button>
          <button
            type="button"
            tabIndex={-1}
            onPointerDown={(e) => {
              e.preventDefault();
              handleDecrement();
              startRepeat(decrementRef);
            }}
            onPointerUp={stopRepeat}
            onPointerLeave={stopRepeat}
            disabled={isDisabled || isReadOnly || atMin}
            aria-label="Decrease"
            className="flex w-7 flex-1 items-center justify-center rounded-br-[calc(var(--radius)-1px)] text-muted-foreground hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
          >
            <ChevronDownIcon className="size-3" />
          </button>
        </div>
      </InputGroup>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={errors} />
    </Field>
  );
}
