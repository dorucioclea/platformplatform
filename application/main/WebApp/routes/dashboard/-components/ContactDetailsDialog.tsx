import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Button } from "@repo/ui/components/Button";
import {
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@repo/ui/components/Dialog";
import { DirtyDialog } from "@repo/ui/components/DirtyDialog";
import { Form } from "@repo/ui/components/Form";
import { TextAreaField } from "@repo/ui/components/TextAreaField";
import { TextField } from "@repo/ui/components/TextField";
import { mutationSubmitter } from "@repo/ui/forms/mutationSubmitter";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

interface ContactDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactDetailsDialog({ isOpen, onOpenChange }: Readonly<ContactDetailsDialogProps>) {
  const [isDirty, setIsDirty] = useState(false);

  const mutation = useMutation({
    mutationFn: async (_data: { body?: unknown }) => {
      await new Promise<void>((resolve) => setTimeout(resolve, 800));
    },
    onSuccess: () => {
      setIsDirty(false);
      onOpenChange(false);
      toast.success(t`Contact details saved`);
    }
  });

  const markDirty = () => setIsDirty(true);
  const handleCloseComplete = () => {
    setIsDirty(false);
    mutation.reset();
  };

  return (
    <DirtyDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      hasUnsavedChanges={isDirty}
      unsavedChangesTitle={t`Unsaved changes`}
      unsavedChangesMessage={<Trans>You have unsaved changes. If you leave now, your changes will be lost.</Trans>}
      leaveLabel={t`Leave`}
      stayLabel={t`Stay`}
      onCloseComplete={handleCloseComplete}
      trackingTitle="Edit contact"
    >
      <DialogContent className="sm:w-dialog-lg">
        <DialogHeader>
          <DialogTitle>
            <Trans>Edit contact</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>Update the contact details. Changes will be saved immediately.</Trans>
          </DialogDescription>
        </DialogHeader>
        <Form
          onSubmit={mutationSubmitter(mutation)}
          validationErrors={
            mutation.error instanceof Error
              ? undefined
              : (mutation.error as { errors?: Record<string, string[]> } | null)?.errors
          }
          className="flex min-h-0 flex-1 flex-col"
        >
          <DialogBody>
            <div className="grid grid-cols-2 gap-4">
              <TextField
                autoFocus
                name="firstName"
                label={t`First name`}
                defaultValue="Alex"
                placeholder={t`E.g., Alex`}
                onChange={markDirty}
              />
              <TextField
                name="lastName"
                label={t`Last name`}
                defaultValue="Taylor"
                placeholder={t`E.g., Taylor`}
                onChange={markDirty}
              />
              <TextField
                name="email"
                label={t`Email`}
                type="email"
                defaultValue="alex.taylor@example.com"
                placeholder={t`email@example.com`}
                className="col-span-2"
                onChange={markDirty}
              />
              <TextField
                name="phone"
                label={t`Phone number`}
                type="tel"
                defaultValue="+1 555 123 4567"
                placeholder={t`+1 555 000 0000`}
                onChange={markDirty}
              />
              <TextField
                name="company"
                label={t`Company`}
                defaultValue="Acme Corp"
                placeholder={t`Company name`}
                onChange={markDirty}
              />
              <TextAreaField
                name="notes"
                label={t`Notes`}
                defaultValue="Met at conference in March."
                placeholder={t`Add notes about this contact`}
                className="col-span-2"
                onChange={markDirty}
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <DialogClose render={<Button type="reset" variant="secondary" disabled={mutation.isPending} />}>
              <Trans>Cancel</Trans>
            </DialogClose>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <Trans>Saving...</Trans> : <Trans>Save changes</Trans>}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </DirtyDialog>
  );
}
