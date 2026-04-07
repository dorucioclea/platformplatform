import type { Select as SelectPrimitive } from "@base-ui/react/select";

import { useContext } from "react";

import { cn } from "../utils";
import { Field, FieldDescription, FieldError, FieldLabel } from "./Field";
import { FormValidationContext } from "./Form";
import { LabelWithTooltip } from "./LabelWithTooltip";
import { Select } from "./Select";

export interface SelectFieldProps<Value, Multiple extends boolean | undefined = false> extends SelectPrimitive.Root
  .Props<Value, Multiple> {
  label?: string;
  description?: string;
  errorMessage?: string;
  tooltip?: string;
  className?: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  children: React.ReactNode;
}

export function SelectField<Value, Multiple extends boolean | undefined = false>({
  label,
  description,
  errorMessage,
  tooltip,
  className,
  name,
  isDisabled,
  isReadOnly,
  children,
  ...props
}: Readonly<SelectFieldProps<Value, Multiple>>) {
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

  return (
    <Field className={cn("flex flex-col", className)}>
      {label && (
        <FieldLabel htmlFor={name}>
          {tooltip ? <LabelWithTooltip tooltip={tooltip}>{label}</LabelWithTooltip> : label}
        </FieldLabel>
      )}
      <Select name={name} disabled={isDisabled} open={isReadOnly ? false : undefined} {...props}>
        {children}
      </Select>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={errors} />
    </Field>
  );
}
