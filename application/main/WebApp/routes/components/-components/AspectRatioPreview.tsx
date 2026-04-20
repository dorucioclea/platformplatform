import { Trans } from "@lingui/react/macro";
import { AspectRatio } from "@repo/ui/components/AspectRatio";
import { ImageIcon } from "lucide-react";

export function AspectRatioPreview() {
  return (
    <div className="flex flex-col gap-2">
      <h4>
        <Trans>Aspect ratio</Trans>
      </h4>
      <p className="text-sm text-muted-foreground">
        <Trans>Reserves a box at a fixed ratio so thumbnails stay aligned and the layout doesn't jump.</Trans>
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <RatioCard ratio={1} label="1 / 1 (square)" />
        <RatioCard ratio={4 / 3} label="4 / 3" />
        <RatioCard ratio={16 / 9} label="16 / 9" />
        <RatioCard ratio={3 / 4} label="3 / 4 (portrait)" />
      </div>
    </div>
  );
}

interface RatioCardProps {
  ratio: number;
  label: string;
}

function RatioCard({ ratio, label }: RatioCardProps) {
  return (
    <div className="flex flex-col gap-2">
      <AspectRatio ratio={ratio} className="overflow-hidden rounded-md border bg-card">
        <div className="flex h-full items-center justify-center text-muted-foreground">
          <ImageIcon className="size-10" />
        </div>
      </AspectRatio>
      <div className="text-center text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
