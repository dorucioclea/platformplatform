import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Calendar } from "@repo/ui/components/Calendar";
import { FieldError } from "@repo/ui/components/Field";
import { LabelWithTooltip } from "@repo/ui/components/LabelWithTooltip";
import { useFieldError } from "@repo/ui/hooks/useFieldError";
import { useState } from "react";

import { Prop, PropList, PropNote } from "./PropTooltip";

interface InlineCalendarPreviewProps {
  label?: boolean;
  tooltip?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
}

const inlineCalendarTooltip = (
  <PropList title="Calendar" description="Standalone calendar widget rendered inline">
    <Prop name="mode">"single" / "multiple" / "range"</Prop>
    <Prop name="selected / onSelect">Controlled selection</Prop>
    <PropNote>
      Use the bare Calendar (without DatePicker) when the date selection is the primary action of a screen.
    </PropNote>
  </PropList>
);

const inlineCalendarWithWeekNumbersTooltip = (
  <PropList title="Calendar with week numbers" description="Same Calendar plus the showWeekNumber prop">
    <Prop name="showWeekNumber">Renders an ISO week-number column on the left of the grid</Prop>
    <PropNote>Useful in scheduling/HR contexts where users navigate by week number.</PropNote>
  </PropList>
);

export function InlineCalendarPreview({
  label,
  tooltip,
  disabled,
  readOnly,
  error
}: Readonly<InlineCalendarPreviewProps>) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => new Date());

  const { errors, clearNow } = useFieldError({
    errorMessage: error ? t`This field is required` : undefined
  });
  const isInvalid = !!errors;

  // Keep the Calendar strictly controlled in readOnly mode -- pass an onSelect that ignores the
  // call rather than omitting it, otherwise react-day-picker falls back to uncontrolled selection
  // and the visual state changes despite readOnly.
  const handleSelect = (date: Date | undefined) => {
    if (readOnly) {
      return;
    }
    clearNow();
    setSelectedDate(date);
  };

  return (
    <div className="flex flex-col gap-2">
      <h4>
        <Trans>Inline calendar</Trans>
      </h4>
      <div className="flex flex-wrap gap-6">
        <div className="flex flex-col gap-3">
          {label && (
            <div className="flex items-center gap-1 text-sm leading-snug font-medium">
              <LabelWithTooltip tooltip={tooltip ? inlineCalendarTooltip : undefined}>
                <Trans>Calendar</Trans>
              </LabelWithTooltip>
            </div>
          )}
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            numberOfMonths={1}
            aria-invalid={isInvalid}
            aria-disabled={disabled}
          />
          <FieldError errors={errors} />
        </div>
        <div className="flex flex-col gap-3">
          {label && (
            <div className="flex items-center gap-1 text-sm leading-snug font-medium">
              <LabelWithTooltip tooltip={tooltip ? inlineCalendarWithWeekNumbersTooltip : undefined}>
                <Trans>Calendar with week numbers</Trans>
              </LabelWithTooltip>
            </div>
          )}
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            numberOfMonths={1}
            showWeekNumber
            aria-invalid={isInvalid}
            aria-disabled={disabled}
          />
          <FieldError errors={errors} />
        </div>
      </div>
    </div>
  );
}
