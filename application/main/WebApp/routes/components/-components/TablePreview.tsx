import type { RowKey, TableRowSize } from "@repo/ui/components/Table";

import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Table, TableBody } from "@repo/ui/components/Table";
import { TablePagination } from "@repo/ui/components/TablePagination";
import { useFormatDate } from "@repo/ui/hooks/useSmartDate";
import { useEffect, useMemo, useState } from "react";

import type { SampleProduct } from "./sampleProductData";

import { ProductRow } from "./ProductRow";
import { pageSize, sampleProducts } from "./sampleProductData";
import { TablePreviewHeader } from "./TablePreviewHeader";
import { TablePreviewToolbar } from "./TablePreviewToolbar";

type SortDirection = "ascending" | "descending";

interface TablePreviewProps {
  selectedProduct?: SampleProduct | null;
  onProductSelect?: (product: SampleProduct | null) => void;
  onSelectedProductsChange?: (products: SampleProduct[]) => void;
  onSummaryPaneChange?: (enabled: boolean) => void;
}

export function TablePreview({
  selectedProduct,
  onProductSelect,
  onSelectedProductsChange,
  onSummaryPaneChange
}: TablePreviewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("ascending");
  const [rowSize, setRowSize] = useState<TableRowSize>("compact");
  const [fixedColumns, setFixedColumns] = useState(false);
  const [showCheckboxes, setShowCheckboxes] = useState(true);
  const [multiSelect, setMultiSelect] = useState(true);
  const [summaryPane, setSummaryPane] = useState(true);
  const [selectedKeys, setSelectedKeys] = useState<ReadonlySet<RowKey>>(() => new Set());
  const formatDate = useFormatDate();

  useEffect(() => {
    const selected = sampleProducts.filter((product) => selectedKeys.has(product.id));
    onSelectedProductsChange?.(selected);
  }, [selectedKeys, onSelectedProductsChange]);

  // Dependent toggles (Show checkboxes, Summary pane) stay disabled rather than unchecked when
  // Multi-select flips off, so turning Multi-select back on restores the previous preview. The
  // effective booleans below mirror that pattern.
  const effectiveShowCheckboxes = multiSelect && showCheckboxes;
  const effectiveSummaryPane = multiSelect && summaryPane;

  useEffect(() => {
    onSummaryPaneChange?.(effectiveSummaryPane);
  }, [effectiveSummaryPane, onSummaryPaneChange]);

  const sortedProducts = useMemo(
    () =>
      [...sampleProducts].sort((a, b) => {
        const aValue = a[sortColumn as keyof SampleProduct];
        const bValue = b[sortColumn as keyof SampleProduct];
        const comparison =
          typeof aValue === "number" && typeof bValue === "number"
            ? aValue - bValue
            : String(aValue).localeCompare(String(bValue));
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
      setSelectedKeys((prev) => {
        const first = prev.values().next().value;
        return first != null ? new Set<RowKey>([first]) : new Set<RowKey>();
      });
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
        <Trans>
          Click a row to open the side pane. Use Shift or Cmd/Ctrl with click or arrow keys to multi-select, Enter to
          open, and Space to toggle the selection.
        </Trans>
      </p>
      <TablePreviewToolbar
        fixedColumns={fixedColumns}
        setFixedColumns={setFixedColumns}
        rowSize={rowSize}
        setRowSize={setRowSize}
        showCheckboxes={showCheckboxes}
        onShowCheckboxesChange={setShowCheckboxes}
        multiSelect={multiSelect}
        onMultiSelectChange={handleMultiSelectChange}
        summaryPane={summaryPane}
        onSummaryPaneChange={setSummaryPane}
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
          showCheckboxes={effectiveShowCheckboxes}
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
              showCheckbox={effectiveShowCheckboxes}
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
