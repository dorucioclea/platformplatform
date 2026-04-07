import { useContext } from "react";

import { cn } from "../utils";
import { Field, FieldDescription, FieldError, FieldLabel } from "./Field";
import { FormValidationContext } from "./Form";
import { Input } from "./Input";
import { LabelWithTooltip } from "./LabelWithTooltip";

export interface DateFieldProps extends Omit<React.ComponentProps<"input">, "className" | "onChange" | "type"> {
  label?: string;
  description?: string;
  errorMessage?: string;
  tooltip?: string;
  className?: string;
  inputClassName?: string;
  onChange?: (value: string) => void;
  isRequired?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
}

export function DateField({
  label,
  description,
  errorMessage,
  tooltip,
  className,
  inputClassName,
  name,
  value,
  onChange,
  autoFocus,
  isRequired,
  isDisabled,
  isReadOnly,
  ...props
}: Readonly<DateFieldProps>) {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <Field className={cn("flex flex-col", className)}>
      {label && (
        <FieldLabel htmlFor={name}>
          {tooltip ? <LabelWithTooltip tooltip={tooltip}>{label}</LabelWithTooltip> : label}
        </FieldLabel>
      )}
      <Input
        id={name}
        name={name}
        type="date"
        value={value}
        onChange={handleChange}
        autoFocus={autoFocus}
        required={isRequired}
        disabled={isDisabled}
        readOnly={isReadOnly}
        aria-invalid={isInvalid || undefined}
        className={inputClassName}
        {...props}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={errors} />
    </Field>
  );
}
