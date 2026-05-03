import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { fetchContents } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import {
    FileText,
    CheckCircle,
    Clock,
    XCircle,
    TrendingUp,
    Search,
    Image as ImageIcon,
    Smile,
    Calendar,
    MapPin,
    BarChart2,
    ListVideo
} from 'lucide-react';
import { useAtom } from 'jotai';
import { currentUserAtom } from '../store/atoms';
import { cn } from '../lib/utils';
import { useSounds } from '../utils/Sounds';
import { PublishersTab } from '../components/dashboard/PublishersTab';
import { NewsFeedTab } from '../components/dashboard/NewsFeedTab';

export default function Dashboard() {
    const { bootPlay } = useSounds();
    const [user] = useAtom(currentUserAtom);
    const [activeTab, setActiveTab] = useState<'analytics' | 'news-feed' | 'publishers'>('publishers');

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
        { title: 'Total Submissions', value: stats.total, icon: FileText, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
        { title: 'Approved', value: stats.approved, icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-500/10' },
        { title: 'Under Review', value: stats.underReview, icon: Clock, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
        { title: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-500/10' },
    ];

    const recentContent = contents.slice(0, 5);

    const renderAnalytics = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title} className="hover:shadow-md transition-shadow border border-border bg-white dark:bg-card rounded-xl">
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

            <Card className="border border-border bg-white dark:bg-card rounded-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <TrendingUp className="h-5 w-5" />
                        Recent Submissions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 sm:space-y-4">
                        {recentContent.map((content) => (
                            <div key={content.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors gap-2 sm:gap-0">
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
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f3f2ef] dark:bg-background pt-4 pb-12 sm:pt-6 px-0 sm:px-4 md:px-8 lg:px-0">
            <div className="flex flex-col lg:flex-row max-w-6xl mx-auto gap-6 lg:px-4">
                {/* Left Column (Main Feed) */}
                <div className="flex-1 lg:max-w-[65%] xl:max-w-[70%] space-y-4">

                    {/* Top Navigation Bar */}
                    <div className="bg-white dark:bg-white dark:bg-card rounded-xl border border-border flex justify-around overflow-hidden shadow-sm">
                        {/* <button
                            className={cn("flex-1 py-4 text-sm font-medium transition-colors hover:bg-accent/50 relative", activeTab === 'news-feed' ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground")}
                            onClick={() => setActiveTab('news-feed')}
                        >
                            For you
                            {activeTab === 'news-feed' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-green-600 rounded-t-full"></div>}
                        </button> */}
                        <button
                            className={cn("flex-1 py-4 text-sm font-medium transition-colors hover:bg-accent/50 relative", activeTab === 'publishers' ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground")}
                            onClick={() => setActiveTab('publishers')}
                        >
                            Following
                            {activeTab === 'publishers' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-green-600 rounded-t-full"></div>}
                        </button>
                        <button
                            className={cn("flex-1 py-4 text-sm font-medium transition-colors hover:bg-accent/50 relative", activeTab === 'analytics' ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground")}
                            onClick={() => setActiveTab('analytics')}
                        >
                            Analytics
                            {activeTab === 'analytics' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-green-600 rounded-t-full"></div>}
                        </button>
                    </div>

                    {/* What's happening input */}
                    {/* <div className="p-4 border border-border bg-white dark:bg-white dark:bg-card rounded-xl shadow-sm">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-slate-700 font-bold">
                                {user.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1">
                                <textarea
                                    placeholder="Start a post"
                                    className="w-full bg-transparent border border-muted-foreground/30 rounded-3xl px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground hover:bg-muted/10 focus:bg-background focus:ring-1 focus:ring-blue-500 transition-all font-medium outline-none resize-none"
                                    rows={1}
                                    onInput={(e) => {
                                        const target = e.target as HTMLTextAreaElement;
                                        target.style.height = 'auto';
                                        target.style.height = `${target.scrollHeight}px`;
                                    }}
                                ></textarea>
                            </div>
                        </div>
                        <div className="flex items-center justify-around mt-3 pt-1">
                            <button className="flex items-center gap-2 p-3 rounded-lg hover:bg-accent/50 transition-colors text-blue-600 font-medium text-sm">
                                <ImageIcon className="w-5 h-5" />
                                <span className="hidden sm:inline text-muted-foreground">Photo</span>
                            </button>
                            <button className="flex items-center gap-2 p-3 rounded-lg hover:bg-accent/50 transition-colors text-green-600 font-medium text-sm">
                                <ListVideo className="w-5 h-5" />
                                <span className="hidden sm:inline text-muted-foreground">Video</span>
                            </button>
                            <button className="flex items-center gap-2 p-3 rounded-lg hover:bg-accent/50 transition-colors text-orange-600 font-medium text-sm">
                                <BarChart2 className="w-5 h-5" />
                                <span className="hidden sm:inline text-muted-foreground">Poll</span>
                            </button>
                            <button className="flex items-center gap-2 p-3 rounded-lg hover:bg-accent/50 transition-colors text-red-500 font-medium text-sm">
                                <Calendar className="w-5 h-5" />
                                <span className="hidden sm:inline text-muted-foreground">Write article</span>
                            </button>
                        </div>
                    </div> */}

                    {/* Feed Content */}
                    <div className="space-y-4">
                        {activeTab === 'analytics' && renderAnalytics()}
                        {/* {activeTab === 'news-feed' && <NewsFeedTab />} */}
                        {activeTab === 'publishers' && <PublishersTab />}
                    </div>

                </div>

                {/* Right Column (Sidebar) */}
                <div className="hidden lg:flex flex-col w-[300px] xl:w-[350px] space-y-4">

                    {/* Search Bar */}
                    {/* Later features we can add this  */}
                    {/* <div className="bg-white dark:bg-white dark:bg-card  relative group rounded-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-foreground" />
                        <input
                            type="text"
                            placeholder="Search"
                            className="bg-white dark:bg-white dark:bg-card w-full bg-white dark:bg-card border border-border rounded-full py-2.5 pl-12 pr-4 outline-none focus:ring-1 focus:ring-foreground transition-all text-sm font-medium shadow-sm"
                        />
                    </div> */}

                    {/* Today's News */}
                    <div className="bg-white dark:bg-white dark:bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                        <h2 className="text-base font-bold p-4 pb-2 text-foreground">LinkedIn News</h2>

                        <div className="hover:bg-accent/50 p-4 py-2 cursor-pointer transition-colors">
                            <p className="font-bold text-sm text-foreground">Top tech & startup experts</p>
                            <p className="text-xs text-muted-foreground mt-0.5">1h ago · 4,241 readers</p>
                        </div>

                        <div className="hover:bg-accent/50 p-4 py-2 cursor-pointer transition-colors">
                            <p className="font-bold text-sm text-foreground">Global consumer firms tap India</p>
                            <p className="text-xs text-muted-foreground mt-0.5">1h ago</p>
                        </div>

                        <div className="hover:bg-accent/50 p-4 py-2 cursor-pointer transition-colors">
                            <p className="font-bold text-sm text-foreground">AI fuels Bollywood's next act</p>
                            <p className="text-xs text-muted-foreground mt-0.5">58m ago</p>
                        </div>

                        <button className="w-full text-left p-4 py-3 text-muted-foreground font-bold hover:bg-accent/50 cursor-pointer transition-colors text-sm rounded-b-xl">
                            Show more news
                        </button>
                    </div>

                    {/* Premium Box */}
                    <div className="bg-white dark:bg-card border border-border rounded-xl p-4 shadow-sm">
                        <h2 className="text-base font-bold mb-2 text-foreground">Subscribe to Premium</h2>
                        <p className="text-sm text-muted-foreground mb-4 leading-snug">
                            Get rid of ads, see your analytics, boost your replies and unlock 20+ features.
                        </p>
                        <button className="bg-blue-600 text-white font-bold py-1.5 px-4 rounded-full hover:bg-blue-700 transition-colors text-sm w-full">
                            Retry Premium
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
