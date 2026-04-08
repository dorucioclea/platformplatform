import { t } from "@lingui/core/macro";
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
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@repo/ui/components/AlertDialog";
import { Button } from "@repo/ui/components/Button";
import { ArchiveIcon, CircleCheckIcon, InfoIcon, TrashIcon, TriangleAlertIcon } from "lucide-react";
import { toast } from "sonner";

export function AlertDialogsPreview() {
  return (
    <div className="flex flex-col gap-2">
      <h4>
        <Trans>Alert dialogs</Trans>
      </h4>
      <div className="flex flex-wrap items-center gap-3">
        <AlertDialog trackingTitle="Delete item">
          <AlertDialogTrigger render={<Button variant="destructive" />}>
            <TrashIcon />
            <Trans>Delete item</Trans>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogMedia className="bg-destructive/10 text-destructive">
                <TrashIcon />
              </AlertDialogMedia>
              <AlertDialogTitle>
                <Trans>Delete this item?</Trans>
              </AlertDialogTitle>
              <AlertDialogDescription>
                <Trans>This action cannot be undone. The item will be permanently removed.</Trans>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogBody />
            <AlertDialogFooter>
              <AlertDialogCancel>
                <Trans>Cancel</Trans>
              </AlertDialogCancel>
              <AlertDialogAction render={<Button variant="destructive" />} onClick={() => toast.error(t`Item deleted`)}>
                <Trans>Delete</Trans>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog trackingTitle="Archive item">
          <AlertDialogTrigger render={<Button variant="outline" />}>
            <ArchiveIcon />
            <Trans>Archive item</Trans>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogMedia className="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                <TriangleAlertIcon />
              </AlertDialogMedia>
              <AlertDialogTitle>
                <Trans>Archive this item?</Trans>
              </AlertDialogTitle>
              <AlertDialogDescription>
                <Trans>The item will be moved to the archive. You can restore it later from the archive.</Trans>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogBody />
            <AlertDialogFooter>
              <AlertDialogCancel>
                <Trans>Cancel</Trans>
              </AlertDialogCancel>
              <AlertDialogAction onClick={() => toast.warning(t`Item archived`)}>
                <Trans>Archive</Trans>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog trackingTitle="Learn more">
          <AlertDialogTrigger render={<Button variant="outline" />}>
            <InfoIcon />
            <Trans>Learn more</Trans>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogMedia className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <InfoIcon />
              </AlertDialogMedia>
              <AlertDialogTitle>
                <Trans>About this feature</Trans>
              </AlertDialogTitle>
              <AlertDialogDescription>
                <Trans>
                  This feature helps you manage your workspace more efficiently. All changes are synced across your team
                  in real time.
                </Trans>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogBody />
            <AlertDialogFooter>
              <AlertDialogCancel variant="secondary">
                <Trans>Close</Trans>
              </AlertDialogCancel>
              <AlertDialogAction onClick={() => toast.info(t`Opened documentation`)}>
                <Trans>Read docs</Trans>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog trackingTitle="Confirm action">
          <AlertDialogTrigger render={<Button variant="outline" />}>
            <CircleCheckIcon />
            <Trans>Confirm action</Trans>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogMedia className="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <CircleCheckIcon />
              </AlertDialogMedia>
              <AlertDialogTitle>
                <Trans>Ready to publish?</Trans>
              </AlertDialogTitle>
              <AlertDialogDescription>
                <Trans>Your changes will be published and visible to all team members immediately.</Trans>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogBody />
            <AlertDialogFooter>
              <AlertDialogCancel>
                <Trans>Not yet</Trans>
              </AlertDialogCancel>
              <AlertDialogAction onClick={() => toast.success(t`Changes published`)}>
                <Trans>Publish now</Trans>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
