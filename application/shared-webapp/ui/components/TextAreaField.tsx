import { useContext } from "react";

import { useFieldError } from "../hooks/useFieldError";
import { cn } from "../utils";
import { Field, FieldDescription, FieldError, FieldLabel } from "./Field";
import { FormValidationContext } from "./Form";
import { LabelWithTooltip } from "./LabelWithTooltip";
import { Textarea } from "./Textarea";

export interface TextAreaFieldProps extends Omit<React.ComponentProps<"textarea">, "className" | "onChange"> {
  label?: string;
  description?: string;
  errorMessage?: string;
  tooltip?: React.ReactNode;
  className?: string;
  textareaClassName?: string;
  onChange?: (value: string) => void;
  isRequired?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
}

export function TextAreaField({
  label,
  description,
  errorMessage,
  tooltip,
  className,
  textareaClassName,
  name,
  value,
  onChange,
  autoFocus,
  isRequired,
  isDisabled,
  isReadOnly,
  ...props
}: Readonly<TextAreaFieldProps>) {
  const formErrors = useContext(FormValidationContext);
  const fieldValidationErrors = name && formErrors && name in formErrors ? formErrors[name] : undefined;
  const fieldErrorMessages = fieldValidationErrors
    ? Array.isArray(fieldValidationErrors)
      ? fieldValidationErrors
      : [fieldValidationErrors]
    : [];
  const { displayError, markChanged, clearOnBlur } = useFieldError(errorMessage);
  const errors = displayError
    ? [{ message: displayError }]
    : fieldErrorMessages.length > 0
      ? fieldErrorMessages.map((error) => ({ message: error }))
      : undefined;
  const isInvalid = errors && errors.length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    markChanged();
    onChange?.(e.target.value);
  };

  return (
    <Field className={cn("flex flex-col", className)}>
      {label && (
        <FieldLabel htmlFor={name}>
          {tooltip ? <LabelWithTooltip tooltip={tooltip}>{label}</LabelWithTooltip> : label}
        </FieldLabel>
      )}
      <Textarea
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={clearOnBlur}
        autoFocus={autoFocus}
        required={isRequired}
        disabled={isDisabled}
        readOnly={isReadOnly}
        aria-invalid={isInvalid || undefined}
        className={textareaClassName}
        {...props}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={errors} />
    </Field>
  );
}
