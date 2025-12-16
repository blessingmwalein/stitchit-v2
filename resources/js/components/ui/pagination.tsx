import React from 'react';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
  onPageChange?: (page: number) => void;
  baseUrl?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  lastPage,
  total,
  perPage,
  onPageChange,
  baseUrl,
}) => {
  if (lastPage <= 1) return null;

  const startItem = (currentPage - 1) * perPage + 1;
  const endItem = Math.min(currentPage * perPage, total);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (lastPage <= maxVisible) {
      for (let i = 1; i <= lastPage; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(lastPage - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < lastPage - 2) {
        pages.push('...');
      }

      pages.push(lastPage);
    }

    return pages;
  };

  const handlePageClick = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            'relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md',
            currentPage === 1
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-background text-foreground hover:bg-muted'
          )}
        >
          Previous
        </button>
        <button
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === lastPage}
          className={cn(
            'ml-3 relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md',
            currentPage === lastPage
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-background text-foreground hover:bg-muted'
          )}
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{startItem}</span> to{' '}
            <span className="font-medium">{endItem}</span> of{' '}
            <span className="font-medium">{total}</span> results
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => handlePageClick(currentPage - 1)}
              disabled={currentPage === 1}
              className={cn(
                'relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium',
                currentPage === 1
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-background text-foreground hover:bg-muted'
              )}
            >
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            {getPageNumbers().map((page, index) => {
              if (page === '...') {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="relative inline-flex items-center px-4 py-2 border text-sm font-medium bg-background text-muted-foreground"
                  >
                    ...
                  </span>
                );
              }

              const pageNum = page as number;
              const isActive = pageNum === currentPage;

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageClick(pageNum)}
                  className={cn(
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                    isActive
                      ? 'z-10 bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground hover:bg-muted'
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => handlePageClick(currentPage + 1)}
              disabled={currentPage === lastPage}
              className={cn(
                'relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium',
                currentPage === lastPage
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-background text-foreground hover:bg-muted'
              )}
            >
              <span className="sr-only">Next</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};
