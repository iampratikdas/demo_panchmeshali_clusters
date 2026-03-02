import { Loader2, Send, FileText, CalendarDays } from 'lucide-react';
import { useState } from 'react';
import { useSubmissionForm } from '../hooks/useSubmissionForm';
import { CONTENT_TYPES } from '../constants/submission';
import { RichTextEditor } from '../components/RichTextEditor';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { AnimatedSelect } from '../ui/animated-select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
// Sub-components
import { EventSubmissionCard } from '../components/submission/EventSubmissionCard';
import { PublicationDestinationCard } from '../components/submission/PublicationDestinationCard';
import { SubmissionTypeCard } from '../components/submission/SubmissionTypeCard';
import { ImageUploadField } from '../components/submission/ImageUploadField';
import { OriginalConfirmationCard } from '../components/submission/OriginalConfirmationCard';
import { CheckForApp } from '../components/submission/CheckForApp';

export default function Submit() {
    const { state, actions, refs } = useSubmissionForm();
    const [activeTab, setActiveTab] = useState('content');

    const contentTypeLabel = CONTENT_TYPES.find(ct => ct.value === state.type)?.label || 'Content';

    // Get the selected event to check episode_wise property
    const selectedEvent = state.events?.find(event => event.eid === state.selectedEventId);
    const isEpisodeWise = selectedEvent?.episode_wise === undefined ? false : selectedEvent?.episode_wise ? true : false;

    // Build dropdown options for event submissions based on episode_wise property
    let eventSubmissionOptions = [
        { value: '', label: 'Choose an option...' },
        { value: 'new', label: 'New Submission' },
        { value: 'Add next episode', label: 'Add next episode' }
    ];

    // Only add "Add next episode" if episode_wise is true`
    if (!isEpisodeWise) {
        const [a, b, ..._] = eventSubmissionOptions;
        eventSubmissionOptions = [a, b];
    }

    // Content submission options (always just new)
    const contentSubmissionOptions = [
        { value: '', label: 'Choose an option...' },
        { value: 'new', label: 'New Submission' },
        { value: 'Add next episode', label: 'Add next episode of contents' }
    ];
    // console.log("eventSubmissionOptions===============>", eventSubmissionOptions, selectedEvent, state.events, state.selectedEventId)
    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/30">
            <div className="container mx-auto px-4 py-6 sm:py-8">
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Submit Your Work</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Share your story or poem with our community
                    </p>
                </div>

                <Tabs value={activeTab} onValueChange={(val) => {
                    setActiveTab(val);
                    actions.setIsEvent(val === 'event');
                    actions.resetForm(); // Reset form data to default state when tab switches
                }}>
                    <div className="mb-6 flex justify-center">
                        <TabsList>
                            <TabsTrigger value="content">
                                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span>Content Submission</span>
                            </TabsTrigger>
                            <TabsTrigger value="event">
                                <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span>Event Submission</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Content Submission Tab */}
                    <TabsContent value="content">
                        <div className="space-y-4 sm:space-y-6">
                            <PublicationDestinationCard
                                selectedPublisher={state.selectedPublisher}
                                setSelectedPublisher={actions.setSelectedPublisher}
                                selectedFolder={state.selectedFolder}
                                setSelectedFolder={actions.setSelectedFolder}
                            />

                            <Card>
                                <CardHeader>
                                    <CardTitle>Submission Type</CardTitle>
                                    <CardDescription>Is this a new submission or an update to an existing submission?</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <AnimatedSelect
                                        options={contentSubmissionOptions}
                                        value={state.newSubmission}
                                        onChange={(e) => {
                                            console.log("e.target.value===============>", e)
                                            actions.setNewSubmission(e);
                                            // if (e.target.value === 'new') {
                                            //     actions.setNewSubmission('new');
                                            // } else {
                                            //     actions.setNewSubmission('Add next episode of contents');
                                            // }
                                        }}
                                    />
                                </CardContent>
                            </Card>

                            {state.newSubmission === 'new' && (
                                <>
                                    <CheckForApp
                                        selectedDestination={state.destination}
                                        setSelectedDestination={actions.setDestination}
                                    />
                                    <SubmissionTypeCard
                                        newSubmission={state.newSubmission}
                                        setNewSubmission={actions.setNewSubmission}
                                        type={state.type}
                                        setType={actions.setType}
                                        newContent={state.newContent}
                                        setNewContent={actions.setNewContent}
                                        episodeNumber={state.episodeNumber}
                                        setEpisodeNumber={actions.setEpisodeNumber}
                                        category={state.category}
                                        setCategory={actions.setCategory}
                                    />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                        <ImageUploadField
                                            title="Background Image"
                                            description="Upload the background image (16:9)"
                                            image={state.backgroundImage}
                                            onImageUpload={(e) => actions.handleImageUpload(e, actions.setBackgroundImage, 1.77, "16:9 (Landscape)")}
                                            onRemoveImage={() => actions.handleRemoveImage(actions.setBackgroundImage, refs.backgroundInputRef)}
                                            inputRef={refs.backgroundInputRef}
                                            aspectRatio="16:9 (approx 1.77:1)"
                                            previewAspectRatio="aspect-video"
                                        />

                                        <ImageUploadField
                                            title="Cover Image"
                                            description="Upload the cover image (9:16)"
                                            image={state.coverImage}
                                            onImageUpload={(e) => actions.handleImageUpload(e, actions.setCoverImage, 9 / 16, "9:16 (Portrait)")}
                                            onRemoveImage={() => actions.handleRemoveImage(actions.setCoverImage, refs.coverInputRef)}
                                            inputRef={refs.coverInputRef}
                                            aspectRatio="9:16 (Vertical)"
                                            previewAspectRatio="aspect-[2/3]"
                                            previewMaxWidth="w-32"
                                        />
                                    </div>
                                </>
                            )}
                            <SubmissionTypeCard
                                newSubmission={state.newSubmission}
                                setNewSubmission={actions.setNewSubmission}
                                type={state.type}
                                setType={actions.setType}
                                newContent={state.newContent}
                                setNewContent={actions.setNewContent}
                                episodeNumber={state.episodeNumber}
                                setEpisodeNumber={actions.setEpisodeNumber}
                                category={state.category}
                                setCategory={actions.setCategory}
                            />
                            <Card>
                                <CardHeader>
                                    <CardTitle>Title</CardTitle>
                                    <CardDescription>Enter a compelling title for your {state.type}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Input
                                        placeholder={`Enter your ${state.type} title...`}
                                        value={state.title}
                                        onChange={(e) => actions.setTitle(e.target.value)}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Content</CardTitle>
                                    <CardDescription>Write your {state.type} below</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <RichTextEditor
                                        content={state.content}
                                        onChange={actions.setContent}
                                        placeholder={`Start writing your ${state.type}...`}
                                    />
                                </CardContent>
                            </Card>

                            <OriginalConfirmationCard
                                isOriginal={state.isOriginal}
                                setIsOriginal={actions.setIsOriginal}
                            />

                            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={actions.submit}
                                    disabled={!state.isOriginal || state.isPending}
                                    className="w-full sm:w-auto min-h-[48px] order-2 sm:order-1"
                                >
                                    {state.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <Send className="h-4 w-4 mr-2" />
                                    )}
                                    Save as Draft
                                </Button>
                                <Button
                                    size="lg"
                                    onClick={actions.submit}
                                    disabled={!state.isOriginal || state.isPending}
                                    className="w-full sm:w-auto min-h-[48px] order-1 sm:order-2"
                                >
                                    {state.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <Send className="h-4 w-4 mr-2" />
                                    )}
                                    Submit {contentTypeLabel}
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Event Submission Tab */}
                    <TabsContent value="event">
                        <div className="space-y-4 sm:space-y-6">
                            <EventSubmissionCard
                                selectedEventId={state.selectedEventId}
                                setSelectedEventId={actions.setSelectedEventId}
                                events={state.events}
                            />

                            <Card>
                                <CardHeader>
                                    <CardTitle>Submission Type</CardTitle>
                                    <CardDescription>Is this a new submission or an update to an existing submission?</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <AnimatedSelect
                                        options={eventSubmissionOptions}
                                        value={state.newSubmission}
                                        onChange={actions.setNewSubmission}
                                    />
                                </CardContent>
                            </Card>

                            {state.newSubmission === 'new' && (
                                <>
                                    <SubmissionTypeCard
                                        newSubmission={state.newSubmission}
                                        setNewSubmission={actions.setNewSubmission}
                                        type={state.type}
                                        setType={actions.setType}
                                        newContent={state.newContent}
                                        setNewContent={actions.setNewContent}
                                        episodeNumber={state.episodeNumber}
                                        setEpisodeNumber={actions.setEpisodeNumber}
                                        category={state.category}
                                        setCategory={actions.setCategory}
                                    />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                        <ImageUploadField
                                            title="Background Image"
                                            description="Upload the background image (16:9)"
                                            image={state.backgroundImage}
                                            onImageUpload={(e) => actions.handleImageUpload(e, actions.setBackgroundImage, 1.77, "16:9 (Landscape)")}
                                            onRemoveImage={() => actions.handleRemoveImage(actions.setBackgroundImage, refs.backgroundInputRef)}
                                            inputRef={refs.backgroundInputRef}
                                            aspectRatio="16:9 (approx 1.77:1)"
                                            previewAspectRatio="aspect-video"
                                        />

                                        <ImageUploadField
                                            title="Cover Image"
                                            description="Upload the cover image (9:16)"
                                            image={state.coverImage}
                                            onImageUpload={(e) => actions.handleImageUpload(e, actions.setCoverImage, 9 / 16, "9:16 (Portrait)")}
                                            onRemoveImage={() => actions.handleRemoveImage(actions.setCoverImage, refs.coverInputRef)}
                                            inputRef={refs.coverInputRef}
                                            aspectRatio="9:16 (Vertical)"
                                            previewAspectRatio="aspect-[2/3]"
                                            previewMaxWidth="w-32"
                                        />
                                    </div>
                                </>
                            )}

                            <Card>
                                <CardHeader>
                                    <CardTitle>Title</CardTitle>
                                    <CardDescription>Enter a compelling title for your {state.type}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Input
                                        placeholder={`Enter your ${state.type} title...`}
                                        value={state.title}
                                        onChange={(e) => actions.setTitle(e.target.value)}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Content</CardTitle>
                                    <CardDescription>Write your {state.type} below</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <RichTextEditor
                                        content={state.content}
                                        onChange={actions.setContent}
                                        placeholder={`Start writing your ${state.type}...`}
                                    />
                                </CardContent>
                            </Card>

                            <OriginalConfirmationCard
                                isOriginal={state.isOriginal}
                                setIsOriginal={actions.setIsOriginal}
                            />

                            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">

                                <Button
                                    size="lg"
                                    onClick={actions.submit}
                                    disabled={!state.isOriginal || state.isPending}
                                    className="w-full sm:w-auto min-h-[48px] order-1 sm:order-2"
                                >
                                    {state.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <Send className="h-4 w-4 mr-2" />
                                    )}
                                    Submit to Event
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
