import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { AppLayout } from "@repo/ui/components/AppLayout";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import type { SampleDish } from "./-components/sampleDishData";

import { ComponentsSideMenu } from "./-components/ComponentsSideMenu";
import { DishDetailsSidePane } from "./-components/DishDetailsSidePane";
import { DishMultiSelectSidePane } from "./-components/DishMultiSelectSidePane";
import { ExamplesPreview } from "./-components/ExamplesPreview";
import { PreviewHeader } from "./-components/PreviewHeader";

export const Route = createFileRoute("/components/examples")({
  staticData: { trackingTitle: "Examples" },
  component: ExamplesPage
});

function ExamplesPage() {
  const [selectedDish, setSelectedDish] = useState<SampleDish | null>(null);
  const [selectedDishes, setSelectedDishes] = useState<SampleDish[]>([]);
  const [summaryPaneEnabled, setSummaryPaneEnabled] = useState(false);

  const showSummaryPane = summaryPaneEnabled && selectedDishes.length > 1;

  // When multi-select grows past one row, the single-recipe details pane is no longer relevant —
  // either the summary pane takes over or the user opted out and wants no pane at all.
  useEffect(() => {
    if (selectedDishes.length > 1 && selectedDish != null) {
      setSelectedDish(null);
    }
  }, [selectedDishes.length, selectedDish]);

  const handleCloseDish = useCallback(() => {
    setSelectedDish(null);
  }, []);

  const handleCloseSummary = useCallback(() => {
    setSelectedDishes([]);
  }, []);

  const getSidePane = () => {
    if (showSummaryPane) {
      return <DishMultiSelectSidePane dishes={selectedDishes} isOpen={true} onClose={handleCloseSummary} />;
    }
    if (selectedDish) {
      return <DishDetailsSidePane dish={selectedDish} isOpen={true} onClose={handleCloseDish} />;
    }
    return undefined;
  };

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
              dialogs: <Trans>Dialogs and alert dialogs</Trans>,
              cards: <Trans>Cards</Trans>,
              tables: <Trans>Tables and side pane</Trans>,
              empty: <Trans>Empty and skeleton</Trans>,
              skeleton: <Trans>Skeleton</Trans>
            }}
          />
        }
        sidePane={getSidePane()}
      >
        <ExamplesPreview
          selectedDish={selectedDish}
          onDishSelect={setSelectedDish}
          onSelectedDishesChange={setSelectedDishes}
          onSummaryPaneChange={setSummaryPaneEnabled}
        />
      </AppLayout>
    </>
  );
}
