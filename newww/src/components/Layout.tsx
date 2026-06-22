import type { ReactNode } from 'react';
// import type { ReactNode } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
// import { Link, useLocation, useRouterState } from '@tanstack/react-router';
// import { useIsFetching } from '@tanstack/react-query';
import { cn } from '../lib/utils';
import {
    Home,
    PenTool,
    FileText,
    Settings as SettingsIcon,
    Menu,
    X,
    User,
    Calendar,
    Users,
    MessageSquare,
    FolderOpen,
    SpellCheck2,
    Trophy,
    Loader2,
    Newspaper,
    Building,
    Users2
} from 'lucide-react';
import { Button } from '../ui/button';
import { useAtom } from 'jotai';
import { sidebarOpenAtom, currentUserAtom } from '../store/atoms';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { NotificationDropdown } from './NotificationDropdown';
import { Banner } from './Banner';
import { BookPreviewList } from './BookPreviewList';

interface LayoutProps {
    children: ReactNode;
}

const navItems = [
    { to: '/', label: 'Dashboard', icon: Home },
    { to: '/submit', label: 'Submit', icon: PenTool },
    { to: '/content', label: 'My Content', icon: FileText, badge: 4 },
    { to: '/events', label: 'Events', icon: Calendar },
    { to: '/users', label: 'Users', icon: Users },
    { to: '/chats', label: 'Chats', icon: MessageSquare, badge: 2 },
    { to: '/workspace', label: 'Workspace', icon: FolderOpen },
    { to: '/proofread', label: 'Proof Read Room', icon: SpellCheck2, roles: ['admin', 'manager', 'publisher'] },
    { to: '/rankings', label: 'Rank the Contents', icon: Trophy },
    { to: '/publish-preview', label: 'Book Publish Preview', icon: Newspaper, roles: ['admin', 'manager', 'publisher'] },
    { to: '/publishers', label: 'Publishers', icon: Building },
    { to: '/teams', label: 'Teams', icon: Users2, roles: ['publisher', 'writer', 'both'] },
];

const projectItems = [
    { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export function Layout({ children }: LayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useAtom(sidebarOpenAtom);
    const [user] = useAtom(currentUserAtom);
    const location = useLocation();
    // const routerIsLoading = useRouterState({ select: (s) => s.isLoading });
    // const isFetching = useIsFetching();
    const isLoading = false

    // Close sidebar on mobile by default on first load
    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    }, [setSidebarOpen]);

    // Close sidebar when route changes on mobile
    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            setSidebarOpen(false);
        }
    }, [location.pathname, setSidebarOpen]);

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

    const getBannerProps = (pathname: string) => {
        if (pathname.startsWith('/events')) return {
            title: 'Events',
            image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2940&auto=format&fit=crop'
        };
        if (pathname.startsWith('/content')) return {
            title: 'My Content',
            image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=2873&auto=format&fit=crop'
        };
        if (pathname.startsWith('/users')) return {
            title: 'Community',
            image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2832&auto=format&fit=crop'
        };
        if (pathname.startsWith('/chats')) return {
            title: 'Messages',
            image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=2874&auto=format&fit=crop'
        };
        if (pathname.startsWith('/submit')) return {
            title: 'Submit Your Work',
            image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2940&auto=format&fit=crop'
        };
        if (pathname.startsWith('/publish-preview')) return {
            title: 'Publish Your Work',
            image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2940&auto=format&fit=crop'
        };
        if (pathname.startsWith('/workspace')) return {
            title: 'Workspace',
            image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2940&auto=format&fit=crop'
        };
        if (pathname.startsWith('/settings')) return {
            title: 'Settings',
            image: 'https://images.unsplash.com/photo-1494783367193-149034c05e8f?q=80&w=2940&auto=format&fit=crop'
        };
        if (pathname.startsWith('/proofread')) return {
            title: 'Proof Read Room',
            image: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?q=80&w=2940&auto=format&fit=crop'
        };
        if (pathname.startsWith('/rankings')) return {
            title: 'Rank the Contents',
            image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=2940&auto=format&fit=crop'
        };
        if (pathname.startsWith('/publishers')) return {
            title: 'Client Management System',
            image: 'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?q=80&w=2940&auto=format&fit=crop'
        };
        if (pathname.startsWith('/teams')) return {
            title: 'Teams',
            image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2940&auto=format&fit=crop'
        };
        return {
            title: 'Dashboard',
            image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2930&auto=format&fit=crop'
        };
    };

    const bannerProps = getBannerProps(location.pathname);

    return (
        <div className="min-h-screen">
            {isLoading && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm">
                    <div className="bg-background/80 p-4 rounded-full shadow-lg backdrop-blur-md">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                </div>
            )}
            {/* Top Header with Notification */}
            <div className="fixed top-0 right-0 z-50 p-4 flex items-center gap-2">
                <NotificationDropdown />
            </div>

            {/* Mobile menu button */}
            {(!sidebarOpen || isMobile) && (
                <div className="lg:hidden fixed top-4 left-4 z-50">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="h-12 w-12 shadow-xl glass"
                    >
                        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            )}

            {/* Mobile overlay backdrop */}
            <AnimatePresence>
                {sidebarOpen && isMobile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <AnimatePresence>
                {(sidebarOpen || (!isMobile && window.innerWidth >= 1024)) && (
                    <motion.aside
                        initial={isMobile ? { x: -300 } : false}
                        animate={{ x: 0 }}
                        exit={isMobile ? { x: -300 } : {}}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed z-50 [scrollbar-width:none] top-0 left-0 h-screen w-72 sm:w-80 lg:w-64 bg-black text-white p-4 z-40 overflow-y-auto flex flex-col shadow-[5px_-2px_5px_0px_rgba(0,0,0,0.75)]"
                    >
                        {/* Close button inside sidebar for mobile */}
                        <div className="lg:hidden absolute top-4 right-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSidebarOpen(false)}
                                className="h-10 w-10 text-white/60 hover:text-white hover:bg-white/10"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="mb-6 px-2 pr-12 lg:pr-2">
                            <h1 className="text-xl font-bold text-white">Writer's Hub</h1>
                        </div>

                        <nav className="space-y-1 flex-1">
                            {navItems.filter(item => {
                                // If item has role restriction, check current user role
                                if (!item.roles) return true;
                                return item.roles.includes(user.role ?? '');
                            }).map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.to;
                                return (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        className={cn(
                                            'flex items-center justify-between gap-3 px-3 py-3 rounded-lg transition-all text-sm min-h-[44px] touch-manipulation group',
                                            isActive ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
                                        )}
                                        onClick={() => isMobile && setSidebarOpen(false)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className="h-5 w-5 flex-shrink-0" />
                                            <span className="font-medium">{item.label}</span>
                                        </div>
                                        {item.badge && (
                                            <span className="bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}

                            {/* ── Book Previews widget ── */}
                            {/* <BookPreviewList /> */}

                            <div className="pt-4">
                                <div className="px-3 mb-2">
                                    <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">More</h3>
                                </div>
                                {projectItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.to;
                                    return (
                                        <Link
                                            key={item.to}
                                            to={item.to}
                                            className={cn(
                                                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm min-h-[40px] touch-manipulation',
                                                isActive ? 'bg-white/20 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'
                                            )}
                                            onClick={() => isMobile && setSidebarOpen(false)}
                                        >
                                            <Icon className="h-4 w-4 flex-shrink-0" />
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                                <Button style={{ border: "1px solid white", background: "black", cursor: "pointer", width: "100%", position: "relative", top: "12px" }}
                                    onClick={
                                        () => {
                                            localStorage.removeItem("token");
                                            window.location.href = "/auth/login";
                                        }

                                    }>Logout</Button>
                            </div>
                        </nav>

                        <div className="mt-auto pt-4 border-t border-white/10">
                            <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center flex-shrink-0">
                                    <User className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{user.name}</p>
                                    <p className="text-xs text-white/60">View Profile</p>
                                </div>
                                <SettingsIcon className="h-4 w-4 text-white/40 group-hover:text-white/60 flex-shrink-0" />
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            <main className={cn('transition-all duration-300 bg-slate-50/80 min-h-screen', !isMobile && sidebarOpen ? 'lg:pl-64' : 'pl-0')}>
                <Banner {...bannerProps} />
                <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-6 max-w-6xl relative">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        {children}
                    </motion.div>

                </div>
            </main>
        </div>
    );
}
