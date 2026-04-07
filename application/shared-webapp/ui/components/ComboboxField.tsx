import type { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import type * as React from "react";

import { PlusIcon } from "lucide-react";
import { useContext, useState } from "react";

import { cn } from "../utils";
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from "./Combobox";
import { Field, FieldDescription, FieldError } from "./Field";
import { FormValidationContext } from "./Form";
import { LabelWithTooltip } from "./LabelWithTooltip";

export interface ComboboxFieldItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface ComboboxFieldProps {
  name?: string;
  label?: string;
  description?: string;
  errorMessage?: string;
  tooltip?: string;
  placeholder?: string;
  emptyMessage?: React.ReactNode;
  items: ComboboxFieldItem[];
  value?: string | null;
  onValueChange?: (value: string | null) => void;
  className?: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  /** Allow typing custom values not in the items list */
  allowCustomValue?: boolean;
  /** Show a "Create" option when typed text doesn't match any item */
  allowCreate?: boolean;
  /** Called when user creates a new item via the Create option */
  onCreateItem?: (label: string) => void;
}

function filterItems(items: ComboboxFieldItem[], search: string) {
  if (!search) return items;
  const lower = search.toLowerCase();
  return items.filter((item) => item.label.toLowerCase().includes(lower));
}

export function ComboboxField({
  name,
  label,
  description,
  errorMessage,
  tooltip,
  placeholder,
  emptyMessage,
  items,
  value,
  onValueChange,
  className,
  isDisabled,
  isReadOnly,
  allowCustomValue,
  allowCreate,
  onCreateItem
}: Readonly<ComboboxFieldProps>) {
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
  const isInvalid = errors && errors.length > 0;

  const [search, setSearch] = useState("");
  const filtered = filterItems(items, search);
  const selectedIcon = items.find((item) => item.id === value)?.icon;
  const isKnownItem = items.some((item) => item.id === value);
  const hasExactMatch = items.some((item) => item.label.toLowerCase() === search.toLowerCase());

  const focusTrigger = () => {
    if (name) {
      const focusOptions = { preventScroll: true, focusVisible: true };
      document.getElementById(name)?.focus(focusOptions);
    }
  };

  const handleInputValueChange = (text: string) => {
    setSearch(text);
    const exactMatch = items.find((item) => item.label.toLowerCase() === text.toLowerCase());
    if (exactMatch) {
      onValueChange?.(exactMatch.id);
    } else if (text && (allowCustomValue || allowCreate)) {
      onValueChange?.(text);
    }
  };

  const handleCreateItem = () => {
    onCreateItem?.(search);
    onValueChange?.(search);
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
      <Combobox
        disabled={isDisabled}
        open={isReadOnly ? false : undefined}
        value={value ?? null}
        onValueChange={onValueChange}
        onInputValueChange={handleInputValueChange}
        itemToStringLabel={(itemValue: ComboboxPrimitive.Item.Props["value"]) =>
          items.find((item) => item.id === itemValue)?.label ?? String(itemValue ?? "")
        }
      >
        <ComboboxInput
          id={name}
          placeholder={placeholder}
          disabled={isDisabled}
          readOnly={isReadOnly}
          startIcon={selectedIcon}
          aria-invalid={isInvalid || undefined}
        />
        <ComboboxContent>
          <ComboboxList>
            {filtered.length === 0 && !allowCreate && (
              <div className="flex w-full justify-center py-2 text-center text-sm text-muted-foreground">
                {emptyMessage ?? "No results found"}
              </div>
            )}
            {filtered.map((item) => (
              <ComboboxItem key={item.id} value={item.id}>
                {item.icon}
                {item.label}
              </ComboboxItem>
            ))}
            {allowCustomValue && value && !isKnownItem && (
              <ComboboxItem key="__custom" value={value} className="hidden">
                {value}
              </ComboboxItem>
            )}
            {allowCreate && search && !hasExactMatch && (
              <ComboboxItem
                value={search}
                onClick={handleCreateItem}
                className="font-medium whitespace-nowrap text-primary"
              >
                <PlusIcon />
                Create <span className="font-bold">{search}</span>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={errors} />
    </Field>
  );
}
