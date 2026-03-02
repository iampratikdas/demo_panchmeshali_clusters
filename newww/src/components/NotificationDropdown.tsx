import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../lib/api';
import type { Notification } from '../types/notification';
import { Bell, Check, MessageSquare, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@tanstack/react-router';

export function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    const { data: notifications, isLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: fetchNotifications,
        refetchInterval: 30000, // Refetch every 30 seconds
    });

    const markAsReadMutation = useMutation({
        mutationFn: (notificationId: string) => markNotificationAsRead(notificationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: () => markAllNotificationsAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const unreadCount = notifications?.filter((n: Notification) => !n.read).length || 0;

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'comment':
                return <MessageSquare className="h-4 w-4" />;
            case 'submission':
                return <FileText className="h-4 w-4" />;
            case 'approval':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'rejection':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'message':
                return <MessageSquare className="h-4 w-4 text-blue-500" />;
            case 'system':
                return <AlertCircle className="h-4 w-4 text-yellow-500" />;
            default:
                return <Bell className="h-4 w-4" />;
        }
    };

    const getTimeAgo = (timestamp: string) => {
        const now = new Date().getTime();
        const time = new Date(timestamp).getTime();
        const diff = now - time;

        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read) {
            markAsReadMutation.mutate(notification.id);
        }
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="relative h-11 w-11 sm:h-10 sm:w-10 hover:bg-white/10 touch-manipulation"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 border-none">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                )}
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Mobile backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 sm:hidden"
                        />

                        {/* Dropdown panel */}
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="fixed sm:absolute top-16 sm:top-auto right-0 sm:right-0 left-0 sm:left-auto sm:mt-2 w-full sm:w-96 max-w-full sm:max-w-96 glass-card rounded-none sm:rounded-lg shadow-xl overflow-hidden z-50"
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5 sticky top-0 z-10">
                                <h3 className="font-semibold text-base sm:text-lg">Notifications</h3>
                                <div className="flex items-center gap-2">
                                    {unreadCount > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => markAllAsReadMutation.mutate()}
                                            className="text-xs hover:bg-white/10 h-8 px-2 sm:px-3"
                                        >
                                            <Check className="h-3 w-3 mr-1" />
                                            <span className="hidden sm:inline">Mark all read</span>
                                            <span className="sm:hidden">All</span>
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsOpen(false)}
                                        className="sm:hidden h-8 w-8 p-0"
                                    >
                                        <XCircle className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Notifications List */}
                            <div className="max-h-[calc(100vh-8rem)] sm:max-h-96 overflow-y-auto">
                                {isLoading ? (
                                    <div className="p-8 text-center text-muted-foreground">
                                        <Bell className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                                        <p>Loading notifications...</p>
                                    </div>
                                ) : notifications && notifications.length > 0 ? (
                                    <div className="divide-y divide-white/10">
                                        {notifications.map((notification: Notification) => (
                                            <Link
                                                key={notification.id}
                                                to={notification.actionUrl || '#'}
                                                onClick={() => handleNotificationClick(notification)}
                                                className={`block p-4 hover:bg-white/5 active:bg-white/10 transition-colors touch-manipulation ${!notification.read ? 'bg-primary/5' : ''
                                                    }`}
                                            >
                                                <div className="flex gap-3">
                                                    <div className="flex-shrink-0 mt-1">
                                                        {getNotificationIcon(notification.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <p className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                                {notification.title}
                                                            </p>
                                                            {!notification.read && (
                                                                <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-2">
                                                            {getTimeAgo(notification.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-muted-foreground">
                                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p>No notifications yet</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
