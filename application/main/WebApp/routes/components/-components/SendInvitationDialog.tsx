import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Button } from "@repo/ui/components/Button";
import { CheckboxField } from "@repo/ui/components/CheckboxField";
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
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "@repo/ui/components/Field";
import { Form } from "@repo/ui/components/Form";
import { InlineFieldGroup } from "@repo/ui/components/InlineFieldGroup";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/RadioGroup";
import { TextField } from "@repo/ui/components/TextField";
import { mutationSubmitter } from "@repo/ui/forms/mutationSubmitter";
import { useMutation } from "@tanstack/react-query";
import { MailIcon, ShieldIcon, UserIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { type DialogSize, getDialogSizeClassName } from "./dialogSize";

export interface SendInvitationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  dirtyDialog: boolean;
  showToasts: boolean;
  simulateErrors: boolean;
  size: DialogSize;
}

export function SendInvitationDialog({
  isOpen,
  onOpenChange,
  dirtyDialog,
  showToasts,
  simulateErrors,
  size
}: Readonly<SendInvitationDialogProps>) {
  const [isDirty, setIsDirty] = useState(false);

  const mutation = useMutation({
    mutationFn: async (_data: { body?: unknown }) => {
      await new Promise<void>((resolve) => setTimeout(resolve, 500));
    },
    onSuccess: () => {
      setIsDirty(false);
      onOpenChange(false);
      if (showToasts) toast.success(t`Invitation sent`);
    }
  });

  const markDirty = () => setIsDirty(true);

  return (
    <DirtyDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      hasUnsavedChanges={dirtyDialog && isDirty}
      trackingTitle="Send invitation"
    >
      <DialogContent className={getDialogSizeClassName(size)}>
        <DialogHeader>
          <DialogTitle>
            <Trans>Send invitation</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>Invite a new member to join your workspace.</Trans>
          </DialogDescription>
        </DialogHeader>
        <Form
          onSubmit={mutationSubmitter(mutation)}
          validationErrors={simulateErrors ? { email: [t`Please enter a valid email address`] } : undefined}
          className="flex min-h-0 flex-1 flex-col"
        >
          <DialogBody>
            <div className="flex flex-col gap-6">
              <TextField
                autoFocus
                name="email"
                label={t`Email address`}
                type="email"
                placeholder={t`colleague@company.com`}
                onChange={markDirty}
              />
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">
                  <Trans>Role</Trans>
                </p>
                <RadioGroup defaultValue="member" onValueChange={markDirty}>
                  <FieldLabel>
                    <Field orientation="horizontal">
                      <RadioGroupItem value="owner" />
                      <FieldContent>
                        <FieldTitle>
                          <ShieldIcon />
                          <Trans>Owner</Trans>
                        </FieldTitle>
                        <FieldDescription>
                          <Trans>Full access including user roles and account settings</Trans>
                        </FieldDescription>
                      </FieldContent>
                    </Field>
                  </FieldLabel>
                  <FieldLabel>
                    <Field orientation="horizontal">
                      <RadioGroupItem value="admin" />
                      <FieldContent>
                        <FieldTitle>
                          <UserIcon />
                          <Trans>Admin</Trans>
                        </FieldTitle>
                        <FieldDescription>
                          <Trans>Full access except changing user roles and account settings</Trans>
                        </FieldDescription>
                      </FieldContent>
                    </Field>
                  </FieldLabel>
                  <FieldLabel>
                    <Field orientation="horizontal">
                      <RadioGroupItem value="member" />
                      <FieldContent>
                        <FieldTitle>
                          <MailIcon />
                          <Trans>Member</Trans>
                        </FieldTitle>
                        <FieldDescription>
                          <Trans>Standard user access</Trans>
                        </FieldDescription>
                      </FieldContent>
                    </Field>
                  </FieldLabel>
                </RadioGroup>
              </div>
              <InlineFieldGroup>
                <CheckboxField name="notify" label={t`Send welcome email`} defaultChecked onCheckedChange={markDirty} />
              </InlineFieldGroup>
            </div>
          </DialogBody>
          <DialogFooter>
            <DialogClose render={<Button type="reset" variant="secondary" disabled={mutation.isPending} />}>
              <Trans>Cancel</Trans>
            </DialogClose>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <Trans>Sending...</Trans> : <Trans>Send invitation</Trans>}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </DirtyDialog>
  );
}
