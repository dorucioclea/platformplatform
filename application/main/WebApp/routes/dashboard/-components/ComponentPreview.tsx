import { Trans } from "@lingui/react/macro";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/Tabs";
import {
  AlertCircleIcon,
  BanIcon,
  CalendarIcon,
  EyeIcon,
  InfoIcon,
  MousePointerClickIcon,
  PanelsTopLeftIcon,
  SearchIcon,
  SquareMousePointerIcon,
  TagIcon,
  TextCursorInputIcon,
  ToggleLeftIcon
} from "lucide-react";
import { useEffect, useState } from "react";

import { AlertsBadgesPreview } from "./AlertsBadgesPreview";
import { ButtonsPreview } from "./ButtonsPreview";
import { ControlRow, useChartItems } from "./ControlRow";
import { DateFormatPreview } from "./DateFormatPreview";
import { DialogsPreview } from "./DialogsPreview";
import { EmptySkeletonPreview } from "./EmptySkeletonPreview";

export function ComponentPreview() {
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedCharts, setSelectedCharts] = useState<string[]>([]);
  const chartItems = useChartItems();
  const [activeTab, setActiveTab] = useState(() => window.location.hash.replace("#", "") || "tooltips");

  useEffect(() => {
    const handleHashChange = () => setActiveTab(window.location.hash.replace("#", "") || "labels");
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleTabChange = (value: string | number) => {
    const tab = String(value);
    setActiveTab(tab);
    window.location.hash = tab;
  };

  const shared = { selectedColor, setSelectedColor, selectedCharts, setSelectedCharts, chartItems };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value="tooltips">
          <InfoIcon />
          <Trans>Controls</Trans>
        </TabsTrigger>
        <TabsTrigger value="labels">
          <TextCursorInputIcon />
          <Trans>With labels</Trans>
        </TabsTrigger>
        <TabsTrigger value="icons">
          <SearchIcon />
          <Trans>With icons</Trans>
        </TabsTrigger>
        <TabsTrigger value="no-labels">
          <ToggleLeftIcon />
          <Trans>Without labels</Trans>
        </TabsTrigger>
        <TabsTrigger value="readonly">
          <EyeIcon />
          <Trans>Read only</Trans>
        </TabsTrigger>
        <TabsTrigger value="disabled">
          <BanIcon />
          <Trans>Disabled</Trans>
        </TabsTrigger>
        <TabsTrigger value="errors">
          <AlertCircleIcon />
          <Trans>Validation errors</Trans>
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
        <TabsTrigger value="dates">
          <CalendarIcon />
          <Trans>Date formatting</Trans>
        </TabsTrigger>
        <TabsTrigger value="empty">
          <SquareMousePointerIcon />
          <Trans>Empty and skeleton</Trans>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="labels">
        <ControlRow suffix="labeled" label {...shared} />
      </TabsContent>
      <TabsContent value="tooltips">
        <ControlRow suffix="tooltip" label tooltip {...shared} />
      </TabsContent>
      <TabsContent value="icons">
        <ControlRow suffix="icon" label showIcon {...shared} />
      </TabsContent>
      <TabsContent value="no-labels">
        <ControlRow suffix="bare" {...shared} />
      </TabsContent>
      <TabsContent value="readonly">
        <ControlRow suffix="readonly" label readOnly {...shared} />
      </TabsContent>
      <TabsContent value="disabled">
        <ControlRow suffix="disabled" label disabled {...shared} />
      </TabsContent>
      <TabsContent value="errors">
        <ControlRow suffix="error" label error {...shared} />
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
      <TabsContent value="dates">
        <DateFormatPreview />
      </TabsContent>
      <TabsContent value="empty">
        <EmptySkeletonPreview />
      </TabsContent>
    </Tabs>
  );
}
