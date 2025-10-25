"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  pageSize?: number;
}

export function DataTableBagian<TData, TValue>({
  columns,
  data,
  loading = false,
  pageSize = 7,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  const colWidths = columns.map((c) => (c.meta as any)?.width ?? undefined);

  const pageIdx = table.getState().pagination.pageIndex;
  const pSize = table.getState().pagination.pageSize;
  const totalRows = data.length;
  const from = totalRows === 0 ? 0 : pageIdx * pSize + 1;
  const to = Math.min((pageIdx + 1) * pSize, totalRows);

  if (loading) {
    return (
      <div className="w-full rounded-md border">
        <div className="w-full overflow-x-auto">
          <Table
            className="w-full min-w-max text-xs md:text-sm bg-white"
            style={{ minWidth: "400px" }}
          >
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="whitespace-nowrap text-xs md:text-sm text-center px-4"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, cellIndex) => (
                    <TableCell
                      key={cellIndex}
                      className="whitespace-nowrap h-12 text-xs md:text-sm text-center px-4"
                    >
                      <div className="animate-pulse bg-gray-200 h-4 rounded mx-auto w-24"></div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <div className="w-full rounded-md border bg-white">
        <div className="w-full overflow-x-auto">
          <Table
            className="w-full min-w-max text-xs md:text-sm bg-white"
            style={{ minWidth: "400px", tableLayout: "fixed" }}
          >
            {colWidths && colWidths.length > 0 ? (
              <colgroup>
                {colWidths.map((w, i) => (
                  <col
                    key={i}
                    style={w ? { width: w, maxWidth: w } : undefined}
                  />
                ))}
              </colgroup>
            ) : null}

            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="whitespace-nowrap text-center text-xs md:text-sm px-2 md:px-4 truncate overflow-hidden"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="whitespace-nowrap text-center text-xs md:text-sm px-2 md:px-4 truncate overflow-hidden"
                        title={String(cell.getValue() ?? "")}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-16 text-center text-xs md:text-sm"
                  >
                    Tidak ada data.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0 md:space-x-2">
        <div className="text-xs md:text-sm text-muted-foreground">
          {`Showing ${from} to ${to} of ${totalRows} entries`}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className={`text-xs md:text-sm ${
              table.getCanPreviousPage()
                ? "bg-navy-100 hover:bg-navy-400 text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Previous
          </Button>
          <span className="text-xs md:text-sm">{pageIdx + 1}</span>
          <Button
            variant="default"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className={`text-xs md:text-sm ${
              table.getCanNextPage()
                ? "bg-navy-100 hover:bg-navy-400 text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
