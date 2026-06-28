import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchEvents, createEvent, updateEvent, fetchPublisherTeamLists, fetchMyPublisherCompanies } from '../lib/api';
import type { Event, CreateEventData, EventType } from '../types/event';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { Pagination } from '../components/Pagination';
import { Calendar, Users, Plus, CheckCircle, XCircle, Search, Trophy, FileText, Edit, X } from 'lucide-react';
import { useToast } from '../hooks/useToast';

const EVENT_TYPES: EventType[] = [
    'Novel', 'Novella / Short novel', 'Essay / Article', 'Story', 'Long story',
    'Short story', 'Micro story', 'Nano story / Ultra-short story', 'Dramatic story',
    'Verse', 'Rhyme / Rhyming poem', 'Poem', 'Prose poem', 'Haiku', 'Limerick',
    'Movie', 'Web Series', 'Short-stories'
];

export default function Events() {
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [categoryInput, setCategoryInput] = useState('');
    const [teamSearch, setTeamSearch] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const [formData, setFormData] = useState<CreateEventData>({
        eid: '',
        pid: '',
        name: '',
        description: '',
        active: true,
        st_dt: '',
        en_dt: '',
        parent: '',
        w_count: 0,
        sh_list: 0,
        logo_url: '',
        event_type: 'Story',
        episode_wise: false,
        is_book: false,
        paid: false,
        paid_amt: 0,
        competition: false,
        is_social_media: false,
        default_folder: '',
        is_app: false,
        team: [],
        categories: []
    });

    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: events, isLoading } = useQuery({
        queryKey: ['events'],
        queryFn: fetchEvents,
    });

    const { data: teamLists } = useQuery({
        queryKey: ['publisherTeamLists'],
        queryFn: fetchPublisherTeamLists,
    });

    const { data: publisherCompanies = [] } = useQuery({
        queryKey: ['myPublisherCompanies'],
        queryFn: fetchMyPublisherCompanies,
        staleTime: 30_000,
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateEventData) => createEvent(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            toast({ title: 'Success!', description: 'Event created successfully.' });
            closeForm();
        },
        onError: (error: any) => {
            toast({ title: 'Error', description: error.message || 'Failed to create event', variant: 'destructive' });
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: { eid: string, payload: Partial<CreateEventData> }) => updateEvent(data.eid, data.payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            toast({ title: 'Success!', description: 'Event updated successfully.' });
            closeForm();
        },
        onError: (error: any) => {
            toast({ title: 'Error', description: error.message || 'Failed to update event', variant: 'destructive' });
        }
    });

    const generateEid = (publisherName?: string) => {
        const pubName = publisherName ? publisherName.replace(/\s+/g, '') : 'Publisher';
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomNum = Math.floor(Math.random() * 10000);
        return `${pubName}-${date}-${randomNum}`;
    };

    const handlePublisherChange = (pid: string) => {
        const company = publisherCompanies.find((c: any) => c.pid === pid);
        setFormData(prev => ({
            ...prev,
            pid,
            eid: !isEditing ? generateEid(company?.name) : prev.eid,
        }));
    };

    const openCreateForm = () => {
        const defaultCompany = publisherCompanies[0];
        setFormData({
            eid: generateEid(defaultCompany?.name),
            pid: defaultCompany?.pid || '',
            name: '',
            description: '',
            active: true,
            st_dt: '',
            en_dt: '',
            parent: '',
            w_count: 0,
            sh_list: 0,
            logo_url: '',
            event_type: 'Story',
            episode_wise: false,
            is_book: false,
            paid: false,
            paid_amt: 0,
            competition: false,
            is_social_media: false,
            default_folder: '',
            is_app: false,
            team: [],
            categories: []
        });
        setIsEditing(false);
        setShowForm(true);
    };

    const formatForInput = (unixTimestampStr: string) => {
        if (!unixTimestampStr) return '';
        const date = new Date(parseInt(unixTimestampStr) * 1000);
        // Format to YYYY-MM-DDThh:mm
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const mm = String(date.getMinutes()).padStart(2, '0');
        return `${y}-${m}-${d}T${hh}:${mm}`;
    };

    const openEditForm = (event: Event) => {
        setFormData({
            eid: event.eid,
            pid: event.pid || '',
            name: event.name || '',
            description: event.description || '',
            active: event.active ?? true,
            st_dt: formatForInput(event.st_dt),
            en_dt: formatForInput(event.en_dt),
            parent: event.parent || '',
            w_count: event.w_count || 0,
            sh_list: event.sh_list || 0,
            logo_url: event.logo_url || '',
            event_type: event.event_type || 'Story',
            episode_wise: event.episode_wise ?? false,
            is_book: event.is_book ?? false,
            paid: event.paid ?? false,
            paid_amt: event.paid_amt || 0,
            competition: event.competition ?? false,
            is_social_media: event.is_social_media ?? false,
            default_folder: event.default_folder || '',
            is_app: event.is_app ?? false,
            team: event.team || [],
            categories: event.categories || []
        });
        setIsEditing(true);
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
    };

    const validateForm = () => {
        if (!isEditing && !formData.pid) {
            toast({ title: 'Validation Error', description: 'Please select a publisher company.', variant: 'destructive' });
            return false;
        }
        if (formData.st_dt) {
            const startTimestamp = new Date(formData.st_dt).getTime();
            if (startTimestamp < Date.now() - 86400000 && !isEditing) {
                toast({ title: 'Validation Error', description: 'Start date cannot be in the past.', variant: 'destructive' });
                return false;
            }
            if (formData.en_dt) {
                const endTimestamp = new Date(formData.en_dt).getTime();
                if (endTimestamp <= startTimestamp) {
                    toast({ title: 'Validation Error', description: 'End date must be after start date.', variant: 'destructive' });
                    return false;
                }
            }
        }
        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        // Convert dates to Unix timestamps string
        const startDate = formData.st_dt ? Math.floor(new Date(formData.st_dt).getTime() / 1000).toString() : '';
        const endDate = formData.en_dt ? Math.floor(new Date(formData.en_dt).getTime() / 1000).toString() : '';

        const payload = {
            ...formData,
            st_dt: startDate,
            en_dt: endDate,
        };

        if (isEditing) {
            updateMutation.mutate({ eid: formData.eid, payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    const toggleTeamMember = (memberUid: string) => {
        if (formData.team.includes(memberUid)) {
            setFormData({ ...formData, team: formData.team.filter(m => m !== memberUid) });
        } else {
            setFormData({ ...formData, team: [...formData.team, memberUid] });
        }
    };

    const addCategory = () => {
        if (categoryInput.trim() && !formData.categories.includes(categoryInput.trim())) {
            setFormData({ ...formData, categories: [...formData.categories, categoryInput.trim()] });
            setCategoryInput('');
        }
    };

    const removeCategory = (category: string) => {
        setFormData({ ...formData, categories: formData.categories.filter(c => c !== category) });
    };

    // Convert Unix timestamp to readable date
    const formatTimestamp = (timestamp: string) => {
        if (!timestamp) return 'N/A';
        return new Date(parseInt(timestamp) * 1000).toLocaleString();
    };

    const filteredEvents = events?.filter(event =>
        event.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.eid?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const totalPages = Math.ceil(filteredEvents.length / pageSize);
    const paginatedEvents = filteredEvents.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
    };

    const filteredTeamLists = teamLists?.filter((member: any) =>
        member.full_name?.toLowerCase().includes(teamSearch.toLowerCase()) ||
        member.uid?.toLowerCase().includes(teamSearch.toLowerCase())
    ) || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Events Management</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Create and manage writing events
                    </p>
                </div>
                <Button onClick={openCreateForm} className="h-12 gap-2">
                    <Plus className="h-4 w-4" />
                    Create Event
                </Button>
            </div>

            {/* Search Bar */}
            <div className="glass-card rounded-xl p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search events by name or ID..."
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
                                        <Button variant="outline" size="sm" onClick={() => openEditForm(event)}>
                                            <Edit className="h-4 w-4 mr-1" />
                                            Edit
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {event.description && (
                                        <div className="flex items-start gap-2 text-sm">
                                            <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                            <p className="text-muted-foreground line-clamp-2">{event.description}</p>
                                        </div>
                                    )}

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

                                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <FileText className="h-4 w-4" />
                                            <span>{event.w_count} words</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Trophy className="h-4 w-4" />
                                            <span>{event.sh_list} shortlist</span>
                                        </div>
                                        <Badge variant="outline" className="text-xs">{event.event_type}</Badge>
                                        {event.paid && <Badge className="bg-yellow-500 text-black text-xs">Paid ({event.paid_amt})</Badge>}
                                        {event.competition && <Badge variant="secondary" className="text-xs">Competition</Badge>}
                                        {event.episode_wise && <Badge variant="secondary" className="text-xs">Episode Wise</Badge>}
                                        {event.is_book && <Badge variant="secondary" className="text-xs">Book</Badge>}
                                    </div>

                                    {event.team && event.team.length > 0 && (
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
                                    )}

                                    {event.categories && event.categories.length > 0 && (
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

                    <Pagination
                        currentPage={currentPage}
                        totalPages={Math.max(1, totalPages)}
                        onPageChange={setCurrentPage}
                    />
                </>
            )}

            {/* Modal Overlay for Create/Edit Form */}
            {showForm && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center overflow-y-auto p-4 sm:p-6 transition-opacity duration-300">
                    <div className="bg-white/90 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
                        <Button
                            variant="ghost"
                            className="absolute top-4 right-4 z-10 rounded-full h-8 w-8 p-0"
                            onClick={closeForm}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                        <Card className="border-0 shadow-none">
                            <CardHeader>
                                <CardTitle className="text-2xl">{isEditing ? 'Edit Event' : 'Create New Event'}</CardTitle>
                                <CardDescription>Fill in the event details below to {isEditing ? 'update' : 'create'} the event model</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form id="event-form" onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Publisher Company */}
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">
                                                Publisher Name *
                                            </label>
                                            <select
                                                required
                                                value={formData.pid || ''}
                                                onChange={(e) => handlePublisherChange(e.target.value)}
                                                disabled={isEditing}
                                                className={`w-full h-9 px-3 py-1 rounded-md border border-input bg-transparent text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${isEditing ? 'bg-muted cursor-not-allowed' : ''}`}
                                            >
                                                <option value="">Select publisher company</option>
                                                {isEditing && formData.pid && !publisherCompanies.some((c: any) => c.pid === formData.pid) && (
                                                    <option value={formData.pid} className="bg-background text-foreground">
                                                        {formData.pid}
                                                    </option>
                                                )}
                                                {publisherCompanies.map((company: any) => (
                                                    <option key={company.pid} value={company.pid} className="bg-background text-foreground">
                                                        {company.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {publisherCompanies.length === 0 && (
                                                <p className="text-xs text-muted-foreground mt-1">No publisher companies assigned to your account.</p>
                                            )}
                                        </div>
                                        {/* Event ID */}
                                        <div>
                                            <label className="text-sm font-medium mb-2 block text-muted-foreground">Event ID (EID)</label>
                                            <Input
                                                required
                                                value={formData.eid}
                                                disabled={true}
                                                onChange={(e) => setFormData({ ...formData, eid: e.target.value })}
                                                placeholder="e.g., PublisherName-Date-Random"
                                                className="bg-muted"
                                            />
                                        </div>
                                        {/* Event Name */}
                                        <div className="md:col-span-2">
                                            <label className="text-sm font-medium mb-2 block">Event Name *</label>
                                            <Input
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="e.g., Event Name"
                                            />
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Enter event description"
                                            className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-transparent text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Logo URL */}
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Logo URL</label>
                                            <Input
                                                value={formData.logo_url}
                                                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                                                placeholder="https://example.com/logo.png"
                                            />
                                        </div>
                                        {/* Default Folder */}
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Default Folder</label>
                                            <Input
                                                value={`EID_${formData.name.split(" ").join("_")}`}
                                                // onChange={(e) => setFormData({ ...formData, default_folder: e.target.value })}
                                                placeholder="Folder name"
                                                disabled={true}
                                            // defaultValue={`EID_${formData.name.split(" ").join("_")}`}
                                            />
                                        </div>
                                    </div>

                                    {/* Date Range */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Start Date & Time *</label>
                                            <Input
                                                type="datetime-local"
                                                required
                                                value={formData.st_dt}
                                                onChange={(e) => setFormData({ ...formData, st_dt: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">End Date & Time *</label>
                                            <Input
                                                type="datetime-local"
                                                required
                                                value={formData.en_dt}
                                                onChange={(e) => setFormData({ ...formData, en_dt: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Word Count & Short List & Parent */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Word Count Limit</label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={formData.w_count || ''}
                                                onChange={(e) => setFormData({ ...formData, w_count: parseInt(e.target.value) || 0 })}
                                                placeholder="e.g., 200"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Short List Count</label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={formData.sh_list || ''}
                                                onChange={(e) => setFormData({ ...formData, sh_list: parseInt(e.target.value) || 0 })}
                                                placeholder="e.g., 50"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Parent Event ID</label>
                                            <Input
                                                value={formData.parent}
                                                onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                                                placeholder="Leave empty if none"
                                            />
                                        </div>
                                    </div>

                                    {/* Event Type & Paid Amount */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Event Type *</label>
                                            <select
                                                required
                                                value={formData.event_type}
                                                onChange={(e) => setFormData({ ...formData, event_type: e.target.value as EventType })}
                                                className="w-full h-9 px-3 py-1 rounded-md border border-input bg-transparent text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            >
                                                {EVENT_TYPES.map(type => (
                                                    <option key={type} value={type} className="bg-background text-foreground">{type}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Paid Amount</label>
                                            <Input
                                                type="number"
                                                min="0"
                                                disabled={!formData.paid}
                                                value={formData.paid_amt || ''}
                                                onChange={(e) => setFormData({ ...formData, paid_amt: parseInt(e.target.value) || 0 })}
                                                placeholder="0"
                                                className={!formData.paid ? "bg-muted" : ""}
                                            />
                                        </div>
                                    </div>

                                    {/* Toggles Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border border-border rounded-xl bg-card">
                                        {[
                                            { id: 'active', label: 'Active', desc: 'Visible to users' },
                                            { id: 'paid', label: 'Paid Event', desc: 'Requires payment' },
                                            { id: 'competition', label: 'Competition', desc: 'Is competitive' },
                                            { id: 'is_social_media', label: 'Social Media', desc: 'For social platforms' },
                                            { id: 'is_book', label: 'Is Book', desc: 'Book collection' },
                                            { id: 'is_app', label: 'Is App', desc: 'App exclusive' },
                                            { id: 'episode_wise', label: 'Episode Wise', desc: 'Multi-part event' }
                                        ].map(toggle => (
                                            <div key={toggle.id} className="flex items-start gap-3">
                                                <input
                                                    type="checkbox"
                                                    id={toggle.id}
                                                    checked={(formData as any)[toggle.id]}
                                                    onChange={(e) => setFormData({ ...formData, [toggle.id]: e.target.checked })}
                                                    className="mt-1 h-4 w-4 accent-primary"
                                                />
                                                <div>
                                                    <label htmlFor={toggle.id} className="text-sm font-medium cursor-pointer block">{toggle.label}</label>
                                                    <span className="text-xs text-muted-foreground">{toggle.desc}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Team Members */}
                                        <div className="border border-border p-4 rounded-xl">
                                            <label className="text-sm font-medium mb-2 block">Publisher Team Members</label>
                                            <p className="text-xs text-muted-foreground mb-3">Select members from your publisher company team.</p>

                                            <div className="relative mb-3">
                                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    type="text"
                                                    placeholder="Search team members..."
                                                    value={teamSearch}
                                                    onChange={(e) => setTeamSearch(e.target.value)}
                                                    className="pl-9 h-8 text-sm"
                                                />
                                            </div>

                                            <div className="max-h-[150px] overflow-y-auto space-y-1 border border-border rounded-md p-1 bg-muted/30">
                                                {filteredTeamLists.length > 0 ? (
                                                    filteredTeamLists.map((member: any) => (
                                                        <div
                                                            key={member.uid}
                                                            className="flex items-center gap-2 p-2 hover:bg-muted rounded-md cursor-pointer transition-colors"
                                                            onClick={() => toggleTeamMember(member.full_name)}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.team.includes(member.full_name)}
                                                                readOnly
                                                                className="h-3.5 w-3.5 accent-primary"
                                                            />
                                                            <div className="text-sm flex flex-col leading-none">
                                                                <span>{member.full_name}</span>
                                                                <span className="text-xs text-muted-foreground">{member.email}</span>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-4 text-sm text-muted-foreground">
                                                        No team members found
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-3">
                                                <p className="text-xs font-medium mb-2">Selected ({formData.team.length}):</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {formData.team.map((member) => (
                                                        <Badge key={member} variant="secondary" className="text-xs">
                                                            {member}
                                                            <X
                                                                className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive"
                                                                onClick={(e) => { e.stopPropagation(); toggleTeamMember(member); }}
                                                            />
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Categories */}
                                        <div className="border border-border p-4 rounded-xl">
                                            <label className="text-sm font-medium mb-2 block">Categories</label>
                                            <div className="flex gap-2 mb-3">
                                                <Input
                                                    value={categoryInput}
                                                    onChange={(e) => setCategoryInput(e.target.value)}
                                                    placeholder="Enter category name"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            addCategory();
                                                        }
                                                    }}
                                                    className="h-9"
                                                />
                                                <Button type="button" onClick={addCategory} variant="outline" className="h-9">Add</Button>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {formData.categories.map((category) => (
                                                    <Badge key={category} variant="secondary" className="text-xs">
                                                        {category}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeCategory(category)}
                                                            className="ml-1 hover:text-destructive"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                                {formData.categories.length === 0 && (
                                                    <span className="text-xs text-muted-foreground italic">No categories added</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-3 pt-6 border-t border-border mt-4">
                                <Button variant="outline" onClick={closeForm}>Cancel</Button>
                                <Button
                                    type="submit"
                                    form="event-form"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                    className="px-8"
                                >
                                    {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Event')}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
