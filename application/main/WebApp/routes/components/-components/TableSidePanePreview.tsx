import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Avatar, AvatarFallback } from "@repo/ui/components/Avatar";
import { Badge } from "@repo/ui/components/Badge";
import { Button } from "@repo/ui/components/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@repo/ui/components/DropdownMenu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/Table";
import { TablePagination } from "@repo/ui/components/TablePagination";
import { useFormatDate } from "@repo/ui/hooks/useSmartDate";
import { ArrowDownIcon, ArrowUpIcon, EllipsisVerticalIcon, SettingsIcon, Trash2Icon, UserIcon } from "lucide-react";
import { useState } from "react";

import type { SampleUser } from "./sampleUserData";

import { pageSize, roleVariant, sampleUsers } from "./sampleUserData";
import { UserDetailsSidePane } from "./UserDetailsSidePane";

type SortDirection = "ascending" | "descending";

function SortIndicator({ direction }: Readonly<{ direction: SortDirection }>) {
  return direction === "ascending" ? <ArrowUpIcon className="size-3.5" /> : <ArrowDownIcon className="size-3.5" />;
}

export function TableSidePanePreview() {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("ascending");
  const [selectedUser, setSelectedUser] = useState<SampleUser | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const formatDate = useFormatDate();

  const sortedUsers = [...sampleUsers].sort((a, b) => {
    const aValue = a[sortColumn as keyof SampleUser];
    const bValue = b[sortColumn as keyof SampleUser];
    const comparison = String(aValue).localeCompare(String(bValue));
    return sortDirection === "ascending" ? comparison : -comparison;
  });

  const totalPages = Math.ceil(sortedUsers.length / pageSize);
  const paginatedUsers = sortedUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "ascending" ? "descending" : "ascending");
    } else {
      setSortColumn(column);
      setSortDirection("ascending");
    }
  };

  const handleRowClick = (user: SampleUser, index: number) => {
    setSelectedUser(user);
    setSelectedIndex(index);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h4>
          <Trans>Table with sorting and pagination</Trans>
        </h4>
        <Table
          rowSize="compact"
          aria-label={t`Users`}
          selectedIndex={selectedIndex}
          onNavigate={(index) => handleRowClick(paginatedUsers[index], index)}
          onActivate={(index) => handleRowClick(paginatedUsers[index], index)}
        >
          <TableHeader>
            <TableRow>
              <TableHead data-column="name" onClick={() => handleSort("name")}>
                <Trans>Name</Trans>
                {sortColumn === "name" && <SortIndicator direction={sortDirection} />}
              </TableHead>
              <TableHead data-column="email" onClick={() => handleSort("email")}>
                <Trans>Email</Trans>
                {sortColumn === "email" && <SortIndicator direction={sortDirection} />}
              </TableHead>
              <TableHead data-column="createdAt" onClick={() => handleSort("createdAt")}>
                <Trans>Created</Trans>
                {sortColumn === "createdAt" && <SortIndicator direction={sortDirection} />}
              </TableHead>
              <TableHead data-column="role" onClick={() => handleSort("role")}>
                <Trans>Role</Trans>
                {sortColumn === "role" && <SortIndicator direction={sortDirection} />}
              </TableHead>
              <TableHead className="w-[3rem]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.map((user, index) => (
              <TableRow
                key={user.id}
                index={index}
                data-state={selectedUser?.id === user.id ? "selected" : undefined}
                className={`cursor-pointer select-none ${selectedUser?.id === user.id ? "bg-active-background hover:bg-active-background" : "hover:bg-hover-background"}`}
                onClick={() => handleRowClick(user, index)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback className="text-xs">{user.initials}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell>
                  <Badge variant={roleVariant[user.role]}>{user.role}</Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu trackingTitle="User actions">
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon" tabIndex={-1} aria-label={t`User actions`}>
                          <EllipsisVerticalIcon className="size-5 text-muted-foreground" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleRowClick(user, index)}>
                        <UserIcon className="size-4" />
                        <Trans>View profile</Trans>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <SettingsIcon className="size-4" />
                        <Trans>Change role</Trans>
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
            ))}
          </TableBody>
        </Table>
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          previousLabel={t`Previous`}
          nextLabel={t`Next`}
          trackingTitle="Component preview users"
          className="w-full"
        />
      </div>

      <div className="flex flex-col gap-2">
        <h4>
          <Trans>Side pane</Trans>
        </h4>
        <p className="text-sm text-muted-foreground">
          <Trans>Click a row in the table above to open the side pane.</Trans>
        </p>
      </div>

      <UserDetailsSidePane
        user={selectedUser}
        onClose={() => {
          setSelectedUser(null);
          setSelectedIndex(-1);
        }}
      />
    </div>
  );
}
