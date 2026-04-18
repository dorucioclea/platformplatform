import { t } from "@lingui/core/macro";
import { Plural, Trans } from "@lingui/react/macro";
import { Button } from "@repo/ui/components/Button";
import { SidePane, SidePaneBody, SidePaneFooter, SidePaneHeader } from "@repo/ui/components/SidePane";
import { Trash2Icon } from "lucide-react";

import type { SampleProduct } from "./sampleProductData";

interface ProductMultiSelectSidePaneProps {
  products: SampleProduct[];
  isOpen: boolean;
  onClose: () => void;
}

export function ProductMultiSelectSidePane({ products, isOpen, onClose }: ProductMultiSelectSidePaneProps) {
  const total = products.reduce((sum, product) => sum + product.price, 0);

  return (
    <SidePane
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      trackingTitle="Product selection summary"
      aria-label={t`Selected products`}
    >
      <SidePaneHeader closeButtonLabel={t`Close selection summary`}>
        <Trans>
          <Plural value={products.length} one="# product selected" other="# products selected" />
        </Trans>
      </SidePaneHeader>

      <SidePaneBody className="flex flex-col gap-4">
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3">
          <span className="text-sm text-muted-foreground">
            <Trans>Total value</Trans>
          </span>
          <span className="text-lg font-semibold">${total}</span>
        </div>

        <ul className="flex flex-col gap-1">
          {products.map((product) => (
            <li key={product.id} className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm">
              <span className="truncate font-medium">{product.name}</span>
              <span className="shrink-0 text-muted-foreground">${product.price}</span>
            </li>
          ))}
        </ul>
      </SidePaneBody>

      <SidePaneFooter>
        <Button variant="destructive" className="w-full" aria-label={t`Delete selected products`}>
          <Trash2Icon />
          <Trans>
            <Plural value={products.length} one="Delete # product" other="Delete # products" />
          </Trans>
        </Button>
      </SidePaneFooter>
    </SidePane>
  );
}
