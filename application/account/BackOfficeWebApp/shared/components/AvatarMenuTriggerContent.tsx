import { Trans } from "@lingui/react/macro";
import { Avatar, AvatarFallback } from "@repo/ui/components/Avatar";
import { Badge } from "@repo/ui/components/Badge";
import { ChevronsUpDownIcon } from "lucide-react";

interface AvatarMenuTriggerContentProps {
  isCollapsed: boolean;
  initials: string;
  displayName: string;
  email: string;
  isAdmin: boolean;
}

export function AvatarMenuTriggerContent({
  isCollapsed,
  initials,
  displayName,
  email,
  isAdmin
}: Readonly<AvatarMenuTriggerContentProps>) {
  return (
    <>
      <Avatar>
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      {!isCollapsed && (
        <>
          <div className="ml-3 flex min-w-0 flex-1 flex-col text-left">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="overflow-hidden font-medium text-ellipsis whitespace-nowrap text-foreground">
                {displayName || <Trans>Back Office</Trans>}
              </span>
              {isAdmin && (
                <Badge variant="destructive" className="shrink-0">
                  <Trans>Admin</Trans>
                </Badge>
              )}
            </div>
            {email && (
              <span className="overflow-hidden text-xs text-ellipsis whitespace-nowrap text-muted-foreground">
                {email}
              </span>
            )}
          </div>
          <ChevronsUpDownIcon className="ml-2 size-3.5 shrink-0 text-foreground opacity-70" />
        </>
      )}
    </>
  );
}
