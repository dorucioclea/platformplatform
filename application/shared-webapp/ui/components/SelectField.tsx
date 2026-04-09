import type { Select as SelectPrimitive } from "@base-ui/react/select";

import { useContext } from "react";

import { useFieldError } from "../hooks/useFieldError";
import { cn } from "../utils";
import { Field, FieldDescription, FieldError } from "./Field";
import { FormValidationContext } from "./Form";
import { LabelWithTooltip } from "./LabelWithTooltip";
import { Select, SelectReadOnlyContext } from "./Select";

export interface SelectFieldProps<Value, Multiple extends boolean | undefined = false> extends SelectPrimitive.Root
  .Props<Value, Multiple> {
  label?: string;
  description?: string;
  errorMessage?: string;
  tooltip?: React.ReactNode;
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
  onValueChange,
  ...props
}: Readonly<SelectFieldProps<Value, Multiple>>) {
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

  // Merge errorMessage into form context so SelectTrigger can show aria-invalid
  const triggerErrors =
    name && (displayError || fieldErrorMessages.length > 0)
      ? { ...formErrors, [name]: displayError ? [displayError] : fieldErrorMessages }
      : formErrors;

  const focusTrigger = () => {
    if (!name) return;
    const focusOptions = { preventScroll: true, focusVisible: true };
    document.getElementById(name)?.focus(focusOptions);
  };

  return (
    <Field className={cn("flex flex-col", className)}>
      {label && (
        <span
          data-slot="field-label"
          className="flex cursor-default items-center gap-2 text-sm leading-snug font-medium select-none"
          onClick={focusTrigger}
        >
          {tooltip ? <LabelWithTooltip tooltip={tooltip}>{label}</LabelWithTooltip> : label}
        </span>
      )}
      <FormValidationContext.Provider value={triggerErrors}>
        <SelectReadOnlyContext.Provider value={!!isReadOnly}>
          <Select name={name} disabled={isDisabled} readOnly={isReadOnly} onValueChange={handleValueChange} {...props}>
            {children}
          </Select>
        </SelectReadOnlyContext.Provider>
      </FormValidationContext.Provider>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={errors} />
    </Field>
  );
}
