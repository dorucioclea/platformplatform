import type { Select as SelectPrimitive } from "@base-ui/react/select";

import { useContext } from "react";

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
  ...props
}: Readonly<SelectFieldProps<Value, Multiple>>) {
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

  // Merge errorMessage into form context so SelectTrigger can show aria-invalid
  const triggerErrors =
    name && (errorMessage || fieldErrorMessages.length > 0)
      ? { ...formErrors, [name]: errorMessage ? [errorMessage] : fieldErrorMessages }
      : formErrors;

  const focusTrigger = () => {
    if (!name) return;
    const focusOptions = { preventScroll: true, focusVisible: true };
    document.getElementById(name)?.focus(focusOptions);
  };

  return (
    <Field className={cn("flex flex-col", className)}>
      {label && (
        <label
          data-slot="field-label"
          className="flex items-center gap-2 text-sm leading-snug font-medium select-none"
          onClick={focusTrigger}
        >
          {tooltip ? <LabelWithTooltip tooltip={tooltip}>{label}</LabelWithTooltip> : label}
        </label>
      )}
      <FormValidationContext.Provider value={triggerErrors}>
        <SelectReadOnlyContext.Provider value={!!isReadOnly}>
          <Select name={name} disabled={isDisabled} open={isReadOnly ? false : undefined} {...props}>
            {children}
          </Select>
        </SelectReadOnlyContext.Provider>
      </FormValidationContext.Provider>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={errors} />
    </Field>
  );
}
