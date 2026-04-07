import type { ReactNode } from "react";

import { useContext, useState } from "react";

import { cn } from "../utils";
import { Field, FieldDescription, FieldError, FieldLabel } from "./Field";
import { FormValidationContext } from "./Form";
import { Input } from "./Input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./InputGroup";
import { LabelWithTooltip } from "./LabelWithTooltip";

export interface TimeFieldProps extends Omit<React.ComponentProps<"input">, "className" | "onChange" | "type"> {
  label?: string;
  description?: string;
  errorMessage?: string;
  tooltip?: string;
  className?: string;
  inputClassName?: string;
  onChange?: (value: string) => void;
  trailingContent?: ReactNode;
  isRequired?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
}

export function TimeField({
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
  trailingContent,
  isRequired,
  isDisabled,
  isReadOnly,
  ...props
}: Readonly<TimeFieldProps>) {
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

  const [hasValue, setHasValue] = useState(!!(value ?? defaultValue));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(!!e.target.value);
    onChange?.(e.target.value);
  };

  const emptyClassName = !hasValue ? "text-muted-foreground" : undefined;
  const readOnlyClassName = isReadOnly
    ? "pointer-events-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden"
    : undefined;

  const inputProps = {
    id: name,
    name,
    type: "time" as const,
    value,
    defaultValue,
    onChange: handleChange,
    autoFocus,
    required: isRequired,
    disabled: isDisabled,
    readOnly: isReadOnly,
    "aria-invalid": isInvalid || undefined,
    ...props
  };

  return (
    <Field className={cn("flex flex-col", className)}>
      {label && (
        <FieldLabel htmlFor={name}>
          {tooltip ? <LabelWithTooltip tooltip={tooltip}>{label}</LabelWithTooltip> : label}
        </FieldLabel>
      )}
      {trailingContent ? (
        <InputGroup>
          <InputGroupInput className={cn(emptyClassName, readOnlyClassName, inputClassName)} {...inputProps} />
          <InputGroupAddon align="inline-end">{trailingContent}</InputGroupAddon>
        </InputGroup>
      ) : (
        <Input className={cn(emptyClassName, readOnlyClassName, inputClassName)} {...inputProps} />
      )}
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={errors} />
    </Field>
  );
}
