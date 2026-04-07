import { t } from "@lingui/core/macro";
import { MultiSelect } from "@repo/ui/components/MultiSelect";
import { NumberField } from "@repo/ui/components/NumberField";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/Select";
import { SelectField } from "@repo/ui/components/SelectField";
import { TextAreaField } from "@repo/ui/components/TextAreaField";
import { TextField } from "@repo/ui/components/TextField";
import { SearchIcon } from "lucide-react";
import { useState } from "react";

import type { ControlRowProps } from "./controlRowTypes";

import { DateAndToggleFields } from "./DateAndToggleFields";

export function useFruitItems() {
  return [
    { id: "apple", label: t`Apple` },
    { id: "banana", label: t`Banana` },
    { id: "cherry", label: t`Cherry` },
    { id: "mango", label: t`Mango` },
    { id: "orange", label: t`Orange` }
  ];
}

export function ControlRow({
  suffix,
  selectedColor,
  setSelectedColor,
  selectedFruits,
  setSelectedFruits,
  fruitItems,
  label,
  tooltip,
  disabled,
  readOnly,
  error,
  showIcon
}: ControlRowProps & {
  selectedColor: string;
  setSelectedColor: (value: string) => void;
  selectedFruits: string[];
  setSelectedFruits: (value: string[]) => void;
  fruitItems: { id: string; label: string }[];
}) {
  const hasValues = !!(disabled || readOnly);
  const [localColor, setLocalColor] = useState(hasValues ? "green" : "");
  const [localFruits, setLocalFruits] = useState<string[]>(hasValues ? ["apple", "banana"] : []);
  const colorItems = [
    { value: "red", label: t`Red` },
    { value: "green", label: t`Green` },
    { value: "blue", label: t`Blue` }
  ];
  const tooltipText = tooltip ? t`This is a helpful tooltip` : undefined;
  const errorMessage = error ? t`This field is required` : undefined;
  const derived = { suffix, label, tooltip, disabled, readOnly, error, showIcon, hasValues, tooltipText, errorMessage };

  return (
    <div className="grid grid-cols-4 gap-x-6 gap-y-4">
      <TextField
        label={label ? t`Text field` : undefined}
        tooltip={tooltipText}
        name={`text-${suffix}`}
        placeholder={t`E.g., Alex Taylor`}
        defaultValue={hasValues ? t`Alex Taylor` : undefined}
        isDisabled={disabled}
        isReadOnly={readOnly}
        errorMessage={errorMessage}
        startIcon={showIcon ? <SearchIcon /> : undefined}
      />
      <TextAreaField
        label={label ? t`Text area` : undefined}
        tooltip={tooltipText}
        name={`textarea-${suffix}`}
        placeholder={t`Add notes here`}
        defaultValue={hasValues ? t`Meeting notes from last week` : undefined}
        isDisabled={disabled}
        isReadOnly={readOnly}
        errorMessage={errorMessage}
      />
      <NumberField
        label={label ? t`Number (integer)` : undefined}
        tooltip={tooltipText}
        name={`integer-${suffix}`}
        defaultValue={hasValues ? 42 : 1}
        minValue={0}
        maxValue={100}
        step={1}
        isDisabled={disabled}
        isReadOnly={readOnly}
        errorMessage={errorMessage}
        startIcon={showIcon ? <SearchIcon /> : undefined}
      />
      <NumberField
        label={label ? t`Number (decimal)` : undefined}
        tooltip={tooltipText}
        name={`decimal-${suffix}`}
        defaultValue={hasValues ? 149.95 : 9.99}
        minValue={0}
        maxValue={999.99}
        step={0.01}
        isDisabled={disabled}
        isReadOnly={readOnly}
        errorMessage={errorMessage}
      />
      <SelectField
        label={label ? t`Select` : undefined}
        tooltip={tooltipText}
        name={`select-${suffix}`}
        items={colorItems}
        value={hasValues ? localColor : selectedColor}
        onValueChange={(value) => value && (hasValues ? setLocalColor(value) : setSelectedColor(value))}
        isDisabled={disabled}
        isReadOnly={readOnly}
        errorMessage={errorMessage}
      >
        <SelectTrigger>
          <SelectValue placeholder={t`Pick a color`} />
        </SelectTrigger>
        <SelectContent>
          {colorItems.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectField>
      <MultiSelect
        label={label ? t`Multi select` : undefined}
        tooltip={tooltipText}
        name={`multi-${suffix}`}
        placeholder={t`Select fruits`}
        items={fruitItems}
        value={hasValues ? localFruits : selectedFruits}
        onChange={hasValues ? setLocalFruits : setSelectedFruits}
        isDisabled={disabled}
        isReadOnly={readOnly}
        errorMessage={errorMessage}
      />
      <DateAndToggleFields {...derived} />
    </div>
  );
}
