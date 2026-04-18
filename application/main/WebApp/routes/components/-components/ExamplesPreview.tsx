import { Trans } from "@lingui/react/macro";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/Tabs";
import { LayoutDashboardIcon, LayoutTemplateIcon, PanelsTopLeftIcon, SquareDashedIcon, TableIcon } from "lucide-react";
import { useEffect, useState } from "react";

import type { SampleProduct } from "./sampleProductData";

import { CardsPreview } from "./CardsPreview";
import { DateFormatPreview } from "./DateFormatPreview";
import { DialogsPreview } from "./DialogsPreview";
import { EmptyPreview } from "./EmptyPreview";
import { SkeletonPreview } from "./SkeletonPreview";
import { TablePreview } from "./TablePreview";

interface ExamplesPreviewProps {
  selectedProduct?: SampleProduct | null;
  onProductSelect?: (product: SampleProduct | null) => void;
}

export function ExamplesPreview({ selectedProduct, onProductSelect }: ExamplesPreviewProps) {
  const [activeTab, setActiveTab] = useState(() => window.location.hash.replace("#", "") || "dialogs");

  useEffect(() => {
    const handleHashChange = () => setActiveTab(window.location.hash.replace("#", "") || "dialogs");
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleTabChange = (value: string | number) => {
    const tab = String(value);
    if (activeTab === "tables" && tab !== "tables") {
      onProductSelect?.(null);
    }
    setActiveTab(tab);
    window.location.hash = tab;
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1">
      <TabsList>
        <TabsTrigger value="dialogs">
          <PanelsTopLeftIcon />
          <Trans>Dialogs</Trans>
        </TabsTrigger>
        <TabsTrigger value="cards">
          <LayoutTemplateIcon />
          <Trans>Cards</Trans>
        </TabsTrigger>
        <TabsTrigger value="tables">
          <TableIcon />
          <Trans>Tables and side pane</Trans>
        </TabsTrigger>
        <TabsTrigger value="empty">
          <LayoutDashboardIcon />
          <Trans>Empty</Trans>
        </TabsTrigger>
        <TabsTrigger value="skeleton">
          <SquareDashedIcon />
          <Trans>Skeleton</Trans>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="dialogs">
        <DialogsPreview />
      </TabsContent>
      <TabsContent value="cards">
        <div className="flex flex-col gap-6">
          <CardsPreview />
          <DateFormatPreview />
        </div>
      </TabsContent>
      <TabsContent value="tables" className="flex flex-1 flex-col">
        <TablePreview selectedProduct={selectedProduct} onProductSelect={onProductSelect} />
      </TabsContent>
      <TabsContent value="empty" className="flex flex-1 flex-col">
        <EmptyPreview />
      </TabsContent>
      <TabsContent value="skeleton">
        <SkeletonPreview />
      </TabsContent>
    </Tabs>
  );
}
