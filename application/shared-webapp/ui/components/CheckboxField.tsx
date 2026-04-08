import type { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";

import { useContext } from "react";

import { cn } from "../utils";
import { Checkbox } from "./Checkbox";
import { Field, FieldError } from "./Field";
import { FormValidationContext } from "./Form";
import { LabelWithTooltip } from "./LabelWithTooltip";

export interface CheckboxFieldProps extends CheckboxPrimitive.Root.Props {
  label?: string;
  errorMessage?: string;
  tooltip?: React.ReactNode;
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
    <Field inline className={cn("flex-col gap-1", alignWithLabel && "mt-[1.953rem]", className)}>
      <label className="flex min-h-(--control-height) items-center gap-2">
        <Checkbox
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
