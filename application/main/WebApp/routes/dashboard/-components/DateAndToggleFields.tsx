import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { CheckboxField } from "@repo/ui/components/CheckboxField";
import { DateField } from "@repo/ui/components/DateField";
import { DatePicker } from "@repo/ui/components/DatePicker";
import { DateRangePicker } from "@repo/ui/components/DateRangePicker";
import { RadioGroupItem } from "@repo/ui/components/RadioGroup";
import { RadioGroupField } from "@repo/ui/components/RadioGroupField";
import { SwitchField } from "@repo/ui/components/SwitchField";
import { TimeField } from "@repo/ui/components/TimeField";
import { useState } from "react";

import type { ControlRowDerivedProps } from "./controlRowTypes";

export function DateAndToggleFields({
  suffix,
  label,
  disabled,
  readOnly,
  hasValues,
  tooltipText,
  errorMessage
}: ControlRowDerivedProps) {
  const [switchChecked, setSwitchChecked] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [datePickerValue, setDatePickerValue] = useState<string | undefined>(hasValues ? "2025-06-15" : undefined);
  const [dateRangeValue, setDateRangeValue] = useState<{ start: Date; end: Date } | null>(
    hasValues ? { start: new Date(2025, 5, 1), end: new Date(2025, 5, 15) } : null
  );

  return (
    <>
      <DateField
        label={label ? t`Native date` : undefined}
        tooltip={tooltipText}
        name={`datefield-${suffix}`}
        defaultValue={hasValues ? "2025-06-15" : undefined}
        isDisabled={disabled}
        isReadOnly={readOnly}
        errorMessage={errorMessage}
      />
      <DatePicker
        label={label ? t`Date picker` : undefined}
        tooltip={tooltipText}
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
        tooltip={tooltipText}
        name={`daterange-${suffix}`}
        value={dateRangeValue}
        onChange={setDateRangeValue}
        disabled={disabled}
        isReadOnly={readOnly}
        errorMessage={errorMessage}
      />
      <TimeField
        label={label ? t`Native time` : undefined}
        tooltip={tooltipText}
        name={`time-${suffix}`}
        defaultValue={hasValues ? "14:30" : undefined}
        isDisabled={disabled}
        isReadOnly={readOnly}
        errorMessage={errorMessage}
      />
      <div className="flex flex-wrap gap-x-6 gap-y-2 self-start">
        <SwitchField
          label={label ? (hasValues ? t`Switch (on)` : t`Switch`) : undefined}
          tooltip={tooltipText}
          name={`switch-${suffix}`}
          checked={hasValues ? true : switchChecked}
          onCheckedChange={setSwitchChecked}
          disabled={disabled}
          isReadOnly={readOnly}
          errorMessage={errorMessage}
          alignWithLabel={label}
        />
        {hasValues && (
          <SwitchField
            label={label ? t`Switch (off)` : undefined}
            name={`switch-off-${suffix}`}
            checked={false}
            disabled={disabled}
            isReadOnly={readOnly}
          />
        )}
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 self-start">
        <CheckboxField
          label={label ? (hasValues ? t`Checkbox (on)` : t`Checkbox`) : undefined}
          tooltip={tooltipText}
          name={`checkbox-${suffix}`}
          checked={hasValues ? true : checkboxChecked}
          onCheckedChange={setCheckboxChecked}
          disabled={disabled}
          isReadOnly={readOnly}
          errorMessage={errorMessage}
          alignWithLabel={label}
        />
        {hasValues && (
          <CheckboxField
            label={label ? t`Checkbox (off)` : undefined}
            name={`checkbox-off-${suffix}`}
            checked={false}
            disabled={disabled}
            isReadOnly={readOnly}
          />
        )}
      </div>
      <RadioGroupField
        label={label ? t`Radio group` : undefined}
        tooltip={tooltipText}
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
    </>
  );
}
