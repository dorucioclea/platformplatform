import type { DateRangeValue } from "@repo/ui/components/DateRangePicker";

import { t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { Button } from "@repo/ui/components/Button";
import { DatePicker } from "@repo/ui/components/DatePicker";
import { DateRangePicker } from "@repo/ui/components/DateRangePicker";
import { DialogBody, DialogFooter } from "@repo/ui/components/Dialog";
import { Form } from "@repo/ui/components/Form";
import { TextAreaField } from "@repo/ui/components/TextAreaField";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

interface ScheduleNotesStepProps {
  simulateErrors: boolean;
  birthday: string | undefined;
  onBirthdayChange: (value: string) => void;
  availability: DateRangeValue | null;
  onAvailabilityChange: (value: DateRangeValue | null) => void;
  onBack: () => void;
  onNext: () => void;
  onChange: () => void;
}

export function ScheduleNotesStep({
  simulateErrors,
  birthday,
  onBirthdayChange,
  availability,
  onAvailabilityChange,
  onBack,
  onNext,
  onChange
}: Readonly<ScheduleNotesStepProps>) {
  const { i18n } = useLingui();

  return (
    <Form className="flex min-h-0 flex-1 flex-col">
      <DialogBody>
        <div className="grid grid-cols-2 gap-4">
          <DatePicker
            name="birthday"
            label={t`Birthday`}
            placeholder={t`Pick a date`}
            value={birthday}
            errorMessage={simulateErrors ? t`Birthday must be in the past` : undefined}
            onChange={(v) => {
              onBirthdayChange(v);
              onChange();
            }}
            locale={i18n.locale}
          />
          <DateRangePicker
            name="availability"
            label={t`Availability`}
            value={availability}
            onChange={(v) => {
              onAvailabilityChange(v);
              onChange();
            }}
          />
          <TextAreaField
            autoFocus
            name="notes"
            label={t`Notes`}
            defaultValue="Met at conference in March."
            placeholder={t`Add notes about this contact`}
            className="col-span-2"
            onChange={onChange}
          />
        </div>
      </DialogBody>
      <DialogFooter>
        <Button type="button" variant="secondary" onClick={onBack}>
          <ChevronLeftIcon />
          <Trans>Back</Trans>
        </Button>
        <Button type="button" onClick={onNext}>
          <Trans>Next</Trans>
          <ChevronRightIcon />
        </Button>
      </DialogFooter>
    </Form>
  );
}
