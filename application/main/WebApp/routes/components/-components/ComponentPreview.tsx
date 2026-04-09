import { Trans } from "@lingui/react/macro";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/Tabs";
import { CompassIcon, MousePointerClickIcon, TagIcon, TextCursorInputIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { AlertsBadgesPreview } from "./AlertsBadgesPreview";
import { ButtonsPreview } from "./ButtonsPreview";
import { ControlsPreview } from "./ControlsPreview";
import { NavigationPreview } from "./NavigationPreview";

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
          <Trans>Alerts and badges</Trans>
        </TabsTrigger>
        <TabsTrigger value="navigation">
          <CompassIcon />
          <Trans>Navigation</Trans>
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
    </Tabs>
  );
}
