import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { type ReactNode, useCallback } from "react";

import { useUnsavedChangesGuard } from "../hooks/useUnsavedChangesGuard";
import { Dialog, type DialogProps } from "./Dialog";
import { DirtyDialogContext } from "./DirtyDialogContext";
import { UnsavedChangesAlertDialog } from "./UnsavedChangesAlertDialog";

export { DirtyDialogContext };

export type DirtyDialogProps = Omit<DialogProps, "onOpenChange"> & {
  onOpenChange: (isOpen: boolean) => void;
  hasUnsavedChanges: boolean;
  unsavedChangesTitle?: string;
  unsavedChangesMessage?: ReactNode;
  leaveLabel?: string;
  stayLabel?: string;
  onCloseComplete?: () => void;
};

/**
 * A Dialog wrapper that warns users about unsaved changes before closing.
 * Encapsulates the useUnsavedChangesGuard hook and UnsavedChangesAlertDialog.
 */
export function DirtyDialog({
  open,
  onOpenChange,
  hasUnsavedChanges,
  unsavedChangesTitle = t`Unsaved changes`,
  unsavedChangesMessage = <Trans>You have unsaved changes. If you leave now, your changes will be lost.</Trans>,
  leaveLabel = t`Leave`,
  stayLabel = t`Stay`,
  onCloseComplete,
  children,
  ...dialogProps
}: Readonly<DirtyDialogProps>) {
  const { isConfirmDialogOpen, confirmLeave, cancelLeave, guardedOnOpenChange } = useUnsavedChangesGuard({
    hasUnsavedChanges
  });

  const closeDialog = useCallback(() => {
    onOpenChange(false);
    onCloseComplete?.();
  }, [onOpenChange, onCloseComplete]);

  const handleDialogOpenChange = useCallback(
    (newOpen: boolean) => {
      if (newOpen) {
        onOpenChange(newOpen);
      } else {
        guardedOnOpenChange(newOpen, closeDialog);
      }
    },
    [guardedOnOpenChange, closeDialog, onOpenChange]
  );

  return (
    <>
      <DirtyDialogContext.Provider value={{ cancel: closeDialog, hasUnsavedChanges }}>
        <Dialog open={open} onOpenChange={handleDialogOpenChange} {...dialogProps}>
          {children}
        </Dialog>
      </DirtyDialogContext.Provider>

      <UnsavedChangesAlertDialog
        isOpen={isConfirmDialogOpen}
        onConfirmLeave={confirmLeave}
        onCancel={cancelLeave}
        title={unsavedChangesTitle}
        actionLabel={leaveLabel}
        cancelLabel={stayLabel}
        parentTrackingTitle={dialogProps.trackingTitle}
      >
        {unsavedChangesMessage}
      </UnsavedChangesAlertDialog>
    </>
  );
}
