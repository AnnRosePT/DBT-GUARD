import React from 'react';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render: (item: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  selectedIds?: string[];
  onSelectRow?: (id: string) => void;
  onSelectAll?: () => void;
  onRowClick?: (item: T) => void;
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  totalItems?: number;
  emptyMessage?: string;
  isLoading?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyField,
  selectedIds,
  onSelectRow,
  onSelectAll,
  onRowClick,
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  totalItems,
  emptyMessage = 'No records found matching current criteria.',
  isLoading = false,
}: DataTableProps<T>) {
  const isAllSelected =
    data.length > 0 && selectedIds && data.every((item) => selectedIds.includes(String(item[keyField])));

  return (
    <div className="w-full bg-surface-card rounded-lg border border-border-subtle shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-primary text-on-primary font-label-sm text-[12px] uppercase tracking-wider border-b border-primary/40">
              {onSelectAll && (
                <th className="py-3 px-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={onSelectAll}
                    className="w-4 h-4 rounded text-secondary focus:ring-secondary cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`py-3 px-3.5 font-bold ${col.headerClassName || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle/60 text-body-sm font-body-sm text-on-surface">
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length + (onSelectAll ? 1 : 0)}
                  className="py-12 text-center text-on-surface-variant"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[32px] text-secondary animate-spin">
                      sync
                    </span>
                    <span>Loading docket records...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onSelectAll ? 1 : 0)}
                  className="py-12 text-center text-on-surface-variant"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[36px] text-outline">
                      folder_open
                    </span>
                    <span className="font-medium text-body-md">{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const itemId = String(item[keyField]);
                const isSelected = selectedIds?.includes(itemId);

                return (
                  <tr
                    key={itemId}
                    onClick={() => onRowClick && onRowClick(item)}
                    className={`transition-colors hover:bg-surface-container-low/60 ${
                      onRowClick ? 'cursor-pointer' : ''
                    } ${isSelected ? 'bg-secondary-fixed/20' : index % 2 === 1 ? 'bg-surface-container-lowest' : 'bg-surface-card'}`}
                  >
                    {onSelectRow && (
                      <td
                        className="py-3 px-3.5 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onSelectRow(itemId)}
                          className="w-4 h-4 rounded text-secondary focus:ring-secondary cursor-pointer"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`py-3 px-3.5 align-middle ${col.className || ''}`}
                      >
                        {col.render(item, index)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {(onPageChange || totalItems !== undefined) && (
        <div className="px-space-md py-3 bg-surface-container-low/40 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3 text-label-sm font-medium text-on-surface-variant">
          <div className="flex items-center gap-2">
            {onPageSizeChange && (
              <div className="flex items-center gap-1.5">
                <span>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                  className="bg-surface-card border border-border-subtle rounded px-2 py-1 text-on-surface focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            )}
            {totalItems !== undefined && (
              <span>
                Showing <strong>{Math.min(data.length, pageSize)}</strong> of <strong>{totalItems}</strong> records
              </span>
            )}
          </div>

          {onPageChange && totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="px-2.5 py-1 rounded border border-border-subtle bg-surface-card hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <span className="px-2 text-on-surface font-bold">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="px-2.5 py-1 rounded border border-border-subtle bg-surface-card hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
