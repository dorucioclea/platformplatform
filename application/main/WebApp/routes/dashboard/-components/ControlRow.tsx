import type { ReactNode } from "react";

import { t } from "@lingui/core/macro";
import { NumberField } from "@repo/ui/components/NumberField";
import { TextAreaField } from "@repo/ui/components/TextAreaField";
import { TextField } from "@repo/ui/components/TextField";
import { EuroIcon, SearchIcon } from "lucide-react";

import type { ControlRowProps } from "./controlRowTypes";

import { tooltips } from "./controlTooltips";
import { DateAndToggleFields } from "./DateAndToggleFields";
import { SelectAndComboboxFields } from "./SelectAndComboboxFields";

export { useChartItems } from "./SelectAndComboboxFields";

export function ControlRow({
  suffix,
  selectedColor,
  setSelectedColor,
  selectedCharts,
  setSelectedCharts,
  chartItems,
  label,
  tooltip,
  disabled,
  readOnly,
  error,
  showIcon
}: ControlRowProps & {
  selectedColor: string;
  setSelectedColor: (value: string) => void;
  selectedCharts: string[];
  setSelectedCharts: (value: string[]) => void;
  chartItems: { id: string; label: string; icon?: ReactNode }[];
}) {
  const hasValues = !!(disabled || readOnly);
  const errorMessage = error ? t`This field is required` : undefined;
  const derived = { suffix, label, tooltip, disabled, readOnly, error, showIcon, hasValues, errorMessage };

  return (
    <div className="grid grid-cols-4 gap-x-6 gap-y-4">
      <TextField
        label={label ? t`Text field` : undefined}
        tooltip={tooltip ? tooltips.textField : undefined}
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
        tooltip={tooltip ? tooltips.textArea : undefined}
        name={`textarea-${suffix}`}
        placeholder={t`Add notes here`}
        defaultValue={hasValues ? t`Meeting notes from last week` : undefined}
        isDisabled={disabled}
        isReadOnly={readOnly}
        errorMessage={errorMessage}
      />
      <NumberField
        label={label ? t`Number (integer)` : undefined}
        tooltip={tooltip ? tooltips.numberInteger : undefined}
        name={`integer-${suffix}`}
        defaultValue={hasValues ? 42 : undefined}
        minValue={0}
        maxValue={100}
        step={1}
        allowEmpty
        isDisabled={disabled}
        isReadOnly={readOnly}
        errorMessage={errorMessage}
        startIcon={showIcon ? <SearchIcon /> : undefined}
      />
      <NumberField
        label={label ? t`Number (decimal)` : undefined}
        tooltip={tooltip ? tooltips.numberDecimal : undefined}
        name={`decimal-${suffix}`}
        defaultValue={hasValues ? 149.95 : undefined}
        minValue={0}
        maxValue={999.99}
        step={0.1}
        decimalPlaces={2}
        allowEmpty
        isDisabled={disabled}
        isReadOnly={readOnly}
        errorMessage={errorMessage}
        startIcon={showIcon ? <EuroIcon /> : undefined}
      />
      <SelectAndComboboxFields
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        selectedCharts={selectedCharts}
        setSelectedCharts={setSelectedCharts}
        chartItems={chartItems}
        {...derived}
      />
      <DateAndToggleFields {...derived} />
    </div>
  );
}
