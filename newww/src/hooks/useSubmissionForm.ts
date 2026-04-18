import { useState, useRef } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { submitContent, fetchEvents } from '../lib/api';
import { useAtom } from 'jotai';
import { workspaceFoldersAtom, workspaceFilesAtom } from '../store/atoms';
import { useToast } from '../hooks/useToast';
import { z } from 'zod';

export const submissionSchema = z.object({
    type: z.string().min(1, "Type is required"),
    newSubmission: z.string().min(1, "Submission type is required"),
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
    destination: z.enum(['app', 'social', 'both', '']).optional(),
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

    if (data.newSubmission === "new") {
        if (!data.category) {
            ctx.addIssue({
                path: ["category"],
                code: z.ZodIssueCode.custom,
                message: "Category is required when submission type is 'new'",
            });
        }
    } else if (data.newSubmission === "Add next episode") {
        if (!data.episodeNumber) {
            ctx.addIssue({
                path: ["episodeNumber"],
                code: z.ZodIssueCode.custom,
                message: "Episode number is required when adding next episode",
            });
        }
    }
});

export function useSubmissionForm() {
    const [type, setType] = useState<string>('story');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isEvent, setIsEvent] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [selectedPublisher, setSelectedPublisher] = useState<string>('');
    const [selectedFolder, setSelectedFolder] = useState<string>('root');
    const [isOriginal, setIsOriginal] = useState(false);
    const [newSubmission, setNewSubmission] = useState<string>('new');
    const [newContent, setNewContent] = useState<string>('');
    const [category, setCategory] = useState<string>('');
    const [episodeNumber, setEpisodeNumber] = useState<string>('');
    const [backgroundImage, setBackgroundImage] = useState<string>('');
    const [coverImage, setCoverImage] = useState<string>('');
    const [destination, setDestination] = useState<'app' | 'social' | 'both' | ''>('app');
    const [story_title, setStoryTitle] = useState<string>('');
    const [folders] = useAtom(workspaceFoldersAtom);
    const [, setFiles] = useAtom(workspaceFilesAtom);
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
        queryFn: fetchEvents,
    });

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
                destination,
                isEvent,
                story_title,
                publisher: selectedPublisher,
            };

            const result = submissionSchema.safeParse(formData);
            if (!result.success) {
                console.error("Validation failed", result.error.issues);
                // We could show toast errors here if we wanted
            }

            return submitContent(formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contents'] });

            // Save submission as a WorkspaceFile in the root folder
            const fileName = story_title || title || 'Untitled Submission';
            const fileType = (type === 'poem' ? 'poem' : 'story') as 'story' | 'poem';
            const rawText = content.replace(/<[^>]+>/g, ''); // strip HTML tags
            const newFile = {
                id: `submission-${Date.now()}`,
                name: fileName,
                folderId: 'root',
                type: fileType,
                size: new Blob([rawText]).size,
                createdAt: new Date().toISOString(),
                modifiedAt: new Date().toISOString(),
                contentType: isEvent ? 'Event Submission' : 'Content Submission',
                excerpt: rawText.slice(0, 120) + (rawText.length > 120 ? '…' : ''),
                fullContent: content,
                category,
                publisher: selectedPublisher || undefined,
                author: 'You',
                status: 'Pending',
                eventName: isEvent
                    ? events?.find(e => e.eid === selectedEventId)?.name
                    : undefined,
            };
            setFiles(prev => [newFile, ...prev]);

            toast({
                title: 'Success!',
                description: 'Your submission has been received.',
            });
        },
    });

    // Reset function to clear all form fields to default state
    const resetForm = () => {
        setType('story');
        setTitle('');
        setContent('');
        setSelectedEventId('');
        setSelectedPublisher('');
        setSelectedFolder('root');
        setIsOriginal(false);
        setNewSubmission('new');
        setNewContent('');
        setCategory('');
        setEpisodeNumber('');
        setBackgroundImage('');
        setCoverImage('');
        setDestination('app');
        setStoryTitle('');
        // Clear file input refs
        if (backgroundInputRef.current) {
            backgroundInputRef.current.value = '';
        }
        if (coverInputRef.current) {
            coverInputRef.current.value = '';
        }
    };

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
            backgroundImage,
            coverImage,
            destination,
            events,
            folders,
            story_title,
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
            setBackgroundImage,
            setCoverImage,
            setDestination,
            setStoryTitle,
            handleRemoveImage,
            handleImageUpload,
            submit: () => submitMutation.mutate(),
            resetForm
        },
        refs: {
            backgroundInputRef,
            coverInputRef
        }
    };
}
