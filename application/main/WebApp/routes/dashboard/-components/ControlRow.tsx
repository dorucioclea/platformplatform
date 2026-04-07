import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { MultiSelect } from "@repo/ui/components/MultiSelect";
import { NumberField } from "@repo/ui/components/NumberField";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/Select";
import { SelectField } from "@repo/ui/components/SelectField";
import { TextAreaField } from "@repo/ui/components/TextAreaField";
import { TextField } from "@repo/ui/components/TextField";
import {
  AreaChartIcon,
  BarChart3Icon,
  EuroIcon,
  LineChartIcon,
  PieChartIcon,
  RadarIcon,
  SearchIcon
} from "lucide-react";
import { useState } from "react";

import type { ControlRowProps } from "./controlRowTypes";

import { DateAndToggleFields } from "./DateAndToggleFields";

export function useChartItems() {
  return [
    { id: "bar", label: t`Bar chart`, icon: <BarChart3Icon /> },
    { id: "line", label: t`Line chart`, icon: <LineChartIcon /> },
    { id: "pie", label: t`Pie chart`, icon: <PieChartIcon /> },
    { id: "area", label: t`Area chart`, icon: <AreaChartIcon /> },
    { id: "radar", label: t`Radar chart`, icon: <RadarIcon /> }
  ];
}

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
  chartItems: { id: string; label: string }[];
}) {
  const hasValues = !!(disabled || readOnly);
  const [localColor, setLocalColor] = useState(hasValues ? "bar" : "");
  const [localCharts, setLocalCharts] = useState<string[]>(hasValues ? ["bar", "pie"] : []);
  const chartSelectItems = [
    { value: "bar", label: t`Bar chart`, icon: <BarChart3Icon /> },
    { value: "line", label: t`Line chart`, icon: <LineChartIcon /> },
    { value: "pie", label: t`Pie chart`, icon: <PieChartIcon /> }
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
        tooltip={tooltipText}
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
      <SelectField
        label={label ? t`Select` : undefined}
        tooltip={tooltipText}
        name={`select-${suffix}`}
        items={chartSelectItems}
        value={hasValues ? localColor : selectedColor || null}
        onValueChange={(value) => (hasValues ? setLocalColor(value ?? "") : setSelectedColor(value ?? ""))}
        isDisabled={disabled}
        isReadOnly={readOnly}
        errorMessage={errorMessage}
      >
        <SelectTrigger>
          {showIcon && <BarChart3Icon />}
          <SelectValue placeholder={t`Pick a chart`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={null}>
            <span className="text-muted-foreground">
              <Trans>None</Trans>
            </span>
          </SelectItem>
          {chartSelectItems.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.icon}
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
        startIcon={showIcon ? <SearchIcon /> : undefined}
        items={chartItems}
        value={hasValues ? localCharts : selectedCharts}
        onChange={hasValues ? setLocalCharts : setSelectedCharts}
        isDisabled={disabled}
        isReadOnly={readOnly}
        errorMessage={errorMessage}
      />
      <DateAndToggleFields {...derived} />
    </div>
  );
}
