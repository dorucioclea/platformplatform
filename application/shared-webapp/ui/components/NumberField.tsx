import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useContext, useState } from "react";

import { cn } from "../utils";
import { Field, FieldDescription, FieldError, FieldLabel } from "./Field";
import { FormValidationContext } from "./Form";
import { InputGroup, InputGroupInput } from "./InputGroup";
import { LabelWithTooltip } from "./LabelWithTooltip";

export interface NumberFieldProps extends Omit<React.ComponentProps<"input">, "className" | "onChange" | "type"> {
  label?: string;
  description?: string;
  errorMessage?: string;
  tooltip?: string;
  className?: string;
  inputClassName?: string;
  onChange?: (value: number) => void;
  minValue?: number;
  maxValue?: number;
  step?: number;
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
  name,
  value,
  defaultValue,
  onChange,
  autoFocus,
  minValue,
  maxValue,
  step = 1,
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
      ? fieldErrorMessages.map((err) => ({ message: err }))
      : undefined;
  const isInvalid = errors && errors.length > 0;

  const initial = value !== undefined ? value : defaultValue;
  const [internalValue, setInternalValue] = useState<string>(initial !== undefined ? String(initial) : "");

  const displayValue = value !== undefined ? String(value) : internalValue;
  const numericValue = parseFloat(displayValue);

  const clamp = (n: number) => {
    let result = n;
    if (minValue !== undefined) result = Math.max(result, minValue);
    if (maxValue !== undefined) result = Math.min(result, maxValue);
    return result;
  };

  const handleIncrement = () => {
    const next = clamp((isNaN(numericValue) ? (minValue ?? 0) : numericValue) + step);
    setInternalValue(String(next));
    onChange?.(next);
  };

  const handleDecrement = () => {
    const next = clamp((isNaN(numericValue) ? (minValue ?? 0) : numericValue) - step);
    setInternalValue(String(next));
    onChange?.(next);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
    const num = parseFloat(e.target.value);
    if (!isNaN(num)) onChange?.(num);
  };

  const handleBlur = () => {
    const num = parseFloat(displayValue);
    if (isNaN(num)) {
      const fallback = minValue ?? 0;
      setInternalValue(String(fallback));
      onChange?.(fallback);
    } else {
      const clamped = clamp(num);
      if (clamped !== num) {
        setInternalValue(String(clamped));
        onChange?.(clamped);
      }
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
        <InputGroupInput
          id={name}
          name={name}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          autoFocus={autoFocus}
          required={isRequired}
          disabled={isDisabled}
          readOnly={isReadOnly}
          aria-invalid={isInvalid || undefined}
          className={cn("pr-8", inputClassName)}
          {...props}
        />
        <div className="absolute top-0 right-0 flex h-full flex-col border-l border-input">
          <button
            type="button"
            onClick={handleIncrement}
            disabled={isDisabled || isReadOnly || atMax}
            aria-label="Increase"
            className="flex w-7 flex-1 items-center justify-center rounded-tr-[calc(var(--radius)-1px)] border-b border-input text-muted-foreground hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
          >
            <ChevronUpIcon className="size-3" />
          </button>
          <button
            type="button"
            onClick={handleDecrement}
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
