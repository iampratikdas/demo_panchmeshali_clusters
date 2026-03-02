import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { fetchContents } from '../lib/api';
import { ContentCard } from '../components/ContentCard';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { Pagination } from '../components/Pagination';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import type { ContentStatus } from '../types/content';
import { useAtom } from 'jotai';
import { contentFilterAtom, currentPageAtom } from '../store/atoms';
import { Filter, Search } from 'lucide-react';

export default function ContentList() {
    const navigate = useNavigate();
    const [filter, setFilter] = useAtom(contentFilterAtom);
    const [currentPage, setCurrentPage] = useAtom(currentPageAtom);
    const [searchQuery, setSearchQuery] = useState('');
    const pageSize = 6;

    const { data, isLoading } = useQuery({
        queryKey: ['contents', currentPage, filter],
        queryFn: () => fetchContents(
            currentPage,
            pageSize,
            filter === 'all' ? undefined : filter as ContentStatus
        ),
    });

    // Client-side search filtering
    const filteredData = data && searchQuery
        ? {
            ...data,
            data: data.data.filter(content =>
                content.title.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }
        : data;

    const filters: Array<ContentStatus | 'all'> = [
        'all',
        'Submitted',
        'Under Review',
        'Approved',
        'Rejected',
    ];

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">My Content</h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                    View and manage your submissions
                </p>
            </div>

            {/* Search Bar */}
            <div className="glass-card rounded-xl p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs sm:text-sm font-medium mr-2">Filter:</span>
                {filters.map((f) => (
                    <Button
                        key={f}
                        variant={filter === f ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                            setFilter(f);
                            setCurrentPage(1);
                        }}
                        className="h-9 text-xs sm:text-sm"
                    >
                        {f === 'all' ? 'All' : f}
                    </Button>
                ))}
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {[...Array(6)].map((_, i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {filteredData?.data.map((content) => (
                            <ContentCard
                                key={content.id}
                                content={content}
                                onClick={() => navigate({ to: `/content/${content.id}` })}
                            />
                        ))}
                    </div>

                    {filteredData && filteredData.data.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">
                                {searchQuery ? 'No content found matching your search.' : 'No content found for this filter.'}
                            </p>
                        </div>
                    )}

                    {data && data.totalPages > 1 && !searchQuery && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={data.totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </>
            )}
        </div>
    );
}
