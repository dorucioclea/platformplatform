import { t } from "@lingui/core/macro";
import { Plural, Trans } from "@lingui/react/macro";
import { Button } from "@repo/ui/components/Button";
import { SidePane, SidePaneBody, SidePaneFooter, SidePaneHeader } from "@repo/ui/components/SidePane";
import { Trash2Icon } from "lucide-react";

import type { SampleDish } from "./sampleDishData";

import { formatCookTime } from "./sampleDishData";

interface DishMultiSelectSidePaneProps {
  dishes: SampleDish[];
  isOpen: boolean;
}

export function DishMultiSelectSidePane({ dishes, isOpen }: DishMultiSelectSidePaneProps) {
  const totalMinutes = dishes.reduce((sum, dish) => sum + dish.cookTime, 0);

  return (
    <SidePane
      isOpen={isOpen}
      // No-op: the summary pane is not dismissable -- it is driven purely by the current selection
      // state. Esc and backdrop clicks should not close it.
      onOpenChange={() => {}}
      trackingTitle="Recipe selection summary"
      aria-label={t`Selected recipes`}
    >
      <SidePaneHeader showCloseButton={false}>
        <Trans>
          <Plural value={dishes.length} one="# recipe selected" other="# recipes selected" />
        </Trans>
      </SidePaneHeader>

      <SidePaneBody className="flex flex-col gap-4">
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3">
          <span className="text-sm text-muted-foreground">
            <Trans>Total cook time</Trans>
          </span>
          <span className="text-lg font-semibold">{formatCookTime(totalMinutes)}</span>
        </div>

        <ul className="flex flex-col gap-1">
          {dishes.map((dish) => (
            <li key={dish.id} className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm">
              <span className="truncate font-medium">{dish.name}</span>
              <span className="shrink-0 text-muted-foreground">{formatCookTime(dish.cookTime)}</span>
            </li>
          ))}
        </ul>
      </SidePaneBody>

      <SidePaneFooter>
        <Button variant="destructive" className="w-full" aria-label={t`Delete selected recipes`}>
          <Trash2Icon />
          <Trans>
            <Plural value={dishes.length} one="Delete # recipe" other="Delete # recipes" />
          </Trans>
        </Button>
      </SidePaneFooter>
    </SidePane>
  );
}
