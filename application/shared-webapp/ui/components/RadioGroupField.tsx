import type { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";

import { useContext } from "react";

import { cn } from "../utils";
import { Field, FieldDescription, FieldError, FieldLabel } from "./Field";
import { FormValidationContext } from "./Form";
import { LabelWithTooltip } from "./LabelWithTooltip";
import { RadioGroup } from "./RadioGroup";

export interface RadioGroupFieldProps extends RadioGroupPrimitive.Props {
  label?: string;
  description?: string;
  errorMessage?: string;
  tooltip?: string;
  className?: string;
  isReadOnly?: boolean;
  children: React.ReactNode;
}

export function RadioGroupField({
  label,
  description,
  errorMessage,
  tooltip,
  className,
  name,
  isReadOnly,
  disabled,
  children,
  ...props
}: Readonly<RadioGroupFieldProps>) {
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
        <FieldLabel>{tooltip ? <LabelWithTooltip tooltip={tooltip}>{label}</LabelWithTooltip> : label}</FieldLabel>
      )}
      <RadioGroup name={name} disabled={disabled} readOnly={isReadOnly} {...props}>
        {children}
      </RadioGroup>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={errors} />
    </Field>
  );
}
