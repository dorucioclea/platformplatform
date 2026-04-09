import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Badge } from "@repo/ui/components/Badge";
import { Button } from "@repo/ui/components/Button";
import { SidePane, SidePaneBody, SidePaneFooter, SidePaneHeader } from "@repo/ui/components/SidePane";
import { useFormatDate } from "@repo/ui/hooks/useSmartDate";
import { PencilIcon, Trash2Icon } from "lucide-react";

import type { SampleProduct } from "./sampleProductData";

import { statusVariant } from "./sampleProductData";

const categoryColor: Record<SampleProduct["category"], string> = {
  Electronics: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
  Clothing: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
  Home: "bg-amber-500/20 text-amber-600 dark:text-amber-400",
  Sports: "bg-green-500/20 text-green-600 dark:text-green-400",
  Books: "bg-rose-500/20 text-rose-600 dark:text-rose-400"
};

interface ProductDetailsSidePaneProps {
  product: SampleProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailsSidePane({ product, isOpen, onClose }: ProductDetailsSidePaneProps) {
  const formatDate = useFormatDate();

  if (!product) {
    return null;
  }

  return (
    <SidePane
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      trackingTitle="Product details"
      trackingKey={String(product.id)}
      aria-label={t`Product details`}
    >
      <SidePaneHeader closeButtonLabel={t`Close product details`}>
        <Trans>Product details</Trans>
      </SidePaneHeader>

      <SidePaneBody className="flex flex-col gap-6">
        {/* Product identity */}
        <div className="flex items-start gap-3">
          <div
            className={`flex size-12 shrink-0 items-center justify-center rounded-lg text-lg font-semibold ${categoryColor[product.category]}`}
          >
            {product.name[0]}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold">{product.name}</p>
            <p className="text-sm text-muted-foreground">{product.description}</p>
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">
              <Trans>Price</Trans>
            </p>
            <p className="mt-1 text-lg font-semibold">${product.price}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">
              <Trans>Status</Trans>
            </p>
            <div className="mt-1">
              <Badge variant={statusVariant[product.status]}>{product.status}</Badge>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              <Trans>Category</Trans>
            </span>
            <span className="text-sm font-medium">{product.category}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              <Trans>Added</Trans>
            </span>
            <span className="text-sm font-medium">{formatDate(product.addedAt)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              <Trans>Product ID</Trans>
            </span>
            <span className="font-mono text-sm text-muted-foreground">#{product.id}</span>
          </div>
        </div>
      </SidePaneBody>

      <SidePaneFooter className="flex flex-col gap-2">
        <Button className="w-full">
          <PencilIcon />
          <Trans>Edit product</Trans>
        </Button>
        <Button variant="destructive" className="w-full" aria-label={t`Delete product`}>
          <Trash2Icon />
          <Trans>Delete product</Trans>
        </Button>
      </SidePaneFooter>
    </SidePane>
  );
}
