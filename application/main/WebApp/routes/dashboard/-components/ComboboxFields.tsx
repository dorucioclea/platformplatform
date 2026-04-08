import type { ReactNode } from "react";

import { t } from "@lingui/core/macro";
import { ComboboxField } from "@repo/ui/components/ComboboxField";
import { useState } from "react";

import type { ControlRowDerivedProps } from "./controlRowTypes";

import { tooltips } from "./controlTooltips";

type ChartItem = { id: string; label: string; icon?: ReactNode };

export interface ComboboxFieldsProps extends ControlRowDerivedProps {
  chartItems: ChartItem[];
}

export function ComboboxFields({
  label,
  tooltip,
  disabled,
  readOnly,
  hasValues,
  errorMessage,
  chartItems
}: ComboboxFieldsProps) {
  const [selectValue, setSelectValue] = useState<string | null>(hasValues ? "pie" : null);
  const [freeTextValue, setFreeTextValue] = useState<string | null>(hasValues ? "pie" : null);
  const [creatableValue, setCreatableValue] = useState<string | null>(hasValues ? "pie" : null);
  const [creatableItems, setCreatableItems] = useState<ChartItem[]>([]);
  const allCreatableItems = [...chartItems, ...creatableItems];

  return (
    <>
      <ComboboxField
        label={label ? t`Combobox` : undefined}
        tooltip={tooltip ? tooltips.combobox : undefined}
        placeholder={t`Search charts...`}
        emptyMessage={t`No results found`}
        items={chartItems}
        value={selectValue}
        onValueChange={setSelectValue}
        isDisabled={disabled}
        isReadOnly={readOnly}
        errorMessage={errorMessage}
      />
      <ComboboxField
        label={label ? t`Combobox (free text)` : undefined}
        tooltip={tooltip ? tooltips.comboboxFreeText : undefined}
        placeholder={t`Type or search...`}
        items={chartItems}
        value={freeTextValue}
        onValueChange={setFreeTextValue}
        isDisabled={disabled}
        isReadOnly={readOnly}
        errorMessage={errorMessage}
        allowCustomValue
      />
      <ComboboxField
        label={label ? t`Combobox (creatable)` : undefined}
        tooltip={tooltip ? tooltips.comboboxCreatable : undefined}
        placeholder={t`Type or search...`}
        items={allCreatableItems}
        value={creatableValue}
        onValueChange={setCreatableValue}
        isDisabled={disabled}
        isReadOnly={readOnly}
        errorMessage={errorMessage}
        allowCreate
        onCreateItem={(itemLabel) => {
          const newId = itemLabel.toLowerCase().replace(/\s+/g, "-");
          if (!allCreatableItems.some((item) => item.id === newId)) {
            setCreatableItems((previous) => [...previous, { id: newId, label: itemLabel }]);
          }
        }}
      />
    </>
  );
}
