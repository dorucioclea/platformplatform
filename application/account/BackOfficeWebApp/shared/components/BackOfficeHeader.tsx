import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Button } from "@repo/ui/components/Button";
import { LogOutIcon } from "lucide-react";

interface BackOfficeHeaderProps {
  displayName?: string;
}

export function BackOfficeHeader({ displayName }: Readonly<BackOfficeHeaderProps>) {
  return (
    <header className="flex w-full items-center justify-between gap-4 border-b border-border px-6 py-3">
      <div className="text-sm font-semibold">
        <Trans>PlatformPlatform Back Office</Trans>
      </div>
      <div className="flex items-center gap-3">
        {displayName && <span className="text-sm text-muted-foreground">{displayName}</span>}
        <Button
          variant="outline"
          size="sm"
          aria-label={t`Sign out`}
          onClick={() => {
            globalThis.location.href = "/.auth/logout";
          }}
        >
          <LogOutIcon size={16} />
          <span className="hidden sm:inline">
            <Trans>Sign out</Trans>
          </span>
        </Button>
      </div>
    </header>
  );
}
