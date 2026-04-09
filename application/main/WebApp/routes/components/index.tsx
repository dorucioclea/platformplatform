import { t } from "@lingui/core/macro";
import { LocaleSwitcher } from "@repo/infrastructure/translations/LocaleSwitcher";
import { AppLayout } from "@repo/ui/components/AppLayout";
import { Button } from "@repo/ui/components/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@repo/ui/components/DropdownMenu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui/components/Tooltip";
import { ThemeModeSelector } from "@repo/ui/theme/ThemeModeSelector";
import { createFileRoute } from "@tanstack/react-router";
import { CheckIcon, ZoomInIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { ComponentPreview } from "./-components/ComponentPreview";
import { ComponentsSideMenu } from "./-components/ComponentsSideMenu";

export const Route = createFileRoute("/components/")({
  staticData: { trackingTitle: "Components" },
  component: ComponentsPage
});

const zoomLevelStorageKey = "zoom-level";
const defaultZoomValue = "1";
const zoomLevelOptions = [
  { value: "0.875", label: "Small", fontSize: "14px" },
  { value: "1", label: "Default", fontSize: "16px" },
  { value: "1.125", label: "Large", fontSize: "18px" },
  { value: "1.25", label: "Larger", fontSize: "20px" }
];

function ZoomSwitcher() {
  const [currentZoom, setCurrentZoom] = useState(defaultZoomValue);

  useEffect(() => {
    const saved = localStorage.getItem(zoomLevelStorageKey);
    if (saved && zoomLevelOptions.some((z) => z.value === saved)) {
      setCurrentZoom(saved);
    }
  }, []);

  const handleZoomChange = (value: string) => {
    if (value === "1") {
      localStorage.removeItem(zoomLevelStorageKey);
    } else {
      localStorage.setItem(zoomLevelStorageKey, value);
    }
    document.documentElement.style.setProperty("--zoom-level", value);
    setCurrentZoom(value);
  };

  return (
    <DropdownMenu trackingTitle="Zoom menu">
      <Tooltip>
        <TooltipTrigger
          render={
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-lg" aria-label={t`Change zoom level`}>
                  <ZoomInIcon className="size-5" />
                </Button>
              }
            />
          }
        />
        <TooltipContent>{t`Change zoom level`}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent>
        {zoomLevelOptions.map((zoom) => (
          <DropdownMenuItem key={zoom.value} trackingLabel={zoom.label} onClick={() => handleZoomChange(zoom.value)}>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: zoom.fontSize, lineHeight: 1 }}>Aa</span>
              <span>{zoom.label}</span>
              {zoom.value === currentZoom && <CheckIcon className="ml-auto size-4" />}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PreviewToolbar() {
  return (
    <div className="fixed top-4 right-4 z-20 flex gap-1 rounded-md bg-card p-1 shadow-md">
      <ThemeModeSelector aria-label={t`Change theme`} />
      <LocaleSwitcher aria-label={t`Change language`} />
      <ZoomSwitcher />
    </div>
  );
}

function ComponentsPage() {
  return (
    <>
      <ComponentsSideMenu />
      <PreviewToolbar />
      <AppLayout
        variant="full"
        browserTitle={t`Components`}
        title={t`Component preview`}
        subtitle={t`Browse and test all UI components.`}
      >
        <ComponentPreview />
      </AppLayout>
    </>
  );
}
