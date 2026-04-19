import { Trans } from "@lingui/react/macro";
import { Calendar } from "@repo/ui/components/Calendar";
import { useState } from "react";

// Demonstrates the standalone Calendar component used inline (without the DatePicker popover
// wrapper). Useful when the date selection is the primary action of a screen instead of being
// tucked inside a form.
export function InlineCalendarPreview() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => new Date());

  return (
    <div className="flex flex-col gap-2">
      <h4>
        <Trans>Inline calendar</Trans>
      </h4>
      <div className="flex flex-wrap gap-4">
        <div className="rounded-md border">
          <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} numberOfMonths={1} />
        </div>
        <div className="rounded-md border">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            numberOfMonths={1}
            showWeekNumber
          />
        </div>
      </div>
    </div>
  );
}
