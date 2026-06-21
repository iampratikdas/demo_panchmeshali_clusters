import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useAtom, useAtomValue } from 'jotai';
import { fetchContents, addContentMarks } from '../lib/api';
import { canUserGiveMarks, canUserViewMarks } from '../lib/contentMapper';
import { ContentCard } from '../components/ContentCard';
import { ContentMarkModal } from '../components/ContentMarkModal';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { Pagination } from '../components/Pagination';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import type { Content, ContentStatus } from '../types/content';
import { contentFilterAtom, currentPageAtom, currentUserAtom } from '../store/atoms';
import { Filter, Search } from 'lucide-react';

const PAGE_SIZE = 6;

export default function ContentList() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const user = useAtomValue(currentUserAtom);
    const [filter, setFilter] = useAtom(contentFilterAtom);
    const [currentPage, setCurrentPage] = useAtom(currentPageAtom);
    const [searchQuery, setSearchQuery] = useState('');
    const [markTarget, setMarkTarget] = useState<Content | null>(null);

    const role = user.role ?? '';
    const canGiveMarks = canUserGiveMarks(role);
    const canViewMarks = canUserViewMarks(role);
    const isReviewer = canGiveMarks;

    const { data, isLoading, isError } = useQuery({
        queryKey: ['contents', currentPage, filter, searchQuery, role],
        queryFn: () => fetchContents(
            currentPage,
            PAGE_SIZE,
            filter === 'all' ? undefined : filter as ContentStatus,
            searchQuery
        ),
    });

    const markMutation = useMutation({
        mutationFn: (payload: { marks: number; status: string }) =>
            addContentMarks({
                cont_id: markTarget!.id,
                marks: payload.marks,
                status: payload.status,
                eid: markTarget!.eid,
                event: !!markTarget!.eid,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contents'] });
            setMarkTarget(null);
        },
    });

    const initialMarks = markTarget
        ? markTarget.marks?.find((m) => m.uid === user.uid)?.score ?? 0
        : 0;

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
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                    {isReviewer ? 'Content Submissions' : 'My Content'}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                    {isReviewer
                        ? 'Review submissions and assign marks'
                        : 'View and manage your submissions'}
                </p>
            </div>

            <div className="glass-card rounded-xl p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search by name..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
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
            ) : isError ? (
                <div className="text-center py-12">
                    <p className="text-destructive">Failed to load content. Please try again.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {data?.data.map((content) => (
                            <ContentCard
                                key={content.id}
                                content={content}
                                canGiveMarks={canGiveMarks}
                                canViewMarks={canViewMarks}
                                currentUserUid={user.uid ?? undefined}
                                onGiveMarks={setMarkTarget}
                                onClick={() => navigate({ to: `/content/${content.id}` })}
                            />
                        ))}
                    </div>

                    {data && data.data.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">
                                {searchQuery ? 'No content found matching your search.' : 'No content found for this filter.'}
                            </p>
                        </div>
                    )}

                    {data && data.totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={data.totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </>
            )}

            <ContentMarkModal
                open={!!markTarget}
                content={markTarget}
                initialMarks={initialMarks}
                onClose={() => setMarkTarget(null)}
                onSubmit={(payload) => markMutation.mutate(payload)}
                isLoading={markMutation.isPending}
            />
        </div>
    );
}
