import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Button } from "@repo/ui/components/Button";
import { DialogBody, DialogFooter } from "@repo/ui/components/Dialog";
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "@repo/ui/components/Field";
import { Form } from "@repo/ui/components/Form";
import { InlineFieldGroup } from "@repo/ui/components/InlineFieldGroup";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/RadioGroup";
import { SwitchField } from "@repo/ui/components/SwitchField";
import { mutationSubmitter } from "@repo/ui/forms/mutationSubmitter";
import { type UseMutationResult } from "@tanstack/react-query";
import { ChevronLeftIcon, MailIcon, ShieldIcon, UserIcon } from "lucide-react";
import { useState } from "react";

interface RolePreferencesStepProps {
  mutation: UseMutationResult<void, unknown, { body?: unknown }>;
  onBack: () => void;
  onChange: () => void;
}

export function RolePreferencesStep({ mutation, onBack, onChange }: Readonly<RolePreferencesStepProps>) {
  const [newsletterChecked, setNewsletterChecked] = useState(false);

  return (
    <Form onSubmit={mutationSubmitter(mutation)} className="flex min-h-0 flex-1 flex-col">
      <DialogBody>
        <div className="flex flex-col gap-4">
          <RadioGroup defaultValue="member" onValueChange={onChange}>
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
          <InlineFieldGroup>
            <SwitchField
              name="newsletter"
              label={t`Subscribe to newsletter`}
              checked={newsletterChecked}
              onCheckedChange={(v) => {
                setNewsletterChecked(!!v);
                onChange();
              }}
            />
          </InlineFieldGroup>
        </div>
      </DialogBody>
      <DialogFooter>
        <Button type="button" variant="secondary" onClick={onBack} disabled={mutation.isPending}>
          <ChevronLeftIcon />
          <Trans>Back</Trans>
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? <Trans>Saving...</Trans> : <Trans>Save changes</Trans>}
        </Button>
      </DialogFooter>
    </Form>
  );
}
