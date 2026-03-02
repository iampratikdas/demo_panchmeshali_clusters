import { useQuery } from '@tanstack/react-query';
import { fetchContents } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import {
    FileText,
    CheckCircle,
    Clock,
    XCircle,
    TrendingUp
} from 'lucide-react';
import { useAtom } from 'jotai';
import { currentUserAtom } from '../store/atoms';
import { cn } from '../lib/utils';

export default function Dashboard() {
    const [user] = useAtom(currentUserAtom);
    const { data, isLoading } = useQuery({
        queryKey: ['contents'],
        queryFn: () => fetchContents(1, 100),
    });

    if (isLoading) {
        return <LoadingSkeleton />;
    }

    const contents = data?.data || [];
    const stats = {
        total: contents.length,
        approved: contents.filter(c => c.status === 'Approved').length,
        underReview: contents.filter(c => c.status === 'Under Review').length,
        rejected: contents.filter(c => c.status === 'Rejected').length,
    };

    const statCards = [
        {
            title: 'Total Submissions',
            value: stats.total,
            icon: FileText,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
        },
        {
            title: 'Approved',
            value: stats.approved,
            icon: CheckCircle,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
        },
        {
            title: 'Under Review',
            value: stats.underReview,
            icon: Clock,
            color: 'text-yellow-500',
            bgColor: 'bg-yellow-500/10',
        },
        {
            title: 'Rejected',
            value: stats.rejected,
            icon: XCircle,
            color: 'text-red-500',
            bgColor: 'bg-red-500/10',
        },
    ];

    const recentContent = contents.slice(0, 5);

    return (
        <div className="space-y-6 sm:space-y-8">
            <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                    Welcome back, {user.name}! 👋
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                    Here's an overview of your submissions
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </CardTitle>
                                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                    <Icon className={`h-4 w-4 ${stat.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl sm:text-3xl font-bold">{stat.value}</div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <TrendingUp className="h-5 w-5" />
                        Recent Submissions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 sm:space-y-4">
                        {recentContent.map((content) => (
                            <div
                                key={content.id}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg hover:bg-accent transition-colors gap-2 sm:gap-0"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm sm:text-base truncate">{content.title}</p>
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                        {new Date(content.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="text-xs text-muted-foreground capitalize px-2 py-1 bg-muted rounded">
                                        {content.type}
                                    </span>
                                    <div className={cn(
                                        'text-xs sm:text-sm font-medium px-2 py-1 rounded',
                                        content.status === 'Approved' && 'text-green-600 bg-green-100',
                                        content.status === 'Rejected' && 'text-red-600 bg-red-100',
                                        content.status === 'Under Review' && 'text-yellow-600 bg-yellow-100',
                                        content.status === 'Submitted' && 'text-blue-600 bg-blue-100'
                                    )}>
                                        {content.status}
                                    </div>
                                </div>
                            </div>
                        ))}</div>
                </CardContent>
            </Card>
        </div>
    );
}
