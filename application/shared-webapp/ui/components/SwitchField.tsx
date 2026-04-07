import type { Switch as SwitchPrimitive } from "@base-ui/react/switch";

import { useContext } from "react";

import { cn } from "../utils";
import { Field, FieldError } from "./Field";
import { FormValidationContext } from "./Form";
import { LabelWithTooltip } from "./LabelWithTooltip";
import { Switch } from "./Switch";

export interface SwitchFieldProps extends SwitchPrimitive.Root.Props {
  label?: string;
  errorMessage?: string;
  tooltip?: string;
  className?: string;
  isReadOnly?: boolean;
  alignWithLabel?: boolean;
}

export function SwitchField({
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
      ? fieldErrorMessages.map((error) => ({ message: error }))
      : undefined;

  return (
    <Field inline className={cn("flex-col gap-1", alignWithLabel && "self-end", className)}>
      <label className="flex min-h-(--control-height) cursor-pointer items-center gap-2">
        <Switch name={name} disabled={disabled} onCheckedChange={isReadOnly ? undefined : onCheckedChange} {...props} />
        {label && (
          <span className="text-sm leading-snug font-medium">
            {tooltip ? <LabelWithTooltip tooltip={tooltip}>{label}</LabelWithTooltip> : label}
          </span>
        )}
      </label>
      <FieldError errors={errors} />
    </Field>
  );
}
