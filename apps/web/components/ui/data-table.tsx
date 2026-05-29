'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { EmptyState } from './empty-state';

interface Column<T> {
  key: string;
  header: string | React.ReactNode;
  cell?: (item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onEmptyAction?: () => void;
  emptyActionLabel?: string;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  isLoading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no records to display at this time.',
  onEmptyAction,
  emptyActionLabel,
}: DataTableProps<T>) {
  
  if (isLoading) {
    return (
      <div className="border rounded-lg overflow-hidden animate-pulse bg-white dark:bg-gray-900">
        <div className="h-12 bg-gray-100 dark:bg-gray-800 border-b"></div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex p-4 border-b border-gray-100 dark:border-gray-800">
            {columns.map((_, colIdx) => (
              <div key={colIdx} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mx-2"></div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        onAction={onEmptyAction}
        actionLabel={emptyActionLabel}
      />
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-900">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} className={col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              {columns.map((col) => (
                <TableCell key={col.key} className={col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''}>
                  {col.cell ? col.cell(item) : (item as any)[col.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
