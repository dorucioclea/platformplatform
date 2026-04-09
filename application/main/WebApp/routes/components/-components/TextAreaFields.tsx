import { t } from "@lingui/core/macro";
import { TextAreaField } from "@repo/ui/components/TextAreaField";

import type { ControlRowDerivedProps } from "./controlRowTypes";

import { tooltips } from "./controlTooltips";

export function TextAreaFields({
  suffix,
  label,
  tooltip,
  disabled,
  readOnly,
  hasValues,
  errorMessage
}: ControlRowDerivedProps) {
  return (
    <>
      <TextAreaField
        label={label ? t`Text area` : undefined}
        tooltip={tooltip ? tooltips.textArea : undefined}
        name={`textarea-${suffix}`}
        placeholder={t`Add notes here`}
        defaultValue={hasValues ? t`Meeting notes from last week` : undefined}
        isDisabled={disabled}
        isReadOnly={readOnly}
        errorMessage={errorMessage}
      />
      <TextAreaField
        label={label ? t`Address (fixed 2 lines)` : undefined}
        tooltip={tooltip ? tooltips.textAreaFixed : undefined}
        name={`textarea-fixed-${suffix}`}
        placeholder={t`Street address`}
        defaultValue={hasValues ? t`1 Infinite Loop\nCupertino, CA 95014` : undefined}
        lines={2}
        resizable={false}
        isDisabled={disabled}
        isReadOnly={readOnly}
        errorMessage={errorMessage}
      />
    </>
  );
}
