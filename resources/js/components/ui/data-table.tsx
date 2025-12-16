import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  sortable?: boolean;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
  headerClassName?: string;
  sortKey?: string; // Key to use for sorting
  sortable?: boolean;
}

export function DataTable<T extends { id?: number | string }>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  sortable = false,
  sortField,
  sortDirection,
  onSort,
}: DataTableProps<T>) {
  const getCellValue = (row: T, column: Column<T>) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(row);
    }
    return row[column.accessor] as React.ReactNode;
  };

  const handleSort = (column: Column<T>) => {
    if (!sortable || !onSort || !column.sortable || !column.sortKey) return;
    onSort(column.sortKey);
  };

  const getSortIcon = (column: Column<T>) => {
    if (!sortable || !column.sortable || !column.sortKey) return null;
    
    const isActive = sortField === column.sortKey;
    
    if (!isActive) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    }
    
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  if (loading) {
    return (
      <div className="rounded-md border">
        <table className="w-full caption-bottom text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              {columns.map((column, idx) => (
                <th
                  key={idx}
                  className={cn(
                    'h-12 px-4 text-left align-middle font-medium text-muted-foreground',
                    column.headerClassName
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, rowIdx) => (
              <tr key={rowIdx} className="border-b">
                {columns.map((column, colIdx) => (
                  <td key={colIdx} className={cn('p-4 align-middle', column.className)}>
                    {colIdx === 0 ? (
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ) : colIdx === columns.length - 1 ? (
                      <div className="flex gap-1 justify-end">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    ) : (
                      <Skeleton className="h-4 w-full max-w-[200px]" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center text-muted-foreground">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={cn(
                    'px-4 py-3 text-left text-sm font-medium text-muted-foreground',
                    column.headerClassName,
                    sortable && column.sortable && 'cursor-pointer select-none hover:bg-muted'
                  )}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center">
                    {column.header}
                    {getSortIcon(column)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'hover:bg-muted/50 transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={cn('px-4 py-3 text-sm', column.className)}
                  >
                    {getCellValue(row, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
