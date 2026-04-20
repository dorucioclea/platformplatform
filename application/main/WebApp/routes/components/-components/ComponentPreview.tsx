import { Trans } from "@lingui/react/macro";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/Tabs";
import {
  BarChart3Icon,
  CompassIcon,
  ImageIcon,
  LayersIcon,
  LayoutDashboardIcon,
  MousePointerClickIcon,
  TagIcon,
  TextCursorInputIcon
} from "lucide-react";
import { useEffect, useState } from "react";

import { AlertsBadgesPreview } from "./AlertsBadgesPreview";
import { ButtonsPreview } from "./ButtonsPreview";
import { ChartsPreview } from "./ChartsPreview";
import { ControlsPreview } from "./ControlsPreview";
import { MediaTab } from "./MediaTab";
import { NavigationPreview } from "./NavigationPreview";
import { OverlaysPreview } from "./OverlaysPreview";
import { ResizablePreview } from "./ResizablePreview";

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
    <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1">
      <TabsList>
        <TabsTrigger value="controls">
          <TextCursorInputIcon />
          <Trans>Controls</Trans>
        </TabsTrigger>
        <TabsTrigger value="buttons">
          <MousePointerClickIcon />
          <Trans>Buttons and links</Trans>
        </TabsTrigger>
        <TabsTrigger value="alerts">
          <TagIcon />
          <Trans>Alerts, badges, and banners</Trans>
        </TabsTrigger>
        <TabsTrigger value="navigation">
          <CompassIcon />
          <Trans>Navigation and shortcuts</Trans>
        </TabsTrigger>
        <TabsTrigger value="overlays">
          <LayersIcon />
          <Trans>Overlays</Trans>
        </TabsTrigger>
        <TabsTrigger value="resizable">
          <LayoutDashboardIcon />
          <Trans>Resizable panels</Trans>
        </TabsTrigger>
        <TabsTrigger value="media">
          <ImageIcon />
          <Trans>Media</Trans>
        </TabsTrigger>
        <TabsTrigger value="charts">
          <BarChart3Icon />
          <Trans>Charts</Trans>
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
      <TabsContent value="navigation">
        <NavigationPreview />
      </TabsContent>
      <TabsContent value="overlays">
        <OverlaysPreview />
      </TabsContent>
      <TabsContent value="resizable">
        <ResizablePreview />
      </TabsContent>
      <TabsContent value="media">
        <MediaTab />
      </TabsContent>
      <TabsContent value="charts">
        <ChartsPreview />
      </TabsContent>
    </Tabs>
  );
}
