import { useState, useRef, useEffect, useMemo } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { submitContent, fetchEventsUsers, fetchEventEpisodes } from '../lib/api';
import type { EventEpisode } from '../lib/api';
import { useAtom } from 'jotai';
import { workspaceFoldersAtom } from '../store/atoms';
import { useToast } from '../hooks/useToast';
import { z } from 'zod';
import { CONTENT_TYPES } from '../constants/submission';
import type { Event } from '../types/event';
import { countWordsFromHtml } from '../lib/wordCount';
export const submissionSchema = z.object({
    type: z.string().min(1, "Type is required"),
    newSubmission: z.boolean(),
    selectedPublisher: z.string().optional(),
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
    isOriginal: z.boolean().refine(val => val === true, {
        message: "You must confirm this is your original work",
    }),
    category: z.string().optional(),
    episodeNumber: z.string().optional(),
    backgroundImage: z.string().optional(),
    coverImage: z.string().optional(),
    destination: z.string().min(1, "Destination is required"),
    isEvent: z.boolean().optional(),
}).superRefine((data, ctx) => {
    if (!data.isEvent) {
        if (!data.selectedPublisher) {
            ctx.addIssue({
                path: ["selectedPublisher"],
                code: z.ZodIssueCode.custom,
                message: "Publisher is required",
            });
        }
    }

    if (!data.isEvent && data.newSubmission) {
        if (!data.category) {
            ctx.addIssue({
                path: ["category"],
                code: z.ZodIssueCode.custom,
                message: "Category is required for a new submission",
            });
        }
    } else if (!data.isEvent && !data.newSubmission) {
        if (!data.episodeNumber) {
            ctx.addIssue({
                path: ["episodeNumber"],
                code: z.ZodIssueCode.custom,
                message: "Episode number is required when adding next episode",
            });
        }
    }
});

function mapEventTypeToFormType(eventType: string): string {
    const match = CONTENT_TYPES.find(
        ct => ct.label.toLowerCase() === eventType.toLowerCase()
    );
    return match ? match.label.toLowerCase() : eventType.toLowerCase();
}

function mapFetchedEvents(events: Event[]): Event[] {
    return events.map(event => ({
        ...event,
        type: event.event_type,
        folders: event.default_folder,
        selectedPublisher: event.pid,
    }));
}

function getStoryName(
    selectedEventId: string,
    title: string,
    storyTitle: string,
    newSubmission: boolean
): string {
    if (selectedEventId) return title.split(" ").join("_").trim()+"_"+Math.random().toString(4).substring(2, 5).toUpperCase();
    return newSubmission ? storyTitle.split(" ").join("_").trim()+"_"+Math.random().toString(4).substring(2, 5).toUpperCase() : title.split(" ").join("_").trim()+"_"+Math.random().toString(4).substring(2, 5).toUpperCase();
}

export function useSubmissionForm() {
    const [type, setType] = useState<string>('story');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isEvent, setIsEvent] = useState(true);
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [selectedPublisher, setSelectedPublisher] = useState<string>('');
    const [selectedFolder, setSelectedFolder] = useState<string>('root');
    const [isOriginal, setIsOriginal] = useState(false);
    const [newSubmission, setNewSubmission] = useState<boolean>(true);
    const [newContent, setNewContent] = useState<string>('');
    const [category, setCategory] = useState<string>('');
    const [episodeNumber, setEpisodeNumber] = useState<string>('');
    const [parent_id, setParentEid] = useState<string>('');
    const [backgroundImage, setBackgroundImage] = useState<string>('');
    const [coverImage, setCoverImage] = useState<string>('');
    const [destination, setDestination] = useState<string>('');
    const [publicationDestination, setPublicationDestination] = useState<'app' | 'social' | 'both' | ''>('app');
    const [story_title, setStoryTitle] = useState<string>('');
    const [showPaidEventModal, setShowPaidEventModal] = useState(false);
    const [modalWordCount, setModalWordCount] = useState(0);
    const [folders] = useAtom(workspaceFoldersAtom);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const backgroundInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const handleRemoveImage = (setter: (value: string) => void, inputRef: React.RefObject<HTMLInputElement | null>) => {
        setter('');
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (value: string) => void, targetRatio: number, ratioName: string) => {
        const input = e.target;
        const file = input.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                const img = new Image();
                img.onload = () => {
                    const aspect = img.width / img.height;
                    const tolerance = 0.05;

                    if (Math.abs(aspect - targetRatio) > tolerance) {
                        toast({
                            title: "Invalid Image Aspect Ratio",
                            description: `Please upload an image with ${ratioName} ratio. Current: ${aspect.toFixed(2)}, Required: ${targetRatio.toFixed(2)}`,
                            variant: "destructive"
                        });
                        alert(`Please upload an image with ${ratioName} ratio. Current: ${aspect.toFixed(2)}, Required: ${targetRatio.toFixed(2)}`);
                        input.value = '';
                        return;
                    }
                    setter(result);
                };
                img.src = result;
            };
            reader.readAsDataURL(file);
        }
    };

    const { data: events } = useQuery({
        queryKey: ['events'],
        queryFn: async () => mapFetchedEvents(await fetchEventsUsers()),
    });

    useEffect(() => {
        if (!selectedEventId || !events?.length) return;

        const event = events.find(e => e.eid === selectedEventId);
        if (!event) return;

        setCategory('');
        setParentEid('');

        if (event.event_type) {
            setType(mapEventTypeToFormType(event.event_type));
        }
        if (event.pid) {
            setSelectedPublisher(event.pid);
        }
        setSelectedFolder(event.default_folder || 'root');
        if (!event.episode_wise) {
            setNewSubmission(true);
        }
    }, [selectedEventId, events]);

    const selectedEvent = events?.find(e => e.eid === selectedEventId);

    const { data: eventEpisodes = [] } = useQuery<EventEpisode[]>({
        queryKey: ['eventEpisodes', selectedEventId],
        queryFn: () => fetchEventEpisodes(selectedEventId),
        enabled: !!selectedEventId && !!selectedEvent?.episode_wise,
    });

    useEffect(() => {
        if (newSubmission) {
            setParentEid('');
        }
    }, [newSubmission]);

    useEffect(() => {
        setDestination(getStoryName(selectedEventId, title, story_title, newSubmission));
    }, [selectedEventId, title, story_title, newSubmission]);

    const resolvedDestination = useMemo(
        () => getStoryName(selectedEventId, title, story_title, newSubmission),
        [selectedEventId, title, story_title, newSubmission]
    );

    const wordCount = useMemo(() => countWordsFromHtml(content), [content]);

    useEffect(() => {
        setModalWordCount(wordCount);
    }, [wordCount]);
    const submitMutation = useMutation({
        mutationFn: async () => {
            const formData = {
                type,
                title,
                content,
                newSubmission,
                selectedPublisher,
                selectedFolder,
                category,
                episodeNumber,
                isOriginal,
                backgroundImage,
                coverImage,
                destination: resolvedDestination,
                isEvent: !!selectedEventId || isEvent,
                story_title,
                publisher: selectedPublisher,
                selectedEventId,
                wordCount,
                parent_id,
                folders
            };

            const result = submissionSchema.safeParse(formData);
            if (!result.success) {
                console.error("Validation failed", result.error.issues);
                throw new Error(result.error.issues[0]?.message ?? 'Validation failed');
            }

            return submitContent(formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contents'] });

            toast({
                title: 'Success!',
                description: 'Your submission has been received.',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Submission failed',
                description: error.message || 'Please check all required fields.',
                variant: 'destructive',
            });
        },
    });

    const attemptSubmit = (overrideWordCount?: number) => {
        const count = overrideWordCount ?? wordCount;

        if (isEvent && selectedEvent?.categories?.length && !category) {
            toast({
                title: 'Category required',
                description: 'Please select a category before submitting.',
                variant: 'destructive',
            });
            return;
        }

        if (!resolvedDestination) {
            toast({
                title: 'Destination required',
                description: 'Please enter a story title to generate the destination.',
                variant: 'destructive',
            });
            return;
        }

        if (selectedEvent?.episode_wise && !newSubmission && !parent_id) {
            toast({
                title: 'Parent episode required',
                description: 'Please select the previous episode before submitting.',
                variant: 'destructive',
            });
            return;
        }

        if (selectedEvent?.paid === true && count < (selectedEvent.w_count || 0)) {
            setModalWordCount(count);
            setShowPaidEventModal(true);
            return;
        }

        submitMutation.mutate();
    };

    const confirmPaidEventSubmit = () => {
        setShowPaidEventModal(false);
        submitMutation.mutate();
    };

    const dismissPaidEventModal = () => {
        setShowPaidEventModal(false);
    };

    const resetForm = () => {
        setType('story');
        setTitle('');
        setContent('');
        setSelectedEventId('');
        setSelectedPublisher('');
        setSelectedFolder('root');
        setIsOriginal(false);
        setNewSubmission(true);
        setNewContent('');
        setCategory('');
        setEpisodeNumber('');
        setParentEid('');
        setBackgroundImage('');
        setCoverImage('');
        setDestination('');
        setPublicationDestination('app');
        setStoryTitle('');
        setShowPaidEventModal(false);
        setModalWordCount(0);
        if (backgroundInputRef.current) {
            backgroundInputRef.current.value = '';
        }
        if (coverInputRef.current) {
            coverInputRef.current.value = '';
        }
    };

    const eventFolders = selectedEvent?.default_folder
        ? [{
            id: selectedEvent.default_folder,
            name: selectedEvent.default_folder,
            parentId: 'root' as const,
            createdAt: '',
            modifiedAt: '',
        }]
        : folders;

    return {
        state: {
            type,
            title,
            content,
            isEvent,
            selectedEventId,
            selectedPublisher,
            selectedFolder,
            isOriginal,
            newSubmission,
            newContent,
            category,
            episodeNumber,
            parent_id,
            backgroundImage,
            coverImage,
            destination: resolvedDestination,
            publicationDestination,
            events,
            folders: isEvent ? eventFolders : folders,
            story_title,
            wordCount,
            selectedEvent,
            eventEpisodes,
            showPaidEventModal,
            modalWordCount,
            isPending: submitMutation.isPending
        },
        actions: {
            setType,
            setTitle,
            setContent,
            setIsEvent,
            setSelectedEventId,
            setSelectedPublisher,
            setSelectedFolder,
            setIsOriginal,
            setNewSubmission,
            setNewContent,
            setCategory,
            setEpisodeNumber,
            setParentEid,
            setBackgroundImage,
            setCoverImage,
            setDestination,
            setPublicationDestination,
            setStoryTitle,
            handleRemoveImage,
            handleImageUpload,
            submit: () => attemptSubmit(),
            attemptSubmit,
            confirmPaidEventSubmit,
            dismissPaidEventModal,
            resetForm
        },
        refs: {
            backgroundInputRef,
            coverInputRef
        }
    };
}
