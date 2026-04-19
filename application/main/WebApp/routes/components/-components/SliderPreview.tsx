import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { FieldError } from "@repo/ui/components/Field";
import { LabelWithTooltip } from "@repo/ui/components/LabelWithTooltip";
import { Slider } from "@repo/ui/components/Slider";
import { cn } from "@repo/ui/utils";
import { useState } from "react";

import { Prop, PropList } from "./PropTooltip";

interface SliderPreviewProps {
  label?: boolean;
  tooltip?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
}

const sliderTooltip = (
  <PropList title="Slider" description="Pointer-and-keyboard numeric input">
    <Prop name="defaultValue">Array, e.g. [40] for single value or [20, 80] for a range</Prop>
    <Prop name="min / max">Bounds (defaults 0 and 100)</Prop>
    <Prop name="step">Increment between selectable values</Prop>
    <Prop name="disabled">Greyed out, not interactive</Prop>
  </PropList>
);

const rangeTooltip = (
  <PropList title="Slider (range)" description="Two thumbs select a numeric interval">
    <Prop name="defaultValue">Two-element array, e.g. [20, 80]</Prop>
  </PropList>
);

export function SliderPreview({ label, tooltip, disabled, readOnly, error }: Readonly<SliderPreviewProps>) {
  const [singleValue, setSingleValue] = useState<number[]>([35]);
  const [rangeValue, setRangeValue] = useState<number[]>([20, 80]);

  const errorMessage = error ? t`This field is required` : undefined;

  // Slider has no native readOnly, so block change while still rendering enabled visuals
  const guardedSingle = (next: number | readonly number[]) => {
    if (readOnly) return;
    setSingleValue(Array.isArray(next) ? [...next] : [next as number]);
  };
  const guardedRange = (next: number | readonly number[]) => {
    if (readOnly) return;
    setRangeValue(Array.isArray(next) ? [...next] : [next as number]);
  };

  const wrapperClasses = cn(
    "flex flex-col gap-2 rounded-md p-2",
    error && "outline-2 outline-offset-2 outline-destructive"
  );

  return (
    <section className="flex flex-col gap-3 pt-8">
      <h3>
        <Trans>Slider</Trans>
      </h3>
      <div className="grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
        <div className={wrapperClasses}>
          {label && (
            <LabelWithTooltip tooltip={tooltip ? sliderTooltip : undefined}>
              <Trans>Volume</Trans>
            </LabelWithTooltip>
          )}
          <Slider value={singleValue} onValueChange={guardedSingle} disabled={disabled} aria-invalid={error} />
          {error && <FieldError errors={errorMessage ? [{ message: errorMessage }] : undefined} />}
        </div>
        <div className={wrapperClasses}>
          {label && (
            <LabelWithTooltip tooltip={tooltip ? rangeTooltip : undefined}>
              <Trans>Price range</Trans>
            </LabelWithTooltip>
          )}
          <Slider value={rangeValue} onValueChange={guardedRange} disabled={disabled} aria-invalid={error} />
          {error && <FieldError errors={errorMessage ? [{ message: errorMessage }] : undefined} />}
        </div>
      </div>
    </section>
  );
}
