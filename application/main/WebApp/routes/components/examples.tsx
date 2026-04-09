import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { AppLayout } from "@repo/ui/components/AppLayout";
import { createFileRoute } from "@tanstack/react-router";

import { ComponentsSideMenu } from "./-components/ComponentsSideMenu";
import { ExamplesPreview } from "./-components/ExamplesPreview";
import { PreviewHeader } from "./-components/PreviewHeader";

export const Route = createFileRoute("/components/examples")({
  staticData: { trackingTitle: "Examples" },
  component: ExamplesPage
});

function ExamplesPage() {
  return (
    <>
      <ComponentsSideMenu />
      <AppLayout
        variant="full"
        browserTitle={t`Examples`}
        title={t`Examples`}
        subtitle={t`Composed real-world flows using the UI components.`}
        beforeHeader={
          <PreviewHeader
            currentPage="examples"
            defaultTab="dialogs"
            tabLabels={{
              dialogs: <Trans>Dialogs and cards</Trans>,
              tables: <Trans>Tables</Trans>,
              empty: <Trans>Empty and skeleton</Trans>
            }}
          />
        }
      >
        <ExamplesPreview />
      </AppLayout>
    </>
  );
}
