import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { CheckboxField } from "@repo/ui/components/CheckboxField";
import { DateField } from "@repo/ui/components/DateField";
import { DatePicker } from "@repo/ui/components/DatePicker";
import { DateRangePicker } from "@repo/ui/components/DateRangePicker";
import { Field, FieldLabel } from "@repo/ui/components/Field";
import { InlineFieldGroup } from "@repo/ui/components/InlineFieldGroup";
import { LabelWithTooltip } from "@repo/ui/components/LabelWithTooltip";
import { RadioGroupItem } from "@repo/ui/components/RadioGroup";
import { RadioGroupField } from "@repo/ui/components/RadioGroupField";
import { SwitchField } from "@repo/ui/components/SwitchField";
import { TimeField } from "@repo/ui/components/TimeField";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/ToggleGroup";
import { BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-react";
import { useRef, useState } from "react";

import type { ControlRowDerivedProps } from "./controlRowTypes";

import { tooltips } from "./controlTooltips";
import { TextAreaFields } from "./TextAreaFields";

export function DateAndToggleFields({
  suffix,
  label,
  tooltip,
  disabled,
  readOnly,
  showIcon,
  hasValues,
  placeholders,
  errorMessage
}: ControlRowDerivedProps) {
  const toggleGroupRef = useRef<HTMLDivElement>(null);
  const focusToggle = () => {
    if (disabled) return;
    const group = toggleGroupRef.current;
    if (!group) return;
    const active = group.querySelector<HTMLElement>("[data-slot=toggle-group-item][data-pressed]");
    const fallback = group.querySelector<HTMLElement>("[data-slot=toggle-group-item]");
    const target = active ?? fallback;
    if (!target) return;
    target.setAttribute("data-label-focus", "");
    target.addEventListener("blur", () => target.removeAttribute("data-label-focus"), { once: true });
    target.focus({ preventScroll: true });
  };
  const [switchChecked, setSwitchChecked] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [toggleValues, setToggleValues] = useState<string[]>(hasValues ? ["bold"] : []);
  const [datePickerValue, setDatePickerValue] = useState<string | undefined>(hasValues ? "2025-06-15" : undefined);
  const [dateRangeValue, setDateRangeValue] = useState<{ start: Date; end: Date } | null>(
    hasValues ? { start: new Date(2025, 5, 1), end: new Date(2025, 5, 15) } : null
  );

  return (
    <>
      <DatePicker
        label={label ? t`Date picker` : undefined}
        tooltip={tooltip ? tooltips.datePicker : undefined}
        name={`datepicker-${suffix}`}
        placeholder={placeholders ? t`Pick a date` : undefined}
        startIcon={showIcon ? undefined : null}
        value={datePickerValue}
        onChange={setDatePickerValue}
        isDisabled={disabled}
        isReadOnly={readOnly}
        errorMessage={errorMessage}
      />
      <DateRangePicker
        label={label ? t`Date range` : undefined}
        tooltip={tooltip ? tooltips.dateRange : undefined}
        name={`daterange-${suffix}`}
        placeholder={placeholders ? undefined : ""}
        startIcon={showIcon ? undefined : null}
        value={dateRangeValue}
        onChange={setDateRangeValue}
        disabled={disabled}
        isReadOnly={readOnly}
        errorMessage={errorMessage}
      />
      <DateField
        label={label ? t`Native date` : undefined}
        tooltip={tooltip ? tooltips.dateField : undefined}
        name={`datefield-${suffix}`}
        defaultValue={hasValues ? "2025-06-15" : undefined}
        isDisabled={disabled}
        isReadOnly={readOnly}
        errorMessage={errorMessage}
      />
      <TimeField
        label={label ? t`Native time` : undefined}
        tooltip={tooltip ? tooltips.timeField : undefined}
        name={`time-${suffix}`}
        defaultValue={hasValues ? "14:30" : undefined}
        isDisabled={disabled}
        isReadOnly={readOnly}
        errorMessage={errorMessage}
      />
      <TextAreaFields {...{ suffix, label, tooltip, disabled, readOnly, hasValues, placeholders, errorMessage }} />
      <InlineFieldGroup alignWithLabel={label}>
        <SwitchField
          label={t`Switch`}
          tooltip={tooltip ? tooltips.switchField : undefined}
          name={`switch-${suffix}`}
          checked={hasValues ? true : switchChecked}
          onCheckedChange={setSwitchChecked}
          disabled={disabled}
          isReadOnly={readOnly}
          errorMessage={errorMessage}
        />
      </InlineFieldGroup>
      <InlineFieldGroup alignWithLabel={label}>
        <CheckboxField
          label={t`Checkbox`}
          tooltip={tooltip ? tooltips.checkboxField : undefined}
          name={`checkbox-${suffix}`}
          checked={hasValues ? true : checkboxChecked}
          onCheckedChange={setCheckboxChecked}
          disabled={disabled}
          isReadOnly={readOnly}
          errorMessage={errorMessage}
        />
      </InlineFieldGroup>
      <RadioGroupField
        label={label ? t`Radio group` : undefined}
        tooltip={tooltip ? tooltips.radioGroup : undefined}
        name={`radio-${suffix}`}
        defaultValue={hasValues ? "option-a" : undefined}
        disabled={disabled}
        isReadOnly={readOnly}
        errorMessage={errorMessage}
      >
        <label htmlFor={`radio-${suffix}-a`} className="flex items-center gap-2">
          <RadioGroupItem id={`radio-${suffix}-a`} value="option-a" />
          <Trans>Option A</Trans>
        </label>
        <label htmlFor={`radio-${suffix}-b`} className="flex items-center gap-2">
          <RadioGroupItem id={`radio-${suffix}-b`} value="option-b" />
          <Trans>Option B</Trans>
        </label>
      </RadioGroupField>
      <Field ref={toggleGroupRef}>
        {label && (
          <FieldLabel
            onClick={focusToggle}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                focusToggle();
              }
            }}
          >
            {tooltip ? (
              <LabelWithTooltip tooltip={tooltips.toggleGroup}>
                <Trans>Toggle group</Trans>
              </LabelWithTooltip>
            ) : (
              <Trans>Toggle group</Trans>
            )}
          </FieldLabel>
        )}
        <ToggleGroup
          variant="outline"
          value={toggleValues}
          onValueChange={setToggleValues}
          disabled={disabled}
          isReadOnly={readOnly}
        >
          <ToggleGroupItem value="bold" aria-label={t`Toggle bold`}>
            <BoldIcon />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label={t`Toggle italic`}>
            <ItalicIcon />
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label={t`Toggle underline`}>
            <UnderlineIcon />
          </ToggleGroupItem>
        </ToggleGroup>
      </Field>
    </>
  );
}
