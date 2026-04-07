import { useContext } from "react";

import { cn } from "../utils";
import { Field, FieldError, FieldLabel } from "./Field";
import { FormValidationContext } from "./Form";
import { LabelWithTooltip } from "./LabelWithTooltip";

import type { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { Switch } from "./Switch";

export interface SwitchFieldProps extends SwitchPrimitive.Root.Props {
  label?: string;
  errorMessage?: string;
  tooltip?: string;
  className?: string;
  isReadOnly?: boolean;
}

export function SwitchField({
  label,
  errorMessage,
  tooltip,
  className,
  name,
  isReadOnly,
  disabled,
  onCheckedChange,
  ...props
}: Readonly<SwitchFieldProps>) {
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
        <Switch
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
