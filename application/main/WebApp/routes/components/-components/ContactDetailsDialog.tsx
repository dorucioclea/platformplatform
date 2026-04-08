import type { DateRangeValue } from "@repo/ui/components/DateRangePicker";

import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@repo/ui/components/Dialog";
import { DirtyDialog } from "@repo/ui/components/DirtyDialog";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { ContactInfoStep } from "./ContactInfoStep";
import { RolePreferencesStep } from "./RolePreferencesStep";
import { ScheduleNotesStep } from "./ScheduleNotesStep";

const TOTAL_STEPS = 3;

function StepIndicator({ current, total }: Readonly<{ current: number; total: number }>) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all ${i <= current ? "w-6 bg-primary" : "w-4 bg-muted"}`}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">
        {current + 1} / {total}
      </span>
    </div>
  );
}

const stepTitles = () => [t`Contact info`, t`Schedule & notes`, t`Role & preferences`];
const stepDescriptions = () => [
  t`Basic contact information and profile photo.`,
  t`Dates and additional notes about this contact.`,
  t`Set the contact's role and communication preferences.`
];

export interface ContactDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  dirtyDialog: boolean;
  showToasts: boolean;
  simulateErrors: boolean;
}

export function ContactDetailsDialog({
  isOpen,
  onOpenChange,
  dirtyDialog,
  showToasts,
  simulateErrors
}: Readonly<ContactDetailsDialogProps>) {
  const [step, setStep] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [birthday, setBirthday] = useState<string | undefined>(undefined);
  const [availability, setAvailability] = useState<DateRangeValue | null>(null);

  const mutation = useMutation({
    mutationFn: async (_data: { body?: unknown }) => {
      await new Promise<void>((resolve) => setTimeout(resolve, 500));
    },
    onSuccess: () => {
      setIsDirty(false);
      onOpenChange(false);
      if (showToasts) toast.success(t`Contact details saved`);
    }
  });

  const markDirty = () => setIsDirty(true);
  const handleCloseComplete = () => {
    setStep(0);
    setIsDirty(false);
    mutation.reset();
  };

  const titles = stepTitles();
  const descriptions = stepDescriptions();

  return (
    <DirtyDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      hasUnsavedChanges={dirtyDialog && isDirty}
      unsavedChangesTitle={t`Unsaved changes`}
      unsavedChangesMessage={<Trans>You have unsaved changes. If you leave now, your changes will be lost.</Trans>}
      leaveLabel={t`Leave`}
      stayLabel={t`Stay`}
      onCloseComplete={handleCloseComplete}
      trackingTitle="Edit contact"
    >
      <DialogContent className="sm:w-dialog-md">
        <DialogHeader>
          <StepIndicator current={step} total={TOTAL_STEPS} />
          <DialogTitle>{titles[step]}</DialogTitle>
          <DialogDescription>{descriptions[step]}</DialogDescription>
        </DialogHeader>
        {step === 0 && (
          <ContactInfoStep
            simulateErrors={simulateErrors}
            onNext={() => setStep(1)}
            onCancel={() => onOpenChange(false)}
            onChange={markDirty}
          />
        )}
        {step === 1 && (
          <ScheduleNotesStep
            simulateErrors={simulateErrors}
            birthday={birthday}
            onBirthdayChange={setBirthday}
            availability={availability}
            onAvailabilityChange={setAvailability}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
            onChange={markDirty}
          />
        )}
        {step === 2 && <RolePreferencesStep mutation={mutation} onBack={() => setStep(1)} onChange={markDirty} />}
      </DialogContent>
    </DirtyDialog>
  );
}
