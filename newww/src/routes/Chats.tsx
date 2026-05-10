import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchChats, fetchChatMessages, createChat, fetchUsers } from '../lib/api';
import type { Chat, ChatMessage, Participant } from '../types/chat';
import type { User } from '../types/user';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { MessageSquare, Send, Search, User as UserIcon, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { useToast } from '../hooks/useToast';
import { initSocket, disconnectSocket, getSocket } from '../lib/socket';

export default function Chats() {
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [messageInput, setMessageInput] = useState('');
    const [writerSearch, setWriterSearch] = useState('');
    const [showWriterSelect, setShowWriterSelect] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const queryClient = useQueryClient();
    const { toast } = useToast();

    // The user object stored in localStorage
    const currentUid = localStorage.getItem('uid');

    const { data: chats, isLoading: chatsLoading } = useQuery({
        queryKey: ['chats'],
        queryFn: fetchChats,
    });

    const { data: usersResponse } = useQuery({
        queryKey: ['users'],
        queryFn: () => fetchUsers(1, 1000),
    });
    const usersList: User[] = usersResponse?.data || [];

    const { data: messages, isLoading: messagesLoading } = useQuery({
        queryKey: ['chatMessages', selectedChatId],
        queryFn: () => fetchChatMessages(selectedChatId!),
        enabled: !!selectedChatId,
    });

    // Setup Socket
    useEffect(() => {
        const socket = initSocket();

        socket.on('receive_message', (newMessage: ChatMessage) => {
            queryClient.setQueryData(['chatMessages', newMessage.chatId], (oldData: any) => {
                if (!oldData) return [newMessage];
                // Check if msg already exists to prevent duplicate
                if (oldData.some((msg: ChatMessage) => msg._id === newMessage._id)) return oldData;
                return [...oldData, newMessage];
            });

            // If we are looking at this chat, mark it as seen immediately
            if (selectedChatId === newMessage.chatId && newMessage.senderId !== currentUid) {
                socket.emit('mark_seen', { chatId: newMessage.chatId });
            }

            queryClient.invalidateQueries({ queryKey: ['chats'] });
        });

        socket.on('chat_created_event', ({ chat }) => {
            // Target user gets this event, join the room immediately
            socket.emit('join_chat', chat.chatId);
            queryClient.invalidateQueries({ queryKey: ['chats'] });
        });

        socket.on('message_deleted', ({ messageId, chatId }) => {
            queryClient.setQueryData(['chatMessages', chatId], (oldData: any) => {
                if (!oldData) return oldData;
                return oldData.filter((msg: ChatMessage) => msg.messageId !== messageId);
            });
            queryClient.invalidateQueries({ queryKey: ['chats'] });
        });

        socket.on('chat_deleted', ({ chatId }) => {
            if (chatId === selectedChatId) {
                setSelectedChatId(null);
            }
            queryClient.invalidateQueries({ queryKey: ['chats'] });
        });

        socket.on('message_seen', ({ chatId, seenBy }) => {
            if (chatId === selectedChatId) {
                queryClient.invalidateQueries({ queryKey: ['chatMessages', chatId] });
            }
            queryClient.invalidateQueries({ queryKey: ['chats'] });
        });

        return () => {
            disconnectSocket();
        };
    }, [queryClient, selectedChatId, currentUid]);

    // Handle joining room and marking seen when chat changes
    useEffect(() => {
        if (selectedChatId) {
            const socket = getSocket();
            socket.emit('join_chat', selectedChatId);

            // Mark as seen via socket
            socket.emit('mark_seen', { chatId: selectedChatId });
        }
    }, [selectedChatId, queryClient]);

    const createChatMutation = useMutation({
        mutationFn: (targetUid: string) => createChat(targetUid),
        onSuccess: (newChat) => {
            // Notify server so it can tell the other user
            const socket = getSocket();
            socket.emit('new_chat_created', { chat: newChat });

            queryClient.invalidateQueries({ queryKey: ['chats'] });
            setSelectedChatId(newChat.chatId);
            setShowWriterSelect(false);
            setWriterSearch('');
            toast({ title: 'Success!', description: 'Chat started successfully.' });
        },
        onError: (error: any) => {
            toast({ title: 'Error', description: error.response?.data?.message || 'Failed to start chat.', variant: 'destructive' });
        }
    });

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (messageInput.trim() && selectedChatId) {
            // Check for URLs to block them
            const urlRegex = /((?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*))/i;
            if (urlRegex.test(messageInput)) {
                Swal.fire({
                    title: 'Links not allowed!',
                    text: 'Sharing URLs or links is restricted in this chat.',
                    icon: 'error',
                    confirmButtonText: 'Okay'
                });
                return;
            }

            const socket = getSocket();
            socket.emit('send_message', { chatId: selectedChatId, message: messageInput }, (response: any) => {
                if (response?.status === 'success') {
                    // Update chat list to reflect last message
                    queryClient.invalidateQueries({ queryKey: ['chats'] });
                }
            });
            setMessageInput('');
        }
    };

    const handleDeleteMessage = (messageId: string, chatId: string) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this message deletion!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                const socket = getSocket();
                socket.emit('delete_message', { messageId, chatId }, (response: any) => {
                    if (response?.status === 'success') {
                        // Update local cache immediately
                        queryClient.setQueryData(['chatMessages', chatId], (oldData: any) => {
                            if (!oldData) return oldData;
                            return oldData.filter((msg: ChatMessage) => msg.messageId !== messageId);
                        });
                        queryClient.invalidateQueries({ queryKey: ['chats'] });
                    } else {
                        toast({ title: 'Error', description: response?.message || 'Failed to delete message.', variant: 'destructive' });
                    }
                });
            }
        });
    };

    const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
        e.stopPropagation();
        Swal.fire({
            title: 'Delete this chat?',
            text: "This will remove the entire conversation.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                const socket = getSocket();
                socket.emit('delete_chat', { chatId }, (response: any) => {
                    if (response?.status === 'success') {
                        if (chatId === selectedChatId) {
                            setSelectedChatId(null);
                        }
                        queryClient.invalidateQueries({ queryKey: ['chats'] });
                        toast({ title: 'Success', description: 'Chat deleted.' });
                    } else {
                        toast({ title: 'Error', description: response?.message || 'Failed to delete chat.', variant: 'destructive' });
                    }
                });
            }
        });
    };

    const handleStartChat = (targetUid: string) => {
        // Find existing chat first
        const existingChat = chats?.find((c: Chat) =>
            c.participants.some(p => p.uid === targetUid)
        );

        if (existingChat) {
            setSelectedChatId(existingChat.chatId);
            setShowWriterSelect(false);
        } else {
            createChatMutation.mutate(targetUid);
        }
    };

    const filteredUsers = usersList.filter(u =>
        u.uid !== currentUid &&
        ((u.full_name?.toLowerCase() || '').includes(writerSearch.toLowerCase()) ||
            (u.email?.toLowerCase() || '').includes(writerSearch.toLowerCase()))
    );

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const selectedChat = chats?.find((c: Chat) => c.chatId === selectedChatId);

    // Helper to get the "other" participant
    const getOtherParticipant = (chat: Chat): Participant | undefined => {
        return chat.participants.find(p => p.uid !== currentUid);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Chats</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">Message writers directly</p>
                </div>
                <Button onClick={() => setShowWriterSelect(!showWriterSelect)} className="h-12 gap-2">
                    <MessageSquare className="h-4 w-4" />
                    {showWriterSelect ? 'Cancel' : 'New Chat'}
                </Button>
            </div>

            {/* User Selection */}
            {showWriterSelect && (
                <Card>
                    <CardHeader>
                        <CardTitle>Select a User</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                value={writerSearch}
                                onChange={(e) => setWriterSearch(e.target.value)}
                                placeholder="Search users by name or email..."
                                className="pl-10"
                            />
                        </div>
                        <div className="max-h-64 overflow-y-auto space-y-2 p-1">
                            {filteredUsers?.map((user) => (
                                <button
                                    key={user.uid}
                                    onClick={() => handleStartChat(user.uid!)}
                                    className="w-full text-left p-3 rounded-lg border hover:bg-primary/5 hover:border-primary/30 hover:shadow-sm transition-all"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{user.full_name}</p>
                                            <p className="text-sm text-muted-foreground">{user.email}</p>
                                        </div>
                                        <Badge variant="outline" className="capitalize">{user.role}</Badge>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Chat Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Chat List */}
                <div className="lg:col-span-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Conversations</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {chatsLoading ? (
                                <LoadingSkeleton />
                            ) : (
                                <div className="divide-y">
                                    {chats?.map((chat: Chat) => {
                                        const otherUser = getOtherParticipant(chat);
                                        const unreadCount = chat.unreadCounts?.[currentUid] || 0;
                                        return (
                                            <button
                                                key={chat.chatId}
                                                onClick={() => setSelectedChatId(chat.chatId)}
                                                className={`w-full text-left p-4 hover:bg-muted/50 transition-colors group flex justify-between items-center ${selectedChatId === chat.chatId ? 'bg-muted/50 border-l-4 border-primary' : ''
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3 truncate">
                                                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                                                        <UserIcon className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                    <div className="truncate">
                                                        <p className="font-medium truncate">{otherUser?.full_name || 'Unknown User'}</p>
                                                        <p className="text-sm text-muted-foreground truncate">
                                                            {chat.lastMessage ? chat.lastMessage.message : 'No messages yet'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {unreadCount > 0 && (
                                                        <Badge variant="default" className="rounded-full px-2 py-0.5">
                                                            {unreadCount}
                                                        </Badge>
                                                    )}
                                                    <button
                                                        onClick={(e) => handleDeleteChat(e, chat.chatId)}
                                                        className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-red-500 transition-all shrink-0"
                                                        title="Delete Chat"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                            {chats && chats.length === 0 && !showWriterSelect && (
                                <div className="text-center py-12 px-4">
                                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">No chats yet. Click "New Chat" to start.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Messages Area */}
                <div className="lg:col-span-8">
                    <Card className="h-[600px] flex flex-col">
                        {selectedChat ? (
                            <>
                                <CardHeader className="border-b">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <UserIcon className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{getOtherParticipant(selectedChat)?.full_name}</CardTitle>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {messagesLoading ? (
                                        <LoadingSkeleton />
                                    ) : (
                                        <>
                                            {messages?.map((msg: ChatMessage) => (
                                                <div
                                                    key={msg._id}
                                                    className={`flex ${msg.senderId === currentUid ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div
                                                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${msg.senderId === currentUid
                                                            ? 'bg-primary text-primary-foreground rounded-br-none shadow-md'
                                                            : 'bg-muted text-foreground rounded-bl-none border border-border shadow-sm'
                                                            }`}
                                                    >
                                                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                                                        <div className={`text-xs mt-1 flex justify-between items-center ${msg.senderId === currentUid ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                                            {msg.senderId === currentUid ? (
                                                                <button 
                                                                    onClick={() => handleDeleteMessage(msg.messageId, msg.chatId)}
                                                                    className="hover:text-red-500 transition-colors opacity-50 hover:opacity-100 p-1"
                                                                    title="Delete message"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </button>
                                                            ) : <span />}
                                                            <div className="text-right flex-1">
                                                                {new Date(parseInt(msg.createdAt) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                {msg.senderId === currentUid && (
                                                                    <span className="ml-2">
                                                                        {msg.status === 'seen' ? '✓✓' : '✓'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div ref={messagesEndRef} />
                                        </>
                                    )}
                                </CardContent>

                                <div className="border-t p-4">
                                    <form onSubmit={handleSendMessage} className="flex gap-2">
                                        <Input
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
                                            placeholder="Type your message..."
                                            className="flex-1"
                                        />
                                        <Button type="submit" disabled={!messageInput.trim()}>
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-lg font-medium">Select a conversation</p>
                                    <p className="text-sm text-muted-foreground">Choose a chat from the list or start a new one</p>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
