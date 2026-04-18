import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Checkbox } from "@repo/ui/components/Checkbox";
import { TableHead, TableHeader, TableRow } from "@repo/ui/components/Table";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

type SortDirection = "ascending" | "descending";

interface TablePreviewHeaderProps {
  sortColumn: string;
  sortDirection: SortDirection;
  onSort: (column: string) => void;
  fixedColumns: boolean;
  showCheckboxes: boolean;
  multiSelect: boolean;
  allChecked: boolean;
  onToggleAll: () => void;
}

function SortIndicator({
  column,
  sortColumn,
  direction
}: {
  column: string;
  sortColumn: string;
  direction: SortDirection;
}) {
  if (column !== sortColumn) {
    return null;
  }
  return direction === "ascending" ? <ArrowUpIcon className="size-3.5" /> : <ArrowDownIcon className="size-3.5" />;
}

export function TablePreviewHeader({
  sortColumn,
  sortDirection,
  onSort,
  fixedColumns,
  showCheckboxes,
  multiSelect,
  allChecked,
  onToggleAll
}: Readonly<TablePreviewHeaderProps>) {
  return (
    <TableHeader>
      <TableRow>
        {showCheckboxes && (
          <TableHead className="w-[2.5rem]">
            {multiSelect && (
              <Checkbox
                checked={allChecked}
                onCheckedChange={onToggleAll}
                aria-label={t`Select all rows on this page`}
              />
            )}
          </TableHead>
        )}
        <TableHead data-column="name" onClick={() => onSort("name")}>
          <Trans>Product</Trans>
          <SortIndicator column="name" sortColumn={sortColumn} direction={sortDirection} />
        </TableHead>
        <TableHead data-column="category" onClick={() => onSort("category")}>
          <Trans>Category</Trans>
          <SortIndicator column="category" sortColumn={sortColumn} direction={sortDirection} />
        </TableHead>
        <TableHead
          data-column="price"
          className={fixedColumns ? "w-[7rem]" : undefined}
          onClick={() => onSort("price")}
        >
          <Trans>Price</Trans>
          <SortIndicator column="price" sortColumn={sortColumn} direction={sortDirection} />
        </TableHead>
        <TableHead
          data-column="addedAt"
          className={fixedColumns ? "w-[9rem]" : undefined}
          onClick={() => onSort("addedAt")}
        >
          <Trans>Added</Trans>
          <SortIndicator column="addedAt" sortColumn={sortColumn} direction={sortDirection} />
        </TableHead>
        <TableHead
          data-column="status"
          className={fixedColumns ? "w-[9rem]" : undefined}
          onClick={() => onSort("status")}
        >
          <Trans>Status</Trans>
          <SortIndicator column="status" sortColumn={sortColumn} direction={sortDirection} />
        </TableHead>
        <TableHead className="w-[3rem]" />
      </TableRow>
    </TableHeader>
  );
}
