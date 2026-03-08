import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchEvents, createEvent } from '../lib/api';
import type { CreateEventData } from '../types/event';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { Pagination } from '../components/Pagination';
import { Calendar, Users, Plus, CheckCircle, XCircle, Search, Trophy, FileText } from 'lucide-react';
import { useToast } from '../hooks/useToast';

export default function Events() {
    const [showForm, setShowForm] = useState(false);
    const [teamMemberInput, setTeamMemberInput] = useState('');
    const [categoryInput, setCategoryInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;

    const [formData, setFormData] = useState<Omit<CreateEventData, 'team' | 'categories'>>({
        name: '',
        description: '',
        active: true,
        st_dt: '',
        en_dt: '',
        parent: '',
        w_count: 0,
        sh_list: 0,
        logo: '',
        type: 'vote',
        episode_wise: false,
        for_book: false,
    });
    const [team, setTeam] = useState<string[]>([]);
    const [categories, setCategories] = useState<string[]>([]);

    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: events, isLoading } = useQuery({
        queryKey: ['events'],
        queryFn: fetchEvents,
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateEventData) => createEvent(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            toast({ title: 'Success!', description: 'Event created successfully.' });
            setShowForm(false);
            resetForm();
        },
    });

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            active: true,
            st_dt: '',
            en_dt: '',
            parent: '',
            w_count: 0,
            sh_list: 0,
            logo: '',
            type: 'vote',
            episode_wise: false,
            for_book: false,
        });
        setTeam([]);
        setCategories([]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Convert dates to Unix timestamps
        const startDate = formData.st_dt ? Math.floor(new Date(formData.st_dt).getTime() / 1000).toString() : '';
        const endDate = formData.en_dt ? Math.floor(new Date(formData.en_dt).getTime() / 1000).toString() : '';

        createMutation.mutate({
            ...formData,
            st_dt: startDate,
            en_dt: endDate,
            team,
            categories,
        });
    };

    const addTeamMember = () => {
        if (teamMemberInput.trim() && !team.includes(teamMemberInput.trim())) {
            setTeam([...team, teamMemberInput.trim()]);
            setTeamMemberInput('');
        }
    };

    const removeTeamMember = (member: string) => {
        setTeam(team.filter(m => m !== member));
    };

    const addCategory = () => {
        if (categoryInput.trim() && !categories.includes(categoryInput.trim())) {
            setCategories([...categories, categoryInput.trim()]);
            setCategoryInput('');
        }
    };

    const removeCategory = (category: string) => {
        setCategories(categories.filter(c => c !== category));
    };

    // Convert Unix timestamp to readable date
    const formatTimestamp = (timestamp: string) => {
        return new Date(parseInt(timestamp) * 1000).toLocaleDateString();
    };

    // Client-side filtering and pagination
    const filteredEvents = events?.filter(event =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const totalPages = Math.ceil(filteredEvents.length / pageSize);
    const paginatedEvents = filteredEvents.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    // Reset to page 1 when search changes
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Events Management</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Create and manage writing events
                    </p>
                </div>
                <Button
                    onClick={() => setShowForm(!showForm)}
                    className="h-12 gap-2"
                >
                    <Plus className="h-4 w-4" />
                    {showForm ? 'Cancel' : 'Create Event'}
                </Button>
            </div>

            {/* Create Event Form */}
            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Event</CardTitle>
                        <CardDescription>Fill in the event details below</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Event Name */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Event Name</label>
                                <Input
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., অণুতে অনন্ত ( প্রথম )"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Description</label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Enter event description"
                                    className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background text-sm"
                                />
                            </div>

                            {/* Date Range */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Start Date</label>
                                    <Input
                                        type="date"
                                        required
                                        value={formData.st_dt}
                                        onChange={(e) => setFormData({ ...formData, st_dt: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">End Date</label>
                                    <Input
                                        type="date"
                                        required
                                        value={formData.en_dt}
                                        onChange={(e) => setFormData({ ...formData, en_dt: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Word Count & Short List */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Word Count Limit</label>
                                    <Input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.w_count || ''}
                                        onChange={(e) => setFormData({ ...formData, w_count: parseInt(e.target.value) || 0 })}
                                        placeholder="200"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Short List Count</label>
                                    <Input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.sh_list || ''}
                                        onChange={(e) => setFormData({ ...formData, sh_list: parseInt(e.target.value) || 0 })}
                                        placeholder="50"
                                    />
                                </div>
                            </div>

                            {/* Logo & Type */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Logo URL</label>
                                    <Input
                                        value={formData.logo}
                                        onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                                        placeholder="https://example.com/logo.png"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Event Type</label>
                                    <Input
                                        required
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        placeholder="vote, contest, etc."
                                    />
                                </div>
                            </div>

                            {/* Parent Event (Optional) */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Parent Event ID (Optional)</label>
                                <Input
                                    value={formData.parent}
                                    onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                                    placeholder="Leave empty if no parent event"
                                />
                            </div>

                            {/* Toggles: Active / Episode Wise / For Book */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                                    <input
                                        type="checkbox"
                                        id="active"
                                        checked={formData.active}
                                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                        className="h-4 w-4 accent-primary"
                                    />
                                    <div>
                                        <label htmlFor="active" className="text-sm font-medium cursor-pointer">Event is Active</label>
                                        <p className="text-xs text-muted-foreground">Visible to participants</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                                    <input
                                        type="checkbox"
                                        id="episode_wise"
                                        checked={formData.episode_wise}
                                        onChange={(e) => setFormData({ ...formData, episode_wise: e.target.checked })}
                                        className="h-4 w-4 accent-primary"
                                    />
                                    <div>
                                        <label htmlFor="episode_wise" className="text-sm font-medium cursor-pointer">Episode Wise</label>
                                        <p className="text-xs text-muted-foreground">Allow episode submissions</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                                    <input
                                        type="checkbox"
                                        id="for_book"
                                        checked={formData.for_book}
                                        onChange={(e) => setFormData({ ...formData, for_book: e.target.checked })}
                                        className="h-4 w-4 accent-primary"
                                    />
                                    <div>
                                        <label htmlFor="for_book" className="text-sm font-medium cursor-pointer">For Book</label>
                                        <p className="text-xs text-muted-foreground">Enable multi-episode book mode</p>
                                    </div>
                                </div>
                            </div>

                            {/* Team Members */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Team Members</label>
                                <div className="flex gap-2 mb-2">
                                    <Input
                                        value={teamMemberInput}
                                        onChange={(e) => setTeamMemberInput(e.target.value)}
                                        placeholder="Enter team member name"
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTeamMember())}
                                    />
                                    <Button type="button" onClick={addTeamMember} variant="outline">Add</Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {team.map((member) => (
                                        <Badge key={member} variant="secondary" className="gap-1">
                                            {member}
                                            <button
                                                type="button"
                                                onClick={() => removeTeamMember(member)}
                                                className="ml-1 hover:text-destructive"
                                            >
                                                ×
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Categories */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Categories</label>
                                <div className="flex gap-2 mb-2">
                                    <Input
                                        value={categoryInput}
                                        onChange={(e) => setCategoryInput(e.target.value)}
                                        placeholder="Enter category"
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                                    />
                                    <Button type="button" onClick={addCategory} variant="outline">Add</Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map((category) => (
                                        <Badge key={category} variant="secondary" className="gap-1">
                                            {category}
                                            <button
                                                type="button"
                                                onClick={() => removeCategory(category)}
                                                className="ml-1 hover:text-destructive"
                                            >
                                                ×
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <Button type="submit" disabled={createMutation.isPending} className="w-full sm:w-auto">
                                {createMutation.isPending ? 'Creating...' : 'Create Event'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Search Bar */}
            <div className="glass-card rounded-xl p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search events by name..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Events List */}
            {isLoading ? (
                <LoadingSkeleton />
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {paginatedEvents.map((event) => (
                            <Card key={event.eid} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <CardTitle className="text-lg sm:text-xl">{event.name}</CardTitle>
                                                {event.active && (
                                                    <Badge className="bg-green-500 text-xs">Active</Badge>
                                                )}
                                            </div>
                                            <CardDescription className="mt-1">
                                                ID: {event.eid}
                                            </CardDescription>
                                        </div>
                                        {event.result ? (
                                            <Badge className="bg-green-500 flex-shrink-0">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Results
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="flex-shrink-0">
                                                <XCircle className="h-3 w-3 mr-1" />
                                                Pending
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Description */}
                                    {event.description && (
                                        <div className="flex items-start gap-2 text-sm">
                                            <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                            <p className="text-muted-foreground">{event.description}</p>
                                        </div>
                                    )}

                                    {/* Event Period */}
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-2 text-sm">
                                            <Calendar className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-medium">Event Period</p>
                                                <p className="text-muted-foreground">
                                                    {formatTimestamp(event.st_dt)} - {formatTimestamp(event.en_dt)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Word Count, Type & Flags */}
                                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <FileText className="h-4 w-4" />
                                            <span>{event.w_count} words</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Trophy className="h-4 w-4" />
                                            <span>{event.sh_list} shortlist</span>
                                        </div>
                                        <Badge variant="outline" className="text-xs">{event.type}</Badge>
                                        {event.episode_wise && (
                                            <Badge variant="secondary" className="text-xs">Episode Wise</Badge>
                                        )}
                                        {event.for_book && (
                                            <Badge variant="secondary" className="text-xs">For Book</Badge>
                                        )}
                                    </div>

                                    {/* Parent Event */}
                                    {event.parent && (
                                        <div className="pl-4 border-l-2 border-primary/30 space-y-1">
                                            <p className="text-sm font-semibold">Parent Event</p>
                                            <p className="text-sm text-muted-foreground">ID: {event.parent}</p>
                                        </div>
                                    )}

                                    {/* Team Members */}
                                    <div className="flex items-start gap-2 text-sm">
                                        <Users className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium">Team Members ({event.team.length})</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {event.team.map((member) => (
                                                    <Badge key={member} variant="outline" className="text-xs">
                                                        {member}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Categories */}
                                    {event.categories.length > 0 && (
                                        <div className="flex items-start gap-2 text-sm">
                                            <div className="flex flex-wrap gap-1">
                                                {event.categories.map((category) => (
                                                    <Badge key={category} variant="secondary" className="text-xs">
                                                        {category}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {filteredEvents.length === 0 && (
                        <div className="text-center py-12">
                            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">
                                {searchQuery ? 'No events found matching your search.' : 'No events created yet. Click "Create Event" to get started.'}
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </>
            )}
        </div>
    );
}
