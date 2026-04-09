import { Trans } from "@lingui/react/macro";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/Alert";
import { Badge } from "@repo/ui/components/Badge";
import { AlertCircleIcon, InfoIcon, TriangleAlertIcon } from "lucide-react";

export function AlertsBadgesPreview() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h4>
          <Trans>Alerts</Trans>
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <Alert>
            <InfoIcon />
            <AlertTitle>
              <Trans>Default alert</Trans>
            </AlertTitle>
            <AlertDescription>
              <Trans>This is a default informational alert.</Trans>
            </AlertDescription>
          </Alert>
          <Alert variant="info">
            <InfoIcon />
            <AlertTitle>
              <Trans>Info alert</Trans>
            </AlertTitle>
            <AlertDescription>
              <Trans>This is an informational message.</Trans>
            </AlertDescription>
          </Alert>
          <Alert variant="warning">
            <TriangleAlertIcon />
            <AlertTitle>
              <Trans>Warning alert</Trans>
            </AlertTitle>
            <AlertDescription>
              <Trans>This action may have unintended consequences.</Trans>
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>
              <Trans>Destructive alert</Trans>
            </AlertTitle>
            <AlertDescription>
              <Trans>Something went wrong. Please try again.</Trans>
            </AlertDescription>
          </Alert>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h4>
          <Trans>Badges</Trans>
        </h4>
        <div className="flex flex-wrap items-center gap-3">
          <Badge>
            <Trans>Default</Trans>
          </Badge>
          <Badge variant="secondary">
            <Trans>Secondary</Trans>
          </Badge>
          <Badge variant="destructive">
            <Trans>Destructive</Trans>
          </Badge>
          <Badge variant="outline">
            <Trans>Outline</Trans>
          </Badge>
        </div>
      </div>
    </div>
  );
}
