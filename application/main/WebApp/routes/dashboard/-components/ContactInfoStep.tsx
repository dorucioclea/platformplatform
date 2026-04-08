import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Button } from "@repo/ui/components/Button";
import { DialogBody, DialogClose, DialogFooter } from "@repo/ui/components/Dialog";
import { Form } from "@repo/ui/components/Form";
import { TextField } from "@repo/ui/components/TextField";
import { ChevronRightIcon } from "lucide-react";

import { AvatarUpload } from "./AvatarUpload";

interface ContactInfoStepProps {
  simulateErrors: boolean;
  onNext: () => void;
  onCancel: () => void;
  onChange: () => void;
}

export function ContactInfoStep({ simulateErrors, onNext, onCancel, onChange }: Readonly<ContactInfoStepProps>) {
  return (
    <Form className="flex min-h-0 flex-1 flex-col">
      <DialogBody>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <AvatarUpload onChange={onChange} />
          </div>
          <TextField
            autoFocus
            name="firstName"
            label={t`First name`}
            defaultValue="Alex"
            placeholder={t`E.g., Alex`}
            errorMessage={simulateErrors ? t`First name is required` : undefined}
            onChange={onChange}
          />
          <TextField
            name="lastName"
            label={t`Last name`}
            defaultValue="Taylor"
            placeholder={t`E.g., Taylor`}
            onChange={onChange}
          />
          <TextField
            name="email"
            label={t`Email`}
            type="email"
            defaultValue="alex.taylor@example.com"
            placeholder={t`email@example.com`}
            errorMessage={simulateErrors ? t`Please enter a valid email address` : undefined}
            onChange={onChange}
          />
          <TextField
            name="phone"
            label={t`Phone number`}
            type="tel"
            defaultValue="+1 555 123 4567"
            placeholder={t`+1 555 000 0000`}
            onChange={onChange}
          />
        </div>
      </DialogBody>
      <DialogFooter>
        <DialogClose render={<Button type="button" variant="secondary" />} onClick={onCancel}>
          <Trans>Cancel</Trans>
        </DialogClose>
        <Button type="button" onClick={onNext}>
          <Trans>Next</Trans>
          <ChevronRightIcon />
        </Button>
      </DialogFooter>
    </Form>
  );
}
