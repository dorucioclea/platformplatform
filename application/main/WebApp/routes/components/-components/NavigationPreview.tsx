import { Trans } from "@lingui/react/macro";

export function NavigationPreview() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h4>
          <Trans>Breadcrumb</Trans>
        </h4>
        <p className="text-sm text-muted-foreground">
          <Trans>Coming soon.</Trans>
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <h4>
          <Trans>Context menu</Trans>
        </h4>
        <p className="text-sm text-muted-foreground">
          <Trans>Coming soon.</Trans>
        </p>
      </div>
    </div>
  );
}
