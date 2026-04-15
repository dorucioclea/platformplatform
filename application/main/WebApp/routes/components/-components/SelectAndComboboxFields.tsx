import type { ReactNode } from "react";

import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { MultiSelect } from "@repo/ui/components/MultiSelect";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/Select";
import { SelectField } from "@repo/ui/components/SelectField";
import { AreaChartIcon, BarChart3Icon, LineChartIcon, PieChartIcon, RadarIcon, TrendingUpIcon } from "lucide-react";
import { useState } from "react";

import type { ControlRowDerivedProps } from "./controlRowTypes";

import { ComboboxFields } from "./ComboboxFields";
import { tooltips } from "./controlTooltips";

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
  placeholders,
  errorMessage,
  selectedColor,
  setSelectedColor,
  selectedCharts,
  setSelectedCharts,
  chartItems
}: SelectAndComboboxFieldsProps) {
  const [localColor, setLocalColor] = useState("bar");
  const [localCharts, setLocalCharts] = useState<string[]>(["bar", "pie"]);
  const chartSelectItems = [
    { value: "bar", label: t`Bar chart`, icon: <BarChart3Icon /> },
    { value: "line", label: t`Line chart`, icon: <LineChartIcon /> },
    { value: "pie", label: t`Pie chart`, icon: <PieChartIcon /> }
  ];
  const currentColor = hasValues ? localColor : selectedColor;
  const selectedChartIcon = chartSelectItems.find((i) => i.value === currentColor)?.icon;
  const currentCharts = hasValues ? localCharts : selectedCharts;
  const hasCharts = currentCharts.length > 0;

  return (
    <>
      <SelectField
        label={label ? t`Select` : undefined}
        tooltip={tooltip ? tooltips.select : undefined}
        name={`select-${suffix}`}
        items={chartSelectItems}
        value={hasValues ? localColor : selectedColor || null}
        onValueChange={(value) => (hasValues ? setLocalColor(value ?? "") : setSelectedColor(value ?? ""))}
        isDisabled={disabled}
        isReadOnly={readOnly}
        errorMessage={errorMessage}
      >
        <SelectTrigger>
          {showIcon && (selectedChartIcon ? selectedChartIcon : placeholders ? <TrendingUpIcon /> : null)}
          <SelectValue placeholder={placeholders ? t`Pick a chart` : undefined} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={null}>
            <span className="text-muted-foreground">
              <Trans>None</Trans>
            </span>
          </SelectItem>
          {chartSelectItems.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {showIcon ? item.icon : null}
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectField>
      <MultiSelect
        label={label ? t`Multi select` : undefined}
        tooltip={tooltip ? tooltips.multiSelect : undefined}
        name={`multi-${suffix}`}
        placeholder={placeholders ? t`Select charts` : undefined}
        startIcon={showIcon && (hasCharts || placeholders) ? <TrendingUpIcon /> : undefined}
        items={showIcon ? chartItems : chartItems.map(({ icon: _, ...rest }) => rest)}
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
        showIcon={showIcon}
        hasValues={hasValues}
        placeholders={placeholders}
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
