import type { TableRowSize } from "@repo/ui/components/Table";

import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Badge } from "@repo/ui/components/Badge";
import { Button } from "@repo/ui/components/Button";
import { Checkbox } from "@repo/ui/components/Checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@repo/ui/components/DropdownMenu";
import { TableCell, TableRow } from "@repo/ui/components/Table";
import { CopyIcon, EllipsisVerticalIcon, PencilIcon, Trash2Icon } from "lucide-react";

import type { SampleProduct } from "./sampleProductData";

import { statusVariant } from "./sampleProductData";

interface ProductRowProps {
  product: SampleProduct;
  index: number;
  isSelected: boolean;
  rowSize: TableRowSize;
  onSelect: (index: number) => void;
  formatDate: (date: string) => string;
  showCheckbox?: boolean;
  isChecked?: boolean;
  onToggleCheck?: () => void;
}

export function ProductRow({
  product,
  index,
  isSelected,
  rowSize,
  onSelect,
  formatDate,
  showCheckbox,
  isChecked,
  onToggleCheck
}: Readonly<ProductRowProps>) {
  return (
    <TableRow
      index={index}
      data-state={isSelected ? "selected" : undefined}
      className="cursor-pointer select-none"
      onClick={() => onSelect(index)}
    >
      {showCheckbox && (
        <TableCell onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isChecked ?? false}
            onCheckedChange={() => onToggleCheck?.()}
            aria-label={t`Select ${product.name}`}
          />
        </TableCell>
      )}
      <TableCell>
        {rowSize === "spacious" ? (
          <div className="flex flex-col">
            <span className="font-medium">{product.name}</span>
            <span className="text-sm text-muted-foreground">{product.description}</span>
          </div>
        ) : (
          <span className="font-medium">{product.name}</span>
        )}
      </TableCell>
      <TableCell>{product.category}</TableCell>
      <TableCell>${product.price}</TableCell>
      <TableCell>{formatDate(product.addedAt)}</TableCell>
      <TableCell>
        <Badge variant={statusVariant[product.status]}>{product.status}</Badge>
      </TableCell>
      <TableCell>
        <DropdownMenu trackingTitle="Product actions">
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" aria-label={t`Product actions`}>
                <EllipsisVerticalIcon className="size-5 text-muted-foreground" />
              </Button>
            }
          />
          <DropdownMenuContent>
            <DropdownMenuItem>
              <PencilIcon className="size-4" />
              <Trans>Edit product</Trans>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CopyIcon className="size-4" />
              <Trans>Duplicate</Trans>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <Trash2Icon className="size-4" />
              <Trans>Delete</Trans>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
