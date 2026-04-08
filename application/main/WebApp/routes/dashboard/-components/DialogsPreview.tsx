import { Trans } from "@lingui/react/macro";
import { Button } from "@repo/ui/components/Button";
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "@repo/ui/components/Field";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/RadioGroup";
import { MailIcon, ShieldIcon, UserIcon } from "lucide-react";
import { useState } from "react";

import { AlertDialogsPreview } from "./AlertDialogsPreview";
import { CardsPreview } from "./CardsPreview";
import { ContactDetailsDialog } from "./ContactDetailsDialog";
import { SendInvitationDialog } from "./SendInvitationDialog";

function RadioCardSelectorPreview() {
  return (
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
  );
}

export function DialogsPreview() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h4>
          <Trans>Form dialogs</Trans>
        </h4>
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
        <ContactDetailsDialog isOpen={isContactOpen} onOpenChange={setIsContactOpen} />
        <SendInvitationDialog isOpen={isInviteOpen} onOpenChange={setIsInviteOpen} />
      </div>
      <AlertDialogsPreview />
      <RadioCardSelectorPreview />
      <CardsPreview />
    </div>
  );
}
