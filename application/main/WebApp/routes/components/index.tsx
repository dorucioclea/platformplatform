import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { AppLayout } from "@repo/ui/components/AppLayout";
import { createFileRoute } from "@tanstack/react-router";

import { ComponentPreview } from "./-components/ComponentPreview";
import { ComponentsSideMenu } from "./-components/ComponentsSideMenu";
import { PreviewHeader } from "./-components/PreviewHeader";

export const Route = createFileRoute("/components/")({
  staticData: { trackingTitle: "Components" },
  component: ComponentsPage
});

function ComponentsPage() {
  return (
    <>
      <ComponentsSideMenu />
      <AppLayout
        variant="full"
        browserTitle={t`Components`}
        title={t`Component preview`}
        subtitle={t`Browse and test all UI components.`}
        beforeHeader={
          <PreviewHeader
            currentPage="components"
            defaultTab="controls"
            tabLabels={{
              controls: <Trans>Controls</Trans>,
              buttons: <Trans>Buttons and links</Trans>,
              alerts: <Trans>Alerts and badges</Trans>,
              navigation: <Trans>Navigation</Trans>
            }}
          />
        }
      >
        <ComponentPreview />
      </AppLayout>
    </>
  );
}
