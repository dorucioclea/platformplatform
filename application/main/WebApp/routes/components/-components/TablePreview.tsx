import type { RowKey, TableRowSize } from "@repo/ui/components/Table";

import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Table, TableBody } from "@repo/ui/components/Table";
import { TablePagination } from "@repo/ui/components/TablePagination";
import { useFormatDate } from "@repo/ui/hooks/useSmartDate";
import { useMemo, useState } from "react";

import type { SampleProduct } from "./sampleProductData";

import { ProductRow } from "./ProductRow";
import { pageSize, sampleProducts } from "./sampleProductData";
import { TablePreviewHeader } from "./TablePreviewHeader";
import { TablePreviewToolbar } from "./TablePreviewToolbar";

type SortDirection = "ascending" | "descending";

interface TablePreviewProps {
  selectedProduct?: SampleProduct | null;
  onProductSelect?: (product: SampleProduct | null) => void;
}

export function TablePreview({ selectedProduct, onProductSelect }: TablePreviewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("ascending");
  const [rowSize, setRowSize] = useState<TableRowSize>("compact");
  const [fixedColumns, setFixedColumns] = useState(false);
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [multiSelect, setMultiSelect] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<ReadonlySet<RowKey>>(() => new Set());
  const formatDate = useFormatDate();

  const sortedProducts = useMemo(
    () =>
      [...sampleProducts].sort((a, b) => {
        const aValue = a[sortColumn as keyof SampleProduct];
        const bValue = b[sortColumn as keyof SampleProduct];
        const comparison = String(aValue).localeCompare(String(bValue));
        return sortDirection === "ascending" ? comparison : -comparison;
      }),
    [sortColumn, sortDirection]
  );

  const totalPages = Math.ceil(sortedProducts.length / pageSize);
  const paginatedProducts = sortedProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "ascending" ? "descending" : "ascending");
    } else {
      setSortColumn(column);
      setSortDirection("ascending");
    }
  };

  const handleActivate = (key: RowKey) => {
    if (selectedProduct?.id === Number(key)) {
      onProductSelect?.(null);
      return;
    }
    const product = sampleProducts.find((p) => p.id === Number(key)) ?? null;
    onProductSelect?.(product);
  };

  const handleMultiSelectChange = (checked: boolean) => {
    setMultiSelect(checked);
    if (!checked) {
      setShowCheckboxes(false);
      setSelectedKeys((prev) => {
        const first = prev.values().next().value;
        return first != null ? new Set<RowKey>([first]) : new Set<RowKey>();
      });
    }
  };

  const handleShowCheckboxesChange = (checked: boolean) => {
    setShowCheckboxes(checked);
    if (checked) {
      setMultiSelect(true);
    }
  };

  const pageIds = paginatedProducts.map((p) => p.id);
  const allChecked = pageIds.length > 0 && pageIds.every((id) => selectedKeys.has(id));
  const toggleAll = () => {
    setSelectedKeys((prev) => {
      const next = new Set<RowKey>(prev);
      for (const id of pageIds) {
        if (allChecked) {
          next.delete(id);
        } else {
          next.add(id);
        }
      }
      return next;
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-2">
      <p className="text-sm text-muted-foreground">
        <Trans>Click a row to open the side pane.</Trans>
      </p>
      <TablePreviewToolbar
        fixedColumns={fixedColumns}
        setFixedColumns={setFixedColumns}
        rowSize={rowSize}
        setRowSize={setRowSize}
        showCheckboxes={showCheckboxes}
        onShowCheckboxesChange={handleShowCheckboxesChange}
        multiSelect={multiSelect}
        onMultiSelectChange={handleMultiSelectChange}
      />
      <Table
        rowSize={rowSize}
        aria-label={t`Products`}
        selectionMode={multiSelect ? "multiple" : "single"}
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        onActivate={handleActivate}
        activateOnNavigate={selectedProduct != null}
        scrollToKey={selectedProduct?.id}
      >
        <TablePreviewHeader
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          fixedColumns={fixedColumns}
          showCheckboxes={showCheckboxes}
          multiSelect={multiSelect}
          allChecked={allChecked}
          onToggleAll={toggleAll}
        />
        <TableBody>
          {paginatedProducts.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              rowSize={rowSize}
              formatDate={formatDate}
              showCheckbox={showCheckboxes}
              isChecked={selectedKeys.has(product.id)}
            />
          ))}
        </TableBody>
      </Table>
      <div className="mt-auto flex-shrink-0 pt-2">
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          previousLabel={t`Previous`}
          nextLabel={t`Next`}
          trackingTitle="Component preview products"
          className="w-full"
        />
      </div>
    </div>
  );
}
