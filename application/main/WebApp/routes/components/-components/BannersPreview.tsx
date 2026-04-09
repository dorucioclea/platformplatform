import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Button } from "@repo/ui/components/Button";
import { AlertCircleIcon, FlagIcon, InfoIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";

type BannerVariant = "persistent" | "dismissable" | "cta";

const bannerContent: Record<BannerVariant, { message: () => string; icon: React.ReactNode }> = {
  persistent: {
    message: () => t`Scheduled maintenance on Sunday 2:00 AM — 4:00 AM UTC. Some features may be unavailable.`,
    icon: <InfoIcon className="size-4 shrink-0 text-warning-foreground" />
  },
  dismissable: {
    message: () => t`75% of quota used`,
    icon: <FlagIcon className="size-4 shrink-0 text-warning-foreground" />
  },
  cta: {
    message: () => t`Your trial expires in 3 days.`,
    icon: <AlertCircleIcon className="size-4 shrink-0 text-warning-foreground" />
  }
};

function SampleBanner({ variant, onClose }: Readonly<{ variant: BannerVariant; onClose: () => void }>) {
  const [target] = useState(() => document.getElementById("banner-root"));
  if (!target) return null;

  const content = bannerContent[variant];

  return createPortal(
    <div className="flex h-12 items-center gap-3 border-b border-warning/50 bg-warning px-4 text-sm">
      {content.icon}
      <span className="flex-1 text-warning-foreground">{content.message()}</span>
      {variant === "cta" && (
        <Button size="sm" onClick={onClose}>
          <Trans>Upgrade now</Trans>
        </Button>
      )}
      {variant === "dismissable" && (
        <Button variant="ghost" size="icon-sm" aria-label={t`Close`} onClick={onClose}>
          <XIcon className="size-4" />
        </Button>
      )}
    </div>,
    target
  );
}

export function BannersPreview() {
  const [bannerMode, setBannerMode] = useState<"none" | BannerVariant>("none");

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant={bannerMode === "persistent" ? "default" : "outline"}
          onClick={() => setBannerMode(bannerMode === "persistent" ? "none" : "persistent")}
        >
          <Trans>Show banner</Trans>
        </Button>
        <Button
          variant={bannerMode === "dismissable" ? "default" : "outline"}
          onClick={() => setBannerMode(bannerMode === "dismissable" ? "none" : "dismissable")}
        >
          <Trans>Show dismissable banner</Trans>
        </Button>
        <Button
          variant={bannerMode === "cta" ? "default" : "outline"}
          onClick={() => setBannerMode(bannerMode === "cta" ? "none" : "cta")}
        >
          <Trans>Show banner with action</Trans>
        </Button>
      </div>
      {bannerMode !== "none" && <SampleBanner variant={bannerMode} onClose={() => setBannerMode("none")} />}
    </div>
  );
}
