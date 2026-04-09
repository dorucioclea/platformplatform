import { Trans } from "@lingui/react/macro";
import { Button } from "@repo/ui/components/Button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@repo/ui/components/Empty";
import { LayoutDashboardIcon, PlusIcon } from "lucide-react";

export function EmptyPreview() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <LayoutDashboardIcon />
        </EmptyMedia>
        <EmptyTitle>
          <Trans>No data yet</Trans>
        </EmptyTitle>
        <EmptyDescription>
          <Trans>There is nothing to display here. Create your first item to get started.</Trans>
        </EmptyDescription>
      </EmptyHeader>
      <Button>
        <PlusIcon />
        <Trans>Create item</Trans>
      </Button>
    </Empty>
  );
}
