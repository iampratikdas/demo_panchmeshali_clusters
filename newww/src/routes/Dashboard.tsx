import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useMemo } from 'react';
import { fetchContents } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import {
    FileText,
    CheckCircle,
    Clock,
    XCircle,
    TrendingUp,
    BarChart2,
    Users2,
    CalendarDays,
} from 'lucide-react';
import { useAtom } from 'jotai';
import { currentUserAtom } from '../store/atoms';
import { cn } from '../lib/utils';
import { PublishersTab } from '../components/dashboard/PublishersTab';
import { ActiveEventsTab } from '../components/dashboard/ActiveEventsTab';
import { motion } from 'framer-motion';

type DashboardTab = 'analytics' | 'publishers' | 'active-events';

export default function Dashboard() {
    const [user] = useAtom(currentUserAtom);
    const isWriter = user.role === 'writer';
    const [activeTab, setActiveTab] = useState<DashboardTab>(isWriter ? 'publishers' : 'analytics');

    useEffect(() => {
        if (isWriter) setActiveTab('publishers');
    }, [isWriter]);

    const { data, isLoading } = useQuery({
        queryKey: ['contents'],
        queryFn: () => fetchContents(1, 100),
    });

    const tabs = useMemo(() => {
        const items: { id: DashboardTab; label: string; icon: typeof BarChart2 }[] = [];
        if (isWriter) {
            items.push({ id: 'publishers', label: 'Following', icon: Users2 });
            items.push({ id: 'active-events', label: 'Active Events', icon: CalendarDays });
        }
        items.push({ id: 'analytics', label: 'Analytics', icon: BarChart2 });
        return items;
    }, [isWriter]);

    if (isLoading) return <LoadingSkeleton />;

    const contents = data?.data || [];
    const stats = {
        total: contents.length,
        approved: contents.filter((c) => c.status === 'Approved').length,
        underReview: contents.filter((c) => c.status === 'Under Review').length,
        rejected: contents.filter((c) => c.status === 'Rejected').length,
    };

    const statCards = [
        { title: 'Total', value: stats.total, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-100' },
        { title: 'Approved', value: stats.approved, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-100' },
        { title: 'In Review', value: stats.underReview, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-100' },
        { title: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', ring: 'ring-red-100' },
    ];

    const recentContent = contents.slice(0, 5);

    const renderAnalytics = () => (
        <div className="space-y-4 sm:space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {statCards.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Card className={cn('border-0 shadow-sm ring-1', stat.ring, 'rounded-2xl overflow-hidden')}>
                                <CardContent className="p-4 sm:p-5">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="text-[11px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                {stat.title}
                                            </p>
                                            <p className="text-2xl sm:text-3xl font-bold mt-1 tabular-nums">{stat.value}</p>
                                        </div>
                                        <div className={cn('p-2.5 rounded-xl', stat.bg)}>
                                            <Icon className={cn('h-4 w-4 sm:h-5 sm:w-5', stat.color)} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-2xl">
                <CardHeader className="pb-3 px-4 sm:px-6 pt-5 sm:pt-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold">
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                        Recent Submissions
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 pb-5 sm:pb-6 pt-0">
                    <div className="space-y-2 sm:space-y-3">
                        {recentContent.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-6 text-center">No submissions yet.</p>
                        ) : (
                            recentContent.map((content) => (
                                <div
                                    key={content.id}
                                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm sm:text-base truncate">{content.title}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {new Date(content.createdAt).toLocaleDateString(undefined, {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[10px] sm:text-xs capitalize px-2 py-0.5 bg-white rounded-md text-muted-foreground ring-1 ring-slate-200">
                                            {content.type}
                                        </span>
                                        <span
                                            className={cn(
                                                'text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full',
                                                content.status === 'Approved' && 'bg-emerald-100 text-emerald-700',
                                                content.status === 'Rejected' && 'bg-red-100 text-red-700',
                                                content.status === 'Under Review' && 'bg-amber-100 text-amber-700',
                                                content.status === 'Submitted' && 'bg-blue-100 text-blue-700'
                                            )}
                                        >
                                            {content.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-5 pb-8">
            {/* Welcome strip */}
            <div className="px-1 sm:px-0">
                <p className="text-sm text-muted-foreground">
                    Welcome back,{' '}
                    <span className="font-semibold text-foreground">{user.name || 'Writer'}</span>
                </p>
            </div>

            {/* Tab bar — scrollable on mobile */}
            <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
                <div className="inline-flex sm:flex w-max sm:w-full min-w-full sm:min-w-0 gap-1 p-1 bg-white rounded-2xl shadow-sm ring-1 ring-slate-100">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    'flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap touch-manipulation',
                                    active
                                        ? 'bg-slate-900 text-white shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-slate-50'
                                )}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab content */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
            >
                {activeTab === 'analytics' && renderAnalytics()}
                {activeTab === 'publishers' && <PublishersTab />}
                {activeTab === 'active-events' && <ActiveEventsTab />}
            </motion.div>
        </div>
    );
}
