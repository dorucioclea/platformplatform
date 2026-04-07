import { Trans } from "@lingui/react/macro";
import { Button } from "@repo/ui/components/Button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@repo/ui/components/Empty";
import { Skeleton } from "@repo/ui/components/Skeleton";
import { LayoutDashboardIcon, PlusIcon, SearchIcon } from "lucide-react";

export function EmptySkeletonPreview() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h4>
          <Trans>Empty states</Trans>
        </h4>
        <div className="grid grid-cols-2 gap-6">
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
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchIcon />
              </EmptyMedia>
              <EmptyTitle>
                <Trans>No results found</Trans>
              </EmptyTitle>
              <EmptyDescription>
                <Trans>Try adjusting your search or filter to find what you are looking for.</Trans>
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h4>
          <Trans>Skeleton loading states</Trans>
        </h4>
        <div className="grid grid-cols-3 gap-6">
          <div className="flex flex-col gap-3 rounded-lg border p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-(--control-height) w-full" />
          </div>
          <div className="flex flex-col gap-3 rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="flex flex-col gap-3 rounded-lg border p-4">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-(--control-height) w-full" />
            <Skeleton className="h-(--control-height) w-full" />
            <Skeleton className="h-(--control-height) w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}
