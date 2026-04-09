import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Avatar, AvatarFallback } from "@repo/ui/components/Avatar";
import { Badge } from "@repo/ui/components/Badge";
import { Button } from "@repo/ui/components/Button";
import { SidePane, SidePaneBody, SidePaneFooter, SidePaneHeader } from "@repo/ui/components/SidePane";
import { useFormatDate } from "@repo/ui/hooks/useSmartDate";
import { MailIcon, PencilIcon } from "lucide-react";

import type { SampleUser } from "./sampleUserData";

import { roleVariant } from "./sampleUserData";

interface UserDetailsSidePaneProps {
  user: SampleUser | null;
  onClose: () => void;
}

export function UserDetailsSidePane({ user, onClose }: Readonly<UserDetailsSidePaneProps>) {
  const formatDate = useFormatDate();

  return (
    <SidePane
      isOpen={user !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      trackingTitle="User details"
      trackingKey={user?.id.toString()}
      aria-label={t`User details`}
    >
      <SidePaneHeader closeButtonLabel={t`Close user details`}>
        <Trans>User details</Trans>
      </SidePaneHeader>
      <SidePaneBody>
        {user && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <Avatar className="size-20">
                <AvatarFallback className="text-2xl">{user.initials}</AvatarFallback>
              </Avatar>
              <div>
                <h3>{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <Badge variant={roleVariant[user.role]}>{user.role}</Badge>
            </div>

            <div className="flex flex-col gap-3 rounded-lg border p-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  <Trans>Email</Trans>
                </span>
                <span className="text-sm">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  <Trans>Role</Trans>
                </span>
                <span className="text-sm">{user.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  <Trans>Created</Trans>
                </span>
                <span className="text-sm">{formatDate(user.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  <Trans>Last seen</Trans>
                </span>
                <span className="text-sm">{formatDate(user.lastSeenAt)}</span>
              </div>
            </div>
          </div>
        )}
      </SidePaneBody>
      <SidePaneFooter>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1">
            <MailIcon className="size-4" />
            <Trans>Send email</Trans>
          </Button>
          <Button className="flex-1">
            <PencilIcon className="size-4" />
            <Trans>Edit profile</Trans>
          </Button>
        </div>
      </SidePaneFooter>
    </SidePane>
  );
}
