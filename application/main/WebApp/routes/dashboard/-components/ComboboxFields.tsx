import type { ReactNode } from "react";

import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from "@repo/ui/components/Combobox";
import { Field, FieldError, FieldLabel } from "@repo/ui/components/Field";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

import type { ControlRowDerivedProps } from "./controlRowTypes";

interface ComboboxFieldsProps extends ControlRowDerivedProps {
  chartItems: { id: string; label: string; icon?: ReactNode }[];
}

export function ComboboxFields({
  label,
  disabled,
  readOnly,
  hasValues,
  errorMessage,
  chartItems
}: ComboboxFieldsProps) {
  const [comboboxValue, setComboboxValue] = useState<string | null>(hasValues ? "pie" : null);
  const [comboboxSearch, setComboboxSearch] = useState("");
  const filteredChartItems = comboboxSearch
    ? chartItems.filter((item) => item.label.toLowerCase().includes(comboboxSearch.toLowerCase()))
    : chartItems;
  const selectedComboboxIcon = chartItems.find((i) => i.id === comboboxValue)?.icon;
  const errors = errorMessage ? [{ message: errorMessage }] : undefined;

  const [creatableValue, setCreatableValue] = useState<string | null>(hasValues ? "pie" : null);
  const [creatableSearch, setCreatableSearch] = useState("");
  const [customItems, setCustomItems] = useState<{ id: string; label: string; icon?: ReactNode }[]>([]);
  const allCreatableItems = [...chartItems, ...customItems];
  const filteredCreatableItems = creatableSearch
    ? allCreatableItems.filter((item) => item.label.toLowerCase().includes(creatableSearch.toLowerCase()))
    : allCreatableItems;
  const hasExactMatch = allCreatableItems.some((item) => item.label.toLowerCase() === creatableSearch.toLowerCase());
  const handleCreateItem = () => {
    const newId = creatableSearch.toLowerCase().replace(/\s+/g, "-");
    setCustomItems((prev) => [...prev, { id: newId, label: creatableSearch }]);
    setCreatableValue(newId);
    setCreatableSearch("");
  };

  return (
    <>
      <Field className="flex flex-col">
        {label && (
          <FieldLabel>
            <Trans>Combobox</Trans>
          </FieldLabel>
        )}
        <Combobox
          disabled={disabled}
          open={readOnly ? false : undefined}
          value={comboboxValue}
          onValueChange={setComboboxValue}
          onInputValueChange={setComboboxSearch}
          itemToStringLabel={(value: string) => chartItems.find((i) => i.id === value)?.label ?? value}
        >
          <ComboboxInput
            placeholder={t`Search charts...`}
            disabled={disabled}
            readOnly={readOnly}
            startIcon={selectedComboboxIcon}
            aria-invalid={!!errorMessage || undefined}
          />
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
        <FieldError errors={errors} />
      </Field>
      <Field className="flex flex-col">
        {label && (
          <FieldLabel>
            <Trans>Combobox (creatable)</Trans>
          </FieldLabel>
        )}
        <Combobox
          disabled={disabled}
          open={readOnly ? false : undefined}
          value={creatableValue}
          onValueChange={setCreatableValue}
          onInputValueChange={setCreatableSearch}
          itemToStringLabel={(value: string) => allCreatableItems.find((i) => i.id === value)?.label ?? value}
        >
          <ComboboxInput
            placeholder={t`Type or search...`}
            disabled={disabled}
            readOnly={readOnly}
            aria-invalid={!!errorMessage || undefined}
          />
          <ComboboxContent>
            <ComboboxList>
              {filteredCreatableItems.map((item) => (
                <ComboboxItem key={item.id} value={item.id}>
                  {item.icon}
                  {item.label}
                </ComboboxItem>
              ))}
              {creatableSearch && !hasExactMatch && (
                <ComboboxItem value={creatableSearch} onClick={handleCreateItem}>
                  <PlusIcon />
                  <Trans>Create "{creatableSearch}"</Trans>
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <FieldError errors={errors} />
      </Field>
    </>
  );
}
