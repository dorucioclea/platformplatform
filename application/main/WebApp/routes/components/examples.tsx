import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { AppLayout } from "@repo/ui/components/AppLayout";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import type { SampleProduct } from "./-components/sampleProductData";

import { ComponentsSideMenu } from "./-components/ComponentsSideMenu";
import { ExamplesPreview } from "./-components/ExamplesPreview";
import { PreviewHeader } from "./-components/PreviewHeader";
import { ProductDetailsSidePane } from "./-components/ProductDetailsSidePane";
import { ProductMultiSelectSidePane } from "./-components/ProductMultiSelectSidePane";

export const Route = createFileRoute("/components/examples")({
  staticData: { trackingTitle: "Examples" },
  component: ExamplesPage
});

function ExamplesPage() {
  const [selectedProduct, setSelectedProduct] = useState<SampleProduct | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<SampleProduct[]>([]);
  const [summaryPaneEnabled, setSummaryPaneEnabled] = useState(false);

  const showSummaryPane = summaryPaneEnabled && selectedProducts.length > 1;

  // When multi-select grows past one row, the single-product details pane is no longer relevant —
  // either the summary pane takes over or the user opted out and wants no pane at all.
  useEffect(() => {
    if (selectedProducts.length > 1 && selectedProduct != null) {
      setSelectedProduct(null);
    }
  }, [selectedProducts.length, selectedProduct]);

  const handleCloseProduct = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  const handleCloseSummary = useCallback(() => {
    setSelectedProducts([]);
  }, []);

  const getSidePane = () => {
    if (showSummaryPane) {
      return <ProductMultiSelectSidePane products={selectedProducts} isOpen={true} onClose={handleCloseSummary} />;
    }
    if (selectedProduct) {
      return <ProductDetailsSidePane product={selectedProduct} isOpen={true} onClose={handleCloseProduct} />;
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
          selectedProduct={selectedProduct}
          onProductSelect={setSelectedProduct}
          onSelectedProductsChange={setSelectedProducts}
          onSummaryPaneChange={setSummaryPaneEnabled}
        />
      </AppLayout>
    </>
  );
}
