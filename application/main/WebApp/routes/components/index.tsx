import { t } from "@lingui/core/macro";
import { AppLayout } from "@repo/ui/components/AppLayout";
import { createFileRoute } from "@tanstack/react-router";

import { ComponentPreview } from "./-components/ComponentPreview";

export const Route = createFileRoute("/components/")({
  staticData: { trackingTitle: "Components" },
  component: ComponentsPage
});

function ComponentsPage() {
  return (
    <AppLayout
      variant="full"
      browserTitle={t`Components`}
      title={t`Component preview`}
      subtitle={t`Browse and test all UI components.`}
    >
      <ComponentPreview />
    </AppLayout>
  );
}
