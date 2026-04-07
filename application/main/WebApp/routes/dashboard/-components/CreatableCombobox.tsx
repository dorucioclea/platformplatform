import type { ReactNode } from "react";

import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from "@repo/ui/components/Combobox";
import { Field, FieldError, FieldLabel } from "@repo/ui/components/Field";
import { LabelWithTooltip } from "@repo/ui/components/LabelWithTooltip";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

import type { ControlRowDerivedProps } from "./controlRowTypes";

type ChartItem = { id: string; label: string; icon?: ReactNode };

interface Props extends ControlRowDerivedProps {
  chartItems: ChartItem[];
}

export function CreatableCombobox({
  label,
  tooltipText,
  disabled,
  readOnly,
  hasValues,
  errorMessage,
  chartItems
}: Props) {
  const [value, setValue] = useState<string | null>(hasValues ? "pie" : null);
  const [search, setSearch] = useState("");
  const [customItems, setCustomItems] = useState<ChartItem[]>([]);
  const allItems = [...chartItems, ...customItems];
  const filtered = search
    ? allItems.filter((item) => item.label.toLowerCase().includes(search.toLowerCase()))
    : allItems;
  const hasExactMatch = allItems.some((item) => item.label.toLowerCase() === search.toLowerCase());
  const selectedIcon = allItems.find((i) => i.id === value)?.icon;
  const errors = errorMessage ? [{ message: errorMessage }] : undefined;

  return (
    <Field className="flex flex-col">
      {label && (
        <FieldLabel>
          {tooltipText ? (
            <LabelWithTooltip tooltip={tooltipText}>
              <Trans>Combobox (creatable)</Trans>
            </LabelWithTooltip>
          ) : (
            <Trans>Combobox (creatable)</Trans>
          )}
        </FieldLabel>
      )}
      <Combobox
        disabled={disabled}
        open={readOnly ? false : undefined}
        value={value}
        onValueChange={setValue}
        onInputValueChange={setSearch}
        itemToStringLabel={(v: string) => allItems.find((i) => i.id === v)?.label ?? v}
      >
        <ComboboxInput
          placeholder={t`Type or search...`}
          disabled={disabled}
          readOnly={readOnly}
          startIcon={selectedIcon}
          aria-invalid={!!errorMessage || undefined}
        />
        <ComboboxContent>
          <ComboboxList>
            {filtered.map((item) => (
              <ComboboxItem key={item.id} value={item.id}>
                {item.icon}
                {item.label}
              </ComboboxItem>
            ))}
            {search && !hasExactMatch && (
              <ComboboxItem
                value={search}
                onClick={() => {
                  const newId = search.toLowerCase().replace(/\s+/g, "-");
                  if (!allItems.some((i) => i.id === newId))
                    setCustomItems((prev) => [...prev, { id: newId, label: search }]);
                  setValue(newId);
                }}
                className="font-medium whitespace-nowrap text-primary"
              >
                <PlusIcon />
                <Trans>
                  Create "<span className="font-bold">{search}</span>"
                </Trans>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <FieldError errors={errors} />
    </Field>
  );
}
