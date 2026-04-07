import type { ReactNode } from "react";

import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from "@repo/ui/components/Combobox";
import { Field, FieldLabel } from "@repo/ui/components/Field";
import { MultiSelect } from "@repo/ui/components/MultiSelect";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/Select";
import { SelectField } from "@repo/ui/components/SelectField";
import { AreaChartIcon, BarChart3Icon, LineChartIcon, PieChartIcon, RadarIcon, SearchIcon } from "lucide-react";
import { useState } from "react";

import type { ControlRowDerivedProps } from "./controlRowTypes";

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
  tooltipText,
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
  const [comboboxSearch, setComboboxSearch] = useState("");
  const filteredChartItems = comboboxSearch
    ? chartItems.filter((item) => item.label.toLowerCase().includes(comboboxSearch.toLowerCase()))
    : chartItems;

  return (
    <>
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
      <Field className="flex flex-col">
        {label && (
          <FieldLabel>
            <Trans>Combobox</Trans>
          </FieldLabel>
        )}
        <Combobox
          disabled={disabled}
          onInputValueChange={setComboboxSearch}
          itemToStringLabel={(value: string) => chartItems.find((i) => i.id === value)?.label ?? value}
        >
          <ComboboxInput placeholder={t`Search charts...`} disabled={disabled} />
          <ComboboxContent>
            <ComboboxList>
              {filteredChartItems.length === 0 && (
                <div className="flex w-full justify-center py-2 text-center text-sm text-muted-foreground">
                  <Trans>No results found</Trans>
                </div>
              )}
              {filteredChartItems.map((item) => (
                <ComboboxItem key={item.id} value={item.id}>
                  {item.icon}
                  {item.label}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </Field>
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
