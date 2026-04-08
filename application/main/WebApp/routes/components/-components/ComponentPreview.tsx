import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { SwitchField } from "@repo/ui/components/SwitchField";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/Tabs";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/ToggleGroup";
import {
  MousePointerClickIcon,
  PanelsTopLeftIcon,
  SquareMousePointerIcon,
  TagIcon,
  TextCursorInputIcon
} from "lucide-react";
import { useEffect, useState } from "react";

import { AlertsBadgesPreview } from "./AlertsBadgesPreview";
import { ButtonsPreview } from "./ButtonsPreview";
import { ControlRow, useChartItems } from "./ControlRow";
import { DialogsPreview } from "./DialogsPreview";
import { EmptySkeletonPreview } from "./EmptySkeletonPreview";

export function ComponentPreview() {
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedCharts, setSelectedCharts] = useState<string[]>([]);
  const chartItems = useChartItems();
  const [activeTab, setActiveTab] = useState(() => window.location.hash.replace("#", "") || "controls");

  const [showLabels, setShowLabels] = useState(true);
  const [showTooltips, setShowTooltips] = useState(true);
  const [showIcons, setShowIcons] = useState(true);
  const [controlState, setControlState] = useState<"enabled" | "disabled" | "readonly">("enabled");
  const [showErrors, setShowErrors] = useState(false);

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

  const shared = { selectedColor, setSelectedColor, selectedCharts, setSelectedCharts, chartItems };

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
        <TabsTrigger value="empty">
          <SquareMousePointerIcon />
          <Trans>Empty and skeleton</Trans>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="controls">
        <div className="flex flex-wrap gap-x-6 gap-y-2 pb-6">
          <SwitchField label={t`Labels`} checked={showLabels} onCheckedChange={setShowLabels} />
          <SwitchField
            label={t`Tooltips`}
            checked={showTooltips && showLabels}
            onCheckedChange={setShowTooltips}
            disabled={!showLabels}
          />
          <SwitchField label={t`Icons`} checked={showIcons} onCheckedChange={setShowIcons} />
          <SwitchField label={t`Errors`} checked={showErrors} onCheckedChange={setShowErrors} />
          <ToggleGroup
            variant="outline"
            value={[controlState]}
            onValueChange={(values) => {
              if (values.length > 0) {
                setControlState(values[0] as "enabled" | "disabled" | "readonly");
              }
            }}
          >
            <ToggleGroupItem value="enabled">
              <Trans>Enabled</Trans>
            </ToggleGroupItem>
            <ToggleGroupItem value="readonly">
              <Trans>Read only</Trans>
            </ToggleGroupItem>
            <ToggleGroupItem value="disabled">
              <Trans>Disabled</Trans>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <ControlRow
          suffix="controls"
          label={showLabels}
          tooltip={showTooltips && showLabels}
          showIcon={showIcons}
          disabled={controlState === "disabled"}
          readOnly={controlState === "readonly"}
          error={showErrors}
          {...shared}
        />
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
      <TabsContent value="empty">
        <EmptySkeletonPreview />
      </TabsContent>
    </Tabs>
  );
}
