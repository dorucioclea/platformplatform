import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { SwitchField } from "@repo/ui/components/SwitchField";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/Tabs";
import {
  CalendarIcon,
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
import { DateFormatPreview } from "./DateFormatPreview";
import { DialogsPreview } from "./DialogsPreview";
import { EmptySkeletonPreview } from "./EmptySkeletonPreview";

export function ComponentPreview() {
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedCharts, setSelectedCharts] = useState<string[]>([]);
  const chartItems = useChartItems();
  const [activeTab, setActiveTab] = useState(() => window.location.hash.replace("#", "") || "controls");

  const [showLabels, setShowLabels] = useState(true);
  const [showTooltips, setShowTooltips] = useState(true);
  const [showIcons, setShowIcons] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
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
        <TabsTrigger value="dates">
          <CalendarIcon />
          <Trans>Date formatting</Trans>
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
          <SwitchField
            label={t`Disabled`}
            checked={isDisabled}
            onCheckedChange={(checked) => {
              setIsDisabled(checked);
              if (checked) setIsReadOnly(false);
            }}
          />
          <SwitchField
            label={t`Read only`}
            checked={isReadOnly}
            onCheckedChange={(checked) => {
              setIsReadOnly(checked);
              if (checked) setIsDisabled(false);
            }}
          />
          <SwitchField label={t`Errors`} checked={showErrors} onCheckedChange={setShowErrors} />
        </div>
        <ControlRow
          suffix="controls"
          label={showLabels}
          tooltip={showTooltips && showLabels}
          showIcon={showIcons}
          disabled={isDisabled}
          readOnly={isReadOnly}
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
      <TabsContent value="dates">
        <DateFormatPreview />
      </TabsContent>
      <TabsContent value="empty">
        <EmptySkeletonPreview />
      </TabsContent>
    </Tabs>
  );
}
