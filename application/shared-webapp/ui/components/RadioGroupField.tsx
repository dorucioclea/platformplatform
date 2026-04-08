import type { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";

import { useContext } from "react";

import { useFieldError } from "../hooks/useFieldError";
import { cn } from "../utils";
import { Field, FieldDescription, FieldError, FieldLabel } from "./Field";
import { FormValidationContext } from "./Form";
import { LabelWithTooltip } from "./LabelWithTooltip";
import { RadioGroup } from "./RadioGroup";

export interface RadioGroupFieldProps extends RadioGroupPrimitive.Props {
  label?: string;
  description?: string;
  errorMessage?: string;
  tooltip?: React.ReactNode;
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
  onValueChange,
  ...props
}: Readonly<RadioGroupFieldProps>) {
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

  const handleValueChange: typeof onValueChange = (value, event) => {
    clearNow();
    onValueChange?.(value, event);
  };

  return (
    <Field className={cn("flex flex-col", className)}>
      {label && (
        <FieldLabel>{tooltip ? <LabelWithTooltip tooltip={tooltip}>{label}</LabelWithTooltip> : label}</FieldLabel>
      )}
      <RadioGroup
        name={name}
        disabled={disabled}
        readOnly={isReadOnly}
        onValueChange={handleValueChange}
        className={
          isReadOnly
            ? "[&_[data-slot=radio-group-item]]:focus:outline [&_[data-slot=radio-group-item]]:focus:outline-2 [&_[data-slot=radio-group-item]]:focus:outline-offset-2"
            : undefined
        }
        {...props}
      >
        {children}
      </RadioGroup>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={errors} />
    </Field>
  );
}
