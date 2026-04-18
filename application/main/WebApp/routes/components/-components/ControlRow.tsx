import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Field, FieldError, FieldLabel } from "@repo/ui/components/Field";
import { InputOtp, InputOtpGroup, InputOtpSlot } from "@repo/ui/components/InputOtp";
import { LabelWithTooltip } from "@repo/ui/components/LabelWithTooltip";
import { NumberField } from "@repo/ui/components/NumberField";
import { TextField } from "@repo/ui/components/TextField";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { EuroIcon, HashIcon, SearchIcon } from "lucide-react";
import { useState } from "react";

import type { ControlRowProps } from "./controlRowTypes";

import { tooltips } from "./controlTooltips";
import { DateAndToggleFields } from "./DateAndToggleFields";
import { SelectAndComboboxFields } from "./SelectAndComboboxFields";

export function ControlRow({
  suffix,
  label,
  tooltip,
  disabled,
  readOnly,
  error,
  showIcon,
  values,
  placeholders
}: ControlRowProps) {
  const hasValues = !!values;
  const errorMessage = error ? t`This field is required` : undefined;
  const [otpValue, setOtpValue] = useState(hasValues ? "123456" : "");
  const derived = {
    suffix,
    label,
    tooltip,
    disabled,
    readOnly,
    error,
    showIcon,
    hasValues,
    placeholders,
    errorMessage
  };

  return (
    <div
      key={String(hasValues)}
      className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
    >
      <TextField
        label={label ? t`Text field` : undefined}
        tooltip={tooltip ? tooltips.textField : undefined}
        name={`text-${suffix}`}
        placeholder={placeholders ? t`E.g., Alex Taylor` : undefined}
        defaultValue={hasValues ? t`Alex Taylor` : undefined}
        disabled={disabled}
        readOnly={readOnly}
        errorMessage={errorMessage}
        startIcon={showIcon ? <SearchIcon /> : undefined}
      />
      <NumberField
        label={label ? t`Number (integer)` : undefined}
        tooltip={tooltip ? tooltips.numberInteger : undefined}
        name={`integer-${suffix}`}
        defaultValue={hasValues ? 42 : undefined}
        minValue={0}
        maxValue={100}
        step={1}
        allowEmpty
        disabled={disabled}
        readOnly={readOnly}
        errorMessage={errorMessage}
        startIcon={showIcon ? <HashIcon /> : undefined}
      />
      <NumberField
        label={label ? t`Number (decimal)` : undefined}
        tooltip={tooltip ? tooltips.numberDecimal : undefined}
        name={`decimal-${suffix}`}
        defaultValue={hasValues ? 149.95 : undefined}
        minValue={0}
        maxValue={999.99}
        step={0.1}
        decimalPlaces={2}
        allowEmpty
        disabled={disabled}
        readOnly={readOnly}
        errorMessage={errorMessage}
        startIcon={showIcon ? <EuroIcon /> : undefined}
      />
      <SelectAndComboboxFields {...derived} />
      <DateAndToggleFields {...derived} />
      <Field data-invalid={error || undefined}>
        {label && (
          <FieldLabel htmlFor={`otp-${suffix}`}>
            {tooltip ? (
              <LabelWithTooltip tooltip={tooltips.inputOtp}>
                <Trans>One-time code</Trans>
              </LabelWithTooltip>
            ) : (
              <Trans>One-time code</Trans>
            )}
          </FieldLabel>
        )}
        <InputOtp
          id={`otp-${suffix}`}
          maxLength={6}
          value={otpValue}
          onChange={setOtpValue}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={error || undefined}
          aria-label={t`One-time code`}
          pattern={REGEXP_ONLY_DIGITS}
          autoComplete="one-time-code"
        >
          <InputOtpGroup>
            {Array.from({ length: 6 }).map((_, index) => (
              <InputOtpSlot key={index} index={index} className="size-14" aria-invalid={error || undefined} />
            ))}
          </InputOtpGroup>
        </InputOtp>
        {error && <FieldError errors={[{ message: errorMessage }]} />}
      </Field>
    </div>
  );
}
