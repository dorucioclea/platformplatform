import { Trans } from "@lingui/react/macro";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@repo/ui/components/AlertDialog";
import { Button } from "@repo/ui/components/Button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@repo/ui/components/Dialog";
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "@repo/ui/components/Field";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/RadioGroup";
import { MailIcon, ShieldIcon, TrashIcon, UserIcon } from "lucide-react";

import { CardsPreview } from "./CardsPreview";

export function DialogsPreview() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h4>
          <Trans>Dialogs</Trans>
        </h4>
        <div className="flex flex-wrap items-center gap-3">
          <Dialog trackingTitle="Sample dialog">
            <DialogTrigger render={<Button variant="outline" />}>
              <Trans>Open dialog</Trans>
            </DialogTrigger>
            <DialogContent className="sm:w-dialog-md">
              <DialogHeader>
                <DialogTitle>
                  <Trans>Sample dialog</Trans>
                </DialogTitle>
              </DialogHeader>
              <DialogBody>
                <p>
                  <Trans>This is a sample dialog with a header, body, and footer.</Trans>
                </p>
              </DialogBody>
              <DialogFooter>
                <DialogClose render={<Button type="reset" variant="secondary" />}>
                  <Trans>Cancel</Trans>
                </DialogClose>
                <Button>
                  <Trans>Save changes</Trans>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog trackingTitle="Delete item">
            <AlertDialogTrigger render={<Button variant="destructive" />}>
              <TrashIcon />
              <Trans>Delete item</Trans>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  <Trans>Are you sure?</Trans>
                </AlertDialogTitle>
                <AlertDialogDescription>
                  <Trans>This action cannot be undone. This will permanently delete the item.</Trans>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogBody />
              <AlertDialogFooter>
                <AlertDialogCancel>
                  <Trans>Cancel</Trans>
                </AlertDialogCancel>
                <AlertDialogAction render={<Button variant="destructive" />}>
                  <Trans>Delete</Trans>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h4>
          <Trans>Radio card selector</Trans>
        </h4>
        <RadioGroup defaultValue="member">
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

      <CardsPreview />
    </div>
  );
}
