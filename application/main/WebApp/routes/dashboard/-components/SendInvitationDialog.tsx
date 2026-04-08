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
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/Select";
import { SelectField } from "@repo/ui/components/SelectField";
import { TextField } from "@repo/ui/components/TextField";
import { mutationSubmitter } from "@repo/ui/forms/mutationSubmitter";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface SendInvitationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SendInvitationDialog({ isOpen, onOpenChange }: Readonly<SendInvitationDialogProps>) {
  const mutation = useMutation({
    mutationFn: async (_data: { body?: unknown }) => {
      await new Promise<void>((resolve) => setTimeout(resolve, 600));
    },
    onSuccess: () => {
      onOpenChange(false);
      toast.success(t`Invitation sent`);
    }
  });

  return (
    <DirtyDialog open={isOpen} onOpenChange={onOpenChange} hasUnsavedChanges={false} trackingTitle="Send invitation">
      <DialogContent className="sm:w-dialog-md">
        <DialogHeader>
          <DialogTitle>
            <Trans>Send invitation</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>Invite a new member to join your workspace.</Trans>
          </DialogDescription>
        </DialogHeader>
        <Form onSubmit={mutationSubmitter(mutation)} className="flex min-h-0 flex-1 flex-col">
          <DialogBody>
            <div className="flex flex-col gap-4">
              <TextField
                autoFocus
                name="email"
                label={t`Email address`}
                type="email"
                placeholder={t`colleague@company.com`}
                isRequired
              />
              <SelectField name="role" label={t`Role`} defaultValue="member">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">
                    <Trans>Owner</Trans>
                  </SelectItem>
                  <SelectItem value="admin">
                    <Trans>Admin</Trans>
                  </SelectItem>
                  <SelectItem value="member">
                    <Trans>Member</Trans>
                  </SelectItem>
                </SelectContent>
              </SelectField>
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
