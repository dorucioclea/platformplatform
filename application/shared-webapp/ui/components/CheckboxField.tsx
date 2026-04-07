import { useContext } from "react";

import { cn } from "../utils";
import { Field, FieldError, FieldLabel } from "./Field";
import { FormValidationContext } from "./Form";
import { LabelWithTooltip } from "./LabelWithTooltip";

import type { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { Checkbox } from "./Checkbox";

export interface CheckboxFieldProps extends CheckboxPrimitive.Root.Props {
  label?: string;
  errorMessage?: string;
  tooltip?: string;
  className?: string;
  isReadOnly?: boolean;
}

export function CheckboxField({
  label,
  errorMessage,
  tooltip,
  className,
  name,
  isReadOnly,
  disabled,
  onCheckedChange,
  ...props
}: Readonly<CheckboxFieldProps>) {
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

  return (
    <Field className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center gap-2">
        <Checkbox
          name={name}
          disabled={disabled || isReadOnly}
          onCheckedChange={isReadOnly ? undefined : onCheckedChange}
          {...props}
        />
        {label && (
          <FieldLabel htmlFor={name}>
            {tooltip ? <LabelWithTooltip tooltip={tooltip}>{label}</LabelWithTooltip> : label}
          </FieldLabel>
        )}
      </div>
      <FieldError errors={errors} />
    </Field>
  );
}
