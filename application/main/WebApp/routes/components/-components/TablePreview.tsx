import type { TableRowSize } from "@repo/ui/components/Table";

import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Checkbox } from "@repo/ui/components/Checkbox";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@repo/ui/components/Table";
import { TablePagination } from "@repo/ui/components/TablePagination";
import { useFormatDate } from "@repo/ui/hooks/useSmartDate";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { useState } from "react";

import type { SampleProduct } from "./sampleProductData";

import { ProductRow } from "./ProductRow";
import { pageSize, sampleProducts } from "./sampleProductData";
import { TablePreviewToolbar } from "./TablePreviewToolbar";

type SortDirection = "ascending" | "descending";

interface TablePreviewProps {
  onProductSelect?: (product: SampleProduct | null) => void;
}

function SortIndicator({ direction }: Readonly<{ direction: SortDirection }>) {
  return direction === "ascending" ? <ArrowUpIcon className="size-3.5" /> : <ArrowDownIcon className="size-3.5" />;
}

export function TablePreview({ onProductSelect }: TablePreviewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("ascending");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [rowSize, setRowSize] = useState<TableRowSize>("compact");
  const [fixedColumns, setFixedColumns] = useState(false);
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [multiSelect, setMultiSelect] = useState(false);
  const [checkedIds, setCheckedIds] = useState<number[]>([]);
  const formatDate = useFormatDate();

  const sortedProducts = [...sampleProducts].sort((a, b) => {
    const aValue = a[sortColumn as keyof SampleProduct];
    const bValue = b[sortColumn as keyof SampleProduct];
    const comparison = String(aValue).localeCompare(String(bValue));
    return sortDirection === "ascending" ? comparison : -comparison;
  });

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

  const handleRowSelect = (index: number) => {
    setSelectedIndex(index);
    const product = paginatedProducts[index];
    onProductSelect?.(product);
  };

  const toggleCheck = (productId: number) => {
    setCheckedIds((prev) => {
      if (multiSelect) {
        return prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId];
      }
      return prev.includes(productId) ? [] : [productId];
    });
  };

  const pageIds = paginatedProducts.map((p) => p.id);
  const allChecked = pageIds.length > 0 && pageIds.every((id) => checkedIds.includes(id));
  const toggleAll = () => {
    setCheckedIds((prev) =>
      allChecked ? prev.filter((id) => !pageIds.includes(id)) : [...new Set([...prev, ...pageIds])]
    );
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
        onShowCheckboxesChange={(checked) => {
          setShowCheckboxes(checked);
          if (!checked) setCheckedIds([]);
        }}
        multiSelect={multiSelect}
        onMultiSelectChange={(checked) => {
          setMultiSelect(checked);
          if (!checked && checkedIds.length > 1) setCheckedIds([checkedIds[0]]);
        }}
      />
      <Table rowSize={rowSize} aria-label={t`Products`} selectedIndex={selectedIndex} onNavigate={handleRowSelect}>
        <TableHeader>
          <TableRow>
            {showCheckboxes && (
              <TableHead className="w-[2.5rem]">
                {multiSelect && (
                  <Checkbox
                    checked={allChecked}
                    onCheckedChange={toggleAll}
                    aria-label={t`Select all rows on this page`}
                  />
                )}
              </TableHead>
            )}
            <TableHead data-column="name" onClick={() => handleSort("name")}>
              <Trans>Product</Trans>
              {sortColumn === "name" && <SortIndicator direction={sortDirection} />}
            </TableHead>
            <TableHead data-column="category" onClick={() => handleSort("category")}>
              <Trans>Category</Trans>
              {sortColumn === "category" && <SortIndicator direction={sortDirection} />}
            </TableHead>
            <TableHead
              data-column="price"
              className={fixedColumns ? "w-[7rem]" : undefined}
              onClick={() => handleSort("price")}
            >
              <Trans>Price</Trans>
              {sortColumn === "price" && <SortIndicator direction={sortDirection} />}
            </TableHead>
            <TableHead
              data-column="addedAt"
              className={fixedColumns ? "w-[9rem]" : undefined}
              onClick={() => handleSort("addedAt")}
            >
              <Trans>Added</Trans>
              {sortColumn === "addedAt" && <SortIndicator direction={sortDirection} />}
            </TableHead>
            <TableHead
              data-column="status"
              className={fixedColumns ? "w-[9rem]" : undefined}
              onClick={() => handleSort("status")}
            >
              <Trans>Status</Trans>
              {sortColumn === "status" && <SortIndicator direction={sortDirection} />}
            </TableHead>
            <TableHead className="w-[3rem]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedProducts.map((product, index) => (
            <ProductRow
              key={product.id}
              product={product}
              index={index}
              isSelected={index === selectedIndex}
              rowSize={rowSize}
              onSelect={handleRowSelect}
              formatDate={formatDate}
              showCheckbox={showCheckboxes}
              isChecked={checkedIds.includes(product.id)}
              onToggleCheck={() => toggleCheck(product.id)}
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
