import type { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";

import { useContext } from "react";

import { cn } from "../utils";
import { Checkbox } from "./Checkbox";
import { Field, FieldError, FieldLabel } from "./Field";
import { FormValidationContext } from "./Form";
import { LabelWithTooltip } from "./LabelWithTooltip";

export interface CheckboxFieldProps extends CheckboxPrimitive.Root.Props {
  label?: string;
  errorMessage?: string;
  tooltip?: string;
  className?: string;
  isReadOnly?: boolean;
  alignWithLabel?: boolean;
}

export function CheckboxField({
  label,
  errorMessage,
  tooltip,
  className,
  name,
  isReadOnly,
  alignWithLabel,
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
      ? fieldErrorMessages.map((error) => ({ message: error }))
      : undefined;

  return (
    <Field inline className={cn("flex-col gap-1", alignWithLabel && "self-end", className)}>
      <div className="flex min-h-(--control-height) items-center gap-2">
        <Checkbox
          name={name}
          disabled={disabled}
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
