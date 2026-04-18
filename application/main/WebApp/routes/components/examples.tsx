import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { AppLayout } from "@repo/ui/components/AppLayout";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";

import type { SampleProduct } from "./-components/sampleProductData";

import { ComponentsSideMenu } from "./-components/ComponentsSideMenu";
import { ExamplesPreview } from "./-components/ExamplesPreview";
import { PreviewHeader } from "./-components/PreviewHeader";
import { ProductDetailsSidePane } from "./-components/ProductDetailsSidePane";

export const Route = createFileRoute("/components/examples")({
  staticData: { trackingTitle: "Examples" },
  component: ExamplesPage
});

function ExamplesPage() {
  const [selectedProduct, setSelectedProduct] = useState<SampleProduct | null>(null);

  const handleCloseProduct = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  const getSidePane = () => {
    if (!selectedProduct) {
      return undefined;
    }
    return <ProductDetailsSidePane product={selectedProduct} isOpen={true} onClose={handleCloseProduct} />;
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
        <ExamplesPreview onProductSelect={setSelectedProduct} />
      </AppLayout>
    </>
  );
}
