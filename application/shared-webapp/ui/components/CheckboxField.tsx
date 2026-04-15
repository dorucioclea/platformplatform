import type { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";

import { useContext } from "react";

import { useFieldError } from "../hooks/useFieldError";
import { cn } from "../utils";
import { Checkbox } from "./Checkbox";
import { Field, FieldError } from "./Field";
import { FormValidationContext } from "./Form";
import { Label } from "./Label";
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
  const { displayError, clearNow } = useFieldError(errorMessage);
  const errors = displayError
    ? [{ message: displayError }]
    : fieldErrorMessages.length > 0
      ? fieldErrorMessages.map((error) => ({ message: error }))
      : undefined;

  const handleCheckedChange: typeof onCheckedChange = (checked, event) => {
    clearNow();
    onCheckedChange?.(checked, event);
  };

  return (
    // alignWithLabel offset = FieldLabel height (0.875rem text-sm * 1.375 leading-snug = 1.203125rem) + Field gap-3 (0.75rem) = 1.953125rem.
    // Pushes a label-less checkbox down by exactly a label+gap, so it lines up with the input of a sibling field.
    <Field inline className={cn("flex-col gap-1", alignWithLabel && "mt-[1.953rem]", className)}>
      <Label className="min-h-(--control-height) leading-snug">
        <Checkbox
          name={name}
          disabled={disabled}
          onCheckedChange={isReadOnly ? undefined : handleCheckedChange}
          className={isReadOnly ? "focus:outline focus:outline-2 focus:outline-offset-2" : undefined}
          {...props}
        />
        {label && (tooltip ? <LabelWithTooltip tooltip={tooltip}>{label}</LabelWithTooltip> : label)}
      </Label>
      <FieldError errors={errors} />
    </Field>
  );
}
