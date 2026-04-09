import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Button } from "@repo/ui/components/Button";
import { SwitchField } from "@repo/ui/components/SwitchField";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/ToggleGroup";
import { MailIcon, UserIcon } from "lucide-react";
import { useState } from "react";

import { AlertDialogsPreview } from "./AlertDialogsPreview";
import { CardsPreview } from "./CardsPreview";
import { ContactDetailsDialog } from "./ContactDetailsDialog";
import { DateFormatPreview } from "./DateFormatPreview";
import { type DialogSize } from "./dialogSize";
import { SendInvitationDialog } from "./SendInvitationDialog";

export function DialogsPreview() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [dirtyDialog, setDirtyDialog] = useState(true);
  const [showToasts, setShowToasts] = useState(true);
  const [simulateErrors, setSimulateErrors] = useState(false);
  const [dialogSize, setDialogSize] = useState<DialogSize>("md");

  const options = { dirtyDialog, showToasts, simulateErrors, size: dialogSize };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h4>
          <Trans>Form dialogs</Trans>
        </h4>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <SwitchField
            label={t`Dirty dialog`}
            name="dirty-dialog"
            checked={dirtyDialog}
            onCheckedChange={(v) => setDirtyDialog(!!v)}
          />
          <SwitchField
            label={t`Show toast`}
            name="show-toasts"
            checked={showToasts}
            onCheckedChange={(v) => setShowToasts(!!v)}
          />
          <SwitchField
            label={t`Simulate errors`}
            name="simulate-errors"
            checked={simulateErrors}
            onCheckedChange={(v) => setSimulateErrors(!!v)}
          />
          <ToggleGroup
            variant="outline"
            value={[dialogSize]}
            onValueChange={(values) => {
              if (values.length > 0) {
                setDialogSize(values[0] as DialogSize);
              }
            }}
          >
            <ToggleGroupItem value="sm">
              <Trans>Small</Trans>
            </ToggleGroupItem>
            <ToggleGroupItem value="md">
              <Trans>Medium</Trans>
            </ToggleGroupItem>
            <ToggleGroupItem value="lg">
              <Trans>Large</Trans>
            </ToggleGroupItem>
            <ToggleGroupItem value="xl">
              <Trans>Extra large</Trans>
            </ToggleGroupItem>
            <ToggleGroupItem value="2xl">
              <Trans>2X large</Trans>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={() => setIsContactOpen(true)}>
            <UserIcon />
            <Trans>Edit contact</Trans>
          </Button>
          <Button variant="outline" onClick={() => setIsInviteOpen(true)}>
            <MailIcon />
            <Trans>Send invitation</Trans>
          </Button>
        </div>
        <ContactDetailsDialog isOpen={isContactOpen} onOpenChange={setIsContactOpen} {...options} />
        <SendInvitationDialog isOpen={isInviteOpen} onOpenChange={setIsInviteOpen} {...options} />
      </div>
      <AlertDialogsPreview showToasts={showToasts} />
      <CardsPreview />
      <DateFormatPreview />
    </div>
  );
}
