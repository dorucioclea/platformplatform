import { Trans } from "@lingui/react/macro";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/Tabs";
import {
  MousePointerClickIcon,
  PanelsTopLeftIcon,
  SquareMousePointerIcon,
  TableIcon,
  TagIcon,
  TextCursorInputIcon
} from "lucide-react";
import { useEffect, useState } from "react";

import { AlertsBadgesPreview } from "./AlertsBadgesPreview";
import { ButtonsPreview } from "./ButtonsPreview";
import { ControlsPreview } from "./ControlsPreview";
import { DialogsPreview } from "./DialogsPreview";
import { EmptySkeletonPreview } from "./EmptySkeletonPreview";
import { TableSidePanePreview } from "./TableSidePanePreview";

export function ComponentPreview() {
  const [activeTab, setActiveTab] = useState(() => window.location.hash.replace("#", "") || "controls");

  useEffect(() => {
    const handleHashChange = () => setActiveTab(window.location.hash.replace("#", "") || "controls");
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleTabChange = (value: string | number) => {
    const tab = String(value);
    setActiveTab(tab);
    window.location.hash = tab;
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value="controls">
          <TextCursorInputIcon />
          <Trans>Controls</Trans>
        </TabsTrigger>
        <TabsTrigger value="buttons">
          <MousePointerClickIcon />
          <Trans>Buttons</Trans>
        </TabsTrigger>
        <TabsTrigger value="alerts">
          <TagIcon />
          <Trans>Alerts and badges</Trans>
        </TabsTrigger>
        <TabsTrigger value="dialogs">
          <PanelsTopLeftIcon />
          <Trans>Dialogs and cards</Trans>
        </TabsTrigger>
        <TabsTrigger value="tables">
          <TableIcon />
          <Trans>Tables and panes</Trans>
        </TabsTrigger>
        <TabsTrigger value="empty">
          <SquareMousePointerIcon />
          <Trans>Empty and skeleton</Trans>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="controls">
        <ControlsPreview />
      </TabsContent>
      <TabsContent value="buttons">
        <ButtonsPreview />
      </TabsContent>
      <TabsContent value="alerts">
        <AlertsBadgesPreview />
      </TabsContent>
      <TabsContent value="dialogs">
        <DialogsPreview />
      </TabsContent>
      <TabsContent value="tables">
        <TableSidePanePreview />
      </TabsContent>
      <TabsContent value="empty">
        <EmptySkeletonPreview />
      </TabsContent>
    </Tabs>
  );
}
