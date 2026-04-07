import type { ReactNode } from "react";

import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { MultiSelect } from "@repo/ui/components/MultiSelect";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/Select";
import { SelectField } from "@repo/ui/components/SelectField";
import { AreaChartIcon, BarChart3Icon, LineChartIcon, PieChartIcon, RadarIcon, SearchIcon } from "lucide-react";
import { useState } from "react";

import type { ControlRowDerivedProps } from "./controlRowTypes";

import { ComboboxFields } from "./ComboboxFields";

interface SelectAndComboboxFieldsProps extends ControlRowDerivedProps {
  selectedColor: string;
  setSelectedColor: (value: string) => void;
  selectedCharts: string[];
  setSelectedCharts: (value: string[]) => void;
  chartItems: { id: string; label: string; icon?: ReactNode }[];
}

export function SelectAndComboboxFields({
  suffix,
  label,
  tooltip,
  disabled,
  readOnly,
  showIcon,
  hasValues,
  errorMessage,
  selectedColor,
  setSelectedColor,
  selectedCharts,
  setSelectedCharts,
  chartItems
}: SelectAndComboboxFieldsProps) {
  const [localColor, setLocalColor] = useState(hasValues ? "bar" : "");
  const [localCharts, setLocalCharts] = useState<string[]>(hasValues ? ["bar", "pie"] : []);
  const chartSelectItems = [
    { value: "bar", label: t`Bar chart`, icon: <BarChart3Icon /> },
    { value: "line", label: t`Line chart`, icon: <LineChartIcon /> },
    { value: "pie", label: t`Pie chart`, icon: <PieChartIcon /> }
  ];
  const currentColor = hasValues ? localColor : selectedColor;
  const selectedChartIcon = chartSelectItems.find((i) => i.value === currentColor)?.icon;

  return (
    <>
      <SelectField
        label={label ? t`Select` : undefined}
        tooltip={tooltip ? t`Dropdown for selecting one value from a predefined list` : undefined}
        name={`select-${suffix}`}
        items={chartSelectItems}
        value={hasValues ? localColor : selectedColor || null}
        onValueChange={(value) => (hasValues ? setLocalColor(value ?? "") : setSelectedColor(value ?? ""))}
        isDisabled={disabled}
        isReadOnly={readOnly}
        errorMessage={errorMessage}
      >
        <SelectTrigger>
          {selectedChartIcon}
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
        tooltip={tooltip ? t`Select multiple values from a list, unlike Select which picks one` : undefined}
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
      <ComboboxFields
        suffix={suffix}
        label={label}
        tooltip={tooltip}
        disabled={disabled}
        readOnly={readOnly}
        hasValues={hasValues}
        errorMessage={errorMessage}
        chartItems={chartItems}
      />
    </>
  );
}

export function useChartItems() {
  return [
    { id: "bar", label: t`Bar chart`, icon: <BarChart3Icon /> },
    { id: "line", label: t`Line chart`, icon: <LineChartIcon /> },
    { id: "pie", label: t`Pie chart`, icon: <PieChartIcon /> },
    { id: "area", label: t`Area chart`, icon: <AreaChartIcon /> },
    { id: "radar", label: t`Radar chart`, icon: <RadarIcon /> }
  ];
}
