import type { Switch as SwitchPrimitive } from "@base-ui/react/switch";

import { useContext } from "react";

import { cn } from "../utils";
import { Field, FieldError, FieldLabel } from "./Field";
import { FormValidationContext } from "./Form";
import { LabelWithTooltip } from "./LabelWithTooltip";
import { Switch } from "./Switch";

export interface SwitchFieldProps extends SwitchPrimitive.Root.Props {
  label?: string;
  errorMessage?: string;
  tooltip?: React.ReactNode;
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
      ? fieldErrorMessages.map((error) => ({ message: error }))
      : undefined;

  return (
    <Field className={cn("inline-flex w-auto flex-col", className)}>
      {label && (
        <FieldLabel className="invisible" aria-hidden="true">
          {"\u200D"}
        </FieldLabel>
      )}
      <label className="flex min-h-(--control-height) items-center gap-2">
        <Switch
          name={name}
          disabled={disabled}
          onCheckedChange={isReadOnly ? undefined : onCheckedChange}
          className={isReadOnly ? "focus:outline focus:outline-2 focus:outline-offset-2" : undefined}
          {...props}
        />
        {label && (
          <span className="flex items-center gap-2 text-sm leading-snug font-medium">
            {tooltip ? <LabelWithTooltip tooltip={tooltip}>{label}</LabelWithTooltip> : label}
          </span>
        )}
      </label>
      <FieldError errors={errors} />
    </Field>
  );
}
