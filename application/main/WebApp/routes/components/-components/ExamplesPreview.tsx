import { Trans } from "@lingui/react/macro";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/Tabs";
import { PanelsTopLeftIcon, SquareMousePointerIcon, TableIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { DialogsPreview } from "./DialogsPreview";
import { EmptySkeletonPreview } from "./EmptySkeletonPreview";
import { TablePreview } from "./TablePreview";

export function ExamplesPreview() {
  const [activeTab, setActiveTab] = useState(() => window.location.hash.replace("#", "") || "dialogs");

  useEffect(() => {
    const handleHashChange = () => setActiveTab(window.location.hash.replace("#", "") || "dialogs");
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleTabChange = (value: string | number) => {
    const tab = String(value);
    setActiveTab(tab);
    window.location.hash = tab;
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1">
      <TabsList>
        <TabsTrigger value="dialogs">
          <PanelsTopLeftIcon />
          <Trans>Dialogs and cards</Trans>
        </TabsTrigger>
        <TabsTrigger value="tables">
          <TableIcon />
          <Trans>Tables</Trans>
        </TabsTrigger>
        <TabsTrigger value="empty">
          <SquareMousePointerIcon />
          <Trans>Empty and skeleton</Trans>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="dialogs">
        <DialogsPreview />
      </TabsContent>
      <TabsContent value="tables" className="flex flex-1 flex-col">
        <TablePreview />
      </TabsContent>
      <TabsContent value="empty">
        <EmptySkeletonPreview />
      </TabsContent>
    </Tabs>
  );
}
