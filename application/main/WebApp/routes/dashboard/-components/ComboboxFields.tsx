import type { ReactNode } from "react";

import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from "@repo/ui/components/Combobox";
import { Field, FieldError, FieldLabel } from "@repo/ui/components/Field";
import { LabelWithTooltip } from "@repo/ui/components/LabelWithTooltip";
import { useState } from "react";

import type { ControlRowDerivedProps } from "./controlRowTypes";

import { CreatableCombobox } from "./CreatableCombobox";

type ChartItem = { id: string; label: string; icon?: ReactNode };

export interface ComboboxFieldsProps extends ControlRowDerivedProps {
  chartItems: ChartItem[];
}

function ComboboxLabel({
  label,
  tooltipText,
  children
}: {
  label?: boolean;
  tooltipText?: string;
  children: ReactNode;
}) {
  if (!label) return null;
  return (
    <FieldLabel>
      {tooltipText ? <LabelWithTooltip tooltip={tooltipText}>{children}</LabelWithTooltip> : children}
    </FieldLabel>
  );
}

function filterItems(items: ChartItem[], search: string) {
  return search ? items.filter((item) => item.label.toLowerCase().includes(search.toLowerCase())) : items;
}

function SelectOnlyCombobox({
  label,
  tooltipText,
  disabled,
  readOnly,
  hasValues,
  errorMessage,
  chartItems
}: ComboboxFieldsProps) {
  const [value, setValue] = useState<string | null>(hasValues ? "pie" : null);
  const [search, setSearch] = useState("");
  const filtered = filterItems(chartItems, search);
  const selectedIcon = chartItems.find((i) => i.id === value)?.icon;
  const errors = errorMessage ? [{ message: errorMessage }] : undefined;

  return (
    <Field className="flex flex-col">
      <ComboboxLabel label={label} tooltipText={tooltipText}>
        <Trans>Combobox</Trans>
      </ComboboxLabel>
      <Combobox
        disabled={disabled}
        open={readOnly ? false : undefined}
        value={value}
        onValueChange={setValue}
        onInputValueChange={(text) => {
          setSearch(text);
          const match = chartItems.find((i) => i.label.toLowerCase() === text.toLowerCase());
          if (match) setValue(match.id);
        }}
        itemToStringLabel={(v: string) => chartItems.find((i) => i.id === v)?.label ?? v}
      >
        <ComboboxInput
          placeholder={t`Search charts...`}
          disabled={disabled}
          readOnly={readOnly}
          startIcon={selectedIcon}
          aria-invalid={!!errorMessage || undefined}
        />
        <ComboboxContent>
          <ComboboxList>
            {filtered.length === 0 && (
              <div className="flex w-full justify-center py-2 text-center text-sm text-muted-foreground">
                <Trans>No results found</Trans>
              </div>
            )}
            {filtered.map((item) => (
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
  );
}

function FreeTextCombobox({
  label,
  tooltipText,
  disabled,
  readOnly,
  hasValues,
  errorMessage,
  chartItems
}: ComboboxFieldsProps) {
  const [value, setValue] = useState<string>(hasValues ? "pie" : "");
  const [search, setSearch] = useState("");
  const filtered = filterItems(chartItems, search);
  const selectedIcon = chartItems.find((i) => i.id === value)?.icon;
  const errors = errorMessage ? [{ message: errorMessage }] : undefined;
  const isKnownItem = chartItems.some((i) => i.id === value);

  return (
    <Field className="flex flex-col">
      <ComboboxLabel label={label} tooltipText={tooltipText}>
        <Trans>Combobox (free text)</Trans>
      </ComboboxLabel>
      <Combobox
        disabled={disabled}
        open={readOnly ? false : undefined}
        value={value || null}
        onValueChange={(v: string | null) => setValue(v ?? "")}
        onInputValueChange={(text) => {
          setSearch(text);
          const exactMatch = chartItems.find((i) => i.label.toLowerCase() === text.toLowerCase());
          if (exactMatch) setValue(exactMatch.id);
          else if (text) setValue(text);
        }}
        itemToStringLabel={(v: string) => chartItems.find((i) => i.id === v)?.label ?? v}
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
            {value && !isKnownItem && (
              <ComboboxItem key="__custom" value={value} className="hidden">
                {value}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <FieldError errors={errors} />
    </Field>
  );
}

export function ComboboxFields(props: ComboboxFieldsProps) {
  return (
    <>
      <SelectOnlyCombobox {...props} />
      <FreeTextCombobox {...props} />
      <CreatableCombobox {...props} />
    </>
  );
}
