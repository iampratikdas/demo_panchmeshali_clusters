import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const showEllipsisStart = currentPage > 3;
        const showEllipsisEnd = currentPage < totalPages - 2;

        // Always show first page
        pages.push(1);

        // Show ellipsis or pages near start
        if (showEllipsisStart) {
            pages.push('...');
        } else if (totalPages > 1) {
            pages.push(2);
        }

        // Show current page and neighbors
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            if (i > 1 && i < totalPages && !pages.includes(i)) {
                pages.push(i);
            }
        }

        // Show ellipsis or pages near end
        if (showEllipsisEnd) {
            pages.push('...');
        } else if (totalPages > 2 && !pages.includes(totalPages - 1)) {
            pages.push(totalPages - 1);
        }

        // Always show last page if more than 1 page
        if (totalPages > 1 && !pages.includes(totalPages)) {
            pages.push(totalPages);
        }

        return pages;
    };

    if (totalPages <= 1) return null;

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex items-center justify-center gap-1 mt-6">
            {/* Previous Button */}
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-10 w-10"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page Numbers */}
            {pageNumbers.map((page, index) => (
                <div key={`${page}-${index}`}>
                    {page === '...' ? (
                        <span className="px-3 py-2 text-sm text-muted-foreground">...</span>
                    ) : (
                        <Button
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="icon"
                            onClick={() => onPageChange(page as number)}
                            className={`h-10 w-10 ${currentPage === page ? 'pointer-events-none' : ''}`}
                        >
                            {page}
                        </Button>
                    )}
                </div>
            ))}

            {/* Next Button */}
            <Button
                variant="default"
                size="icon"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-10 w-10"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}
