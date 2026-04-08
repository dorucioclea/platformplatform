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
import { TimeZonePicker } from "@repo/ui/components/TimeZonePicker";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/ToggleGroup";
import { BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-react";
import { useState } from "react";

import type { ControlRowDerivedProps } from "./controlRowTypes";

import { tooltips } from "./controlTooltips";

export function DateAndToggleFields({
  suffix,
  label,
  tooltip,
  disabled,
  readOnly,
  hasValues,
  errorMessage
}: ControlRowDerivedProps) {
  const [switchChecked, setSwitchChecked] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [toggleValues, setToggleValues] = useState<string[]>(hasValues ? ["bold"] : []);
  const [datePickerValue, setDatePickerValue] = useState<string | undefined>(hasValues ? "2025-06-15" : undefined);
  const [dateRangeValue, setDateRangeValue] = useState<{ start: Date; end: Date } | null>(
    hasValues ? { start: new Date(2025, 5, 1), end: new Date(2025, 5, 15) } : null
  );
  const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [timeZone, setTimeZone] = useState<string | null>(hasValues ? browserTimeZone : null);

  return (
    <>
      <DatePicker
        label={label ? t`Date picker` : undefined}
        tooltip={tooltip ? tooltips.datePicker : undefined}
        name={`datepicker-${suffix}`}
        placeholder={t`Pick a date`}
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
      <TimeZonePicker
        label={label ? t`Time zone` : undefined}
        tooltip={tooltip ? tooltips.timeZonePicker : undefined}
        name={`timezone-${suffix}`}
        value={timeZone}
        onValueChange={setTimeZone}
        isDisabled={disabled}
        isReadOnly={readOnly}
        errorMessage={errorMessage}
      />
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
        {hasValues && !disabled && !readOnly && (
          <SwitchField label={t`Switch (off)`} name={`switch-off-${suffix}`} checked={false} />
        )}
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
        {hasValues && !disabled && !readOnly && (
          <CheckboxField label={t`Checkbox (off)`} name={`checkbox-off-${suffix}`} checked={false} />
        )}
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
      <Field>
        {label && (
          <FieldLabel>
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
