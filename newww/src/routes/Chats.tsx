import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchChats, fetchChatMessages, sendMessage, createChat, fetchUsers } from '../lib/api';
import type { Chat } from '../types/chat';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { MessageSquare, Send, Search, User as UserIcon } from 'lucide-react';
import { useToast } from '../hooks/useToast';

export default function Chats() {
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [messageInput, setMessageInput] = useState('');
    const [writerSearch, setWriterSearch] = useState('');
    const [showWriterSelect, setShowWriterSelect] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: chats, isLoading: chatsLoading } = useQuery({
        queryKey: ['chats'],
        queryFn: fetchChats,
    });

    const { data: writers } = useQuery({
        queryKey: ['users'],
        queryFn: fetchUsers,
    });

    const { data: messages, isLoading: messagesLoading } = useQuery({
        queryKey: ['chatMessages', selectedChatId],
        queryFn: () => fetchChatMessages(selectedChatId!),
        enabled: !!selectedChatId,
    });

    const sendMutation = useMutation({
        mutationFn: (message: string) => sendMessage({ chatId: selectedChatId!, message }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['chatMessages', selectedChatId] });
            queryClient.invalidateQueries({ queryKey: ['chats'] });
            setMessageInput('');
        },
    });

    const createChatMutation = useMutation({
        mutationFn: (writerId: string) => createChat(writerId),
        onSuccess: (newChat) => {
            queryClient.invalidateQueries({ queryKey: ['chats'] });
            setSelectedChatId(newChat.id);
            setShowWriterSelect(false);
            setWriterSearch('');
            toast({ title: 'Success!', description: 'Chat started successfully.' });
        },
    });

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (messageInput.trim() && selectedChatId) {
            sendMutation.mutate(messageInput);
        }
    };

    const handleStartChat = (writerId: string) => {
        const existingChat = chats?.find(c => c.writerId === writerId);
        if (existingChat) {
            setSelectedChatId(existingChat.id);
            setShowWriterSelect(false);
        } else {
            createChatMutation.mutate(writerId);
        }
    };

    const filteredWriters = writers?.filter(w =>
        w.fullName.toLowerCase().includes(writerSearch.toLowerCase()) ||
        w.email.toLowerCase().includes(writerSearch.toLowerCase())
    );

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const selectedChat = chats?.find(c => c.id === selectedChatId);

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

            {/* Writer Selection */}
            {showWriterSelect && (
                <Card>
                    <CardHeader>
                        <CardTitle>Select a Writer</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                value={writerSearch}
                                onChange={(e) => setWriterSearch(e.target.value)}
                                placeholder="Search writers by name or email..."
                                className="pl-10"
                            />
                        </div>
                        <div className="max-h-64 overflow-y-auto space-y-2">
                            {filteredWriters?.map((writer) => (
                                <button
                                    key={writer.id}
                                    onClick={() => handleStartChat(writer.id)}
                                    className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
                                >
                                    <p className="font-medium">{writer.fullName}</p>
                                    <p className="text-sm text-muted-foreground">{writer.email}</p>
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
                                    {chats?.map((chat: Chat) => (
                                        <button
                                            key={chat.id}
                                            onClick={() => setSelectedChatId(chat.id)}
                                            className={`w-full text-left p-4 hover:bg-accent transition-colors ${selectedChatId === chat.id ? 'bg-accent' : ''
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                        <UserIcon className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium truncate">{chat.writerName}</p>
                                                        {chat.lastMessage && (
                                                            <p className="text-sm text-muted-foreground truncate">
                                                                {chat.lastMessage.message}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                {chat.unreadCount > 0 && (
                                                    <Badge className="bg-primary flex-shrink-0">{chat.unreadCount}</Badge>
                                                )}
                                            </div>
                                        </button>
                                    ))}
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
                                            <CardTitle className="text-lg">{selectedChat.writerName}</CardTitle>
                                            <p className="text-sm text-muted-foreground">{selectedChat.writerEmail}</p>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {messagesLoading ? (
                                        <LoadingSkeleton />
                                    ) : (
                                        <>
                                            {messages?.map((msg) => (
                                                <div
                                                    key={msg.id}
                                                    className={`flex ${msg.senderRole === 'admin' ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div
                                                        className={`max-w-[70%] rounded-lg p-3 ${msg.senderRole === 'admin'
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'bg-accent'
                                                            }`}
                                                    >
                                                        <p className="text-sm">{msg.message}</p>
                                                        <p className={`text-xs mt-1 ${msg.senderRole === 'admin' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
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
                                        <Button type="submit" disabled={!messageInput.trim() || sendMutation.isPending}>
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
