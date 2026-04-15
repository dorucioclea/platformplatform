import type { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";

import { useContext, useRef } from "react";

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

  const groupRef = useRef<HTMLDivElement>(null);

  const handleValueChange: typeof onValueChange = (value, event) => {
    clearNow();
    onValueChange?.(value, event);
  };

  const focusRadio = () => {
    if (disabled) return;
    const group = groupRef.current;
    if (!group) return;
    const checked = group.querySelector<HTMLElement>("[data-slot=radio-group-item][data-checked]");
    const fallback = group.querySelector<HTMLElement>("[data-slot=radio-group-item]");
    const target = checked ?? fallback;
    if (!target) return;
    target.setAttribute("data-label-focus", "");
    target.addEventListener("blur", () => target.removeAttribute("data-label-focus"), { once: true });
    target.focus({ preventScroll: true });
  };

  return (
    <Field ref={groupRef} className={cn("flex flex-col", className)}>
      {label && (
        <FieldLabel
          onClick={focusRadio}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              focusRadio();
            }
          }}
        >
          {tooltip ? <LabelWithTooltip tooltip={tooltip}>{label}</LabelWithTooltip> : label}
        </FieldLabel>
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
