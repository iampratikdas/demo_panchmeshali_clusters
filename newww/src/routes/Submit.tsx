import { Loader2, Send, FileText, CalendarDays, ChevronRight, ChevronLeft, Check, PlusCircle, Trash2 } from 'lucide-react';
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

// ─── Step Indicator ──────────────────────────────────────────────────────────

interface Step {
    label: string;
    description: string;
}

interface StepIndicatorProps {
    steps: Step[];
    currentStep: number;
}

function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
    return (
        <div className="w-full mb-8">
            <div className="flex items-center justify-between relative">
                {/* connecting line behind circles */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-border z-0" />
                <div
                    className="absolute top-5 left-0 h-0.5 bg-primary z-0 transition-all duration-500"
                    style={{
                        width: steps.length > 1
                            ? `${(currentStep / (steps.length - 1)) * 100}%`
                            : '0%'
                    }}
                />

                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isActive = index === currentStep;
                    return (
                        <div key={index} className="flex flex-col items-center z-10 flex-1">
                            <div
                                className={`
                                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-semibold text-sm
                                    ${isCompleted
                                        ? 'bg-primary border-primary text-white shadow-md bg-black'
                                        : isActive
                                            ? 'bg-background border-primary text-primary shadow-lg ring-4 ring-primary/20 shadow-[rgba(50,50,93,0.25)_0px_50px_100px_-20px,rgba(0,0,0,0.3)_0px_30px_60px_-30px,rgba(10,37,64,0.35)_0px_-2px_6px_0px_inset]'
                                            : 'bg-background border-border text-muted-foreground'
                                    }
                                `}
                            >
                                {isCompleted ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    <span>{index + 1}</span>
                                )}
                            </div>
                            <div className="mt-2 text-center hidden sm:block">
                                <p className={`text-xs font-semibold transition-colors ${isActive ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    {step.label}
                                </p>
                                <p className={`text-[10px] mt-0.5 transition-colors ${isActive ? 'text-muted-foreground' : 'text-muted-foreground/60'}`}>
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* Mobile: active step label */}
            <div className="sm:hidden mt-3 text-center">
                <p className="text-sm font-semibold text-primary">{steps[currentStep]?.label}</p>
                <p className="text-xs text-muted-foreground">{steps[currentStep]?.description}</p>
            </div>
        </div>
    );
}

// ─── Navigation Buttons ───────────────────────────────────────────────────────

interface NavButtonsProps {
    step: number;
    totalSteps: number;
    onBack: () => void;
    onNext: () => void;
    onSubmit?: () => void;
    onDraft?: () => void;
    isPending?: boolean;
    isOriginal?: boolean;
    submitLabel?: string;
    disableNext?: boolean;
}

function NavButtons({ step, totalSteps, onBack, onNext, onSubmit, onDraft, isPending, isOriginal, submitLabel, disableNext }: NavButtonsProps) {
    const isLastStep = step === totalSteps - 1;

    return (
        <div className="flex flex-col-reverse  sm:flex-row justify-between gap-3 pt-6 border-t border-border mt-6">
            <Button
                variant="outline"
                onClick={onBack}
                disabled={step === 0}
                className="w-full sm:w-auto min-h-[44px] gap-2 cursor-pointer"
            >
                <ChevronLeft className="h-4 w-4" />
                Back
            </Button>

            <div className="flex flex-col sm:flex-row gap-3">
                {isLastStep && onDraft && (
                    <Button
                        variant="outline"
                        onClick={onDraft}
                        disabled={!isOriginal || isPending}
                        className="w-full sm:w-auto min-h-[44px] gap-2 cursor-pointer"
                    >
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        Save as Draft
                    </Button>
                )}

                {isLastStep ? (
                    <Button
                        onClick={onSubmit}
                        disabled={!isOriginal || isPending}
                        className="w-full sm:w-auto min-h-[44px] gap-2 cursor-pointer"
                    >
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        {submitLabel ?? 'Submit'}
                    </Button>
                ) : (
                    <Button
                        onClick={onNext}
                        disabled={disableNext}
                        className="w-full sm:w-auto min-h-[44px] gap-2 cursor-pointer"
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}

// ─── Content Wizard ───────────────────────────────────────────────────────────

const CONTENT_STEPS: Step[] = [
    { label: 'Destination', description: 'Where to publish' },
    { label: 'Details', description: 'Title & type' },
    { label: 'Write', description: 'Your content' },
    { label: 'Review', description: 'Confirm & submit' },
];

interface ContentWizardProps {
    state: ReturnType<typeof useSubmissionForm>['state'];
    actions: ReturnType<typeof useSubmissionForm>['actions'];
    refs: ReturnType<typeof useSubmissionForm>['refs'];
    contentSubmissionOptions: { value: string; label: string }[];
    contentTypeLabel: string;
}

function ContentWizard({ state, actions, refs, contentSubmissionOptions, contentTypeLabel }: ContentWizardProps) {
    const [step, setStep] = useState(0);
    const total = CONTENT_STEPS.length;

    const goNext = () => setStep(s => Math.min(s + 1, total - 1));
    const goBack = () => setStep(s => Math.max(s - 1, 0));

    return (
        <div>
            <StepIndicator steps={CONTENT_STEPS} currentStep={step} />

            <Card className="shadow-sm" style={{ backgroundColor: '#d1baba25', boxShadow: "rgba(50, 50, 93, 0.25) 0px 30px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset" }}>
                <CardContent className="pt-6">
                    {/* Step 1 – Destination */}
                    {step === 0 && (
                        <div className="space-y-4 sm:space-y-6">


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
                                            console.log("e.target.value===============>", e);
                                            actions.setNewSubmission(e);
                                        }}
                                    />
                                </CardContent>
                            </Card>
                            {
                                state.newSubmission === 'new' && (
                                    <PublicationDestinationCard
                                        selectedPublisher={state.selectedPublisher}
                                        setSelectedPublisher={actions.setSelectedPublisher}
                                        selectedFolder={state.selectedFolder}
                                        setSelectedFolder={actions.setSelectedFolder}
                                    />
                                )
                            }
                            <CheckForApp
                                selectedDestination={state.destination}
                                setSelectedDestination={actions.setDestination}
                            />
                        </div>
                    )}

                    {/* Step 2 – Details */}
                    {step === 1 && (
                        <div className="space-y-4 sm:space-y-6">
                            {state.newSubmission === 'new' && (
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
                            )}

                            {state.newSubmission === 'new' && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Story Title</CardTitle>
                                        <CardDescription>Enter a compelling title for your story</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Input
                                            placeholder="Enter your story title..."
                                            value={state.story_title}
                                            onChange={(e) => actions.setStoryTitle(e.target.value)}
                                        />
                                    </CardContent>
                                </Card>
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

                            {state.newSubmission === 'Add next episode' && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Episode Title</CardTitle>
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
                            )}
                        </div>
                    )}

                    {/* Step 3 – Write */}
                    {step === 2 && (
                        <div className="space-y-4">
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
                        </div>
                    )}

                    {/* Step 4 – Review */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <OriginalConfirmationCard
                                isOriginal={state.isOriginal}
                                setIsOriginal={actions.setIsOriginal}
                            />
                        </div>
                    )}

                    <NavButtons
                        step={step}
                        totalSteps={total}
                        onBack={goBack}
                        onNext={goNext}
                        onSubmit={actions.submit}
                        onDraft={actions.submit}
                        isPending={state.isPending}
                        isOriginal={state.isOriginal}
                        submitLabel={`Submit ${contentTypeLabel}`}
                        disableNext={
                            (step === 0 && state.newSubmission === 'new' && !state.selectedPublisher) ||
                            (step === 1 && (
                                !state.type ||
                                (state.newSubmission === 'new' && (!state.story_title || !state.category))
                            ))
                        }
                    />
                </CardContent>
            </Card>
        </div>
    );
}

// ─── Event Wizard ─────────────────────────────────────────────────────────────

const EVENT_STEPS: Step[] = [
    { label: 'Event', description: 'Select event' },
    { label: 'Write', description: 'Your content' },
    { label: 'Review', description: 'Confirm & submit' },
];

interface Episode {
    id: number;
    title: string;
    content: string;
}

interface EventWizardProps {
    state: ReturnType<typeof useSubmissionForm>['state'];
    actions: ReturnType<typeof useSubmissionForm>['actions'];
    eventSubmissionOptions: { value: string; label: string }[];
    selectedEvent?: ReturnType<typeof useSubmissionForm>['state']['events'] extends (infer E)[] | undefined ? E : never;
}

function EventWizard({ state, actions, eventSubmissionOptions, selectedEvent }: EventWizardProps) {
    const [step, setStep] = useState(0);
    const total = EVENT_STEPS.length;

    // Multi-episode mode: episode_wise AND for_book both true
    const isEpisodeMode = !!(selectedEvent as any)?.episode_wise && !!(selectedEvent as any)?.for_book;

    // Local episodes list – starts with one empty episode
    const [episodes, setEpisodes] = useState<Episode[]>([{ id: Date.now(), title: '', content: '' }]);

    const addEpisode = () =>
        setEpisodes(prev => [...prev, { id: Date.now(), title: '', content: '' }]);

    const removeEpisode = (id: number) =>
        setEpisodes(prev => prev.length > 1 ? prev.filter(ep => ep.id !== id) : prev);

    const updateEpisode = (id: number, field: 'title' | 'content', value: string) =>
        setEpisodes(prev => prev.map(ep => ep.id === id ? { ...ep, [field]: value } : ep));

    const goNext = () => setStep(s => Math.min(s + 1, total - 1));
    const goBack = () => setStep(s => Math.max(s - 1, 0));

    return (
        <div>
            <StepIndicator steps={EVENT_STEPS} currentStep={step} />

            <Card className="shadow-sm">
                <CardContent className="pt-6">
                    {/* Step 1 – Event selection */}
                    {step === 0 && (
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
                        </div>
                    )}

                    {/* Step 2 – Write */}
                    {step === 1 && (
                        <div className="space-y-6">
                            {isEpisodeMode ? (
                                /* ── Multi-episode mode ── */
                                <>
                                    {episodes.map((ep, index) => (
                                        <Card key={ep.id} className="border border-border shadow-sm">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <CardTitle className="text-base">Episode {index + 1}</CardTitle>
                                                        <CardDescription>Enter the title and content for this episode</CardDescription>
                                                    </div>
                                                    {episodes.length > 1 && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                                                            onClick={() => removeEpisode(ep.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div>
                                                    <p className="text-sm font-medium mb-1.5">Episode Title</p>
                                                    <Input
                                                        placeholder="Enter episode title..."
                                                        value={ep.title}
                                                        onChange={(e) => updateEpisode(ep.id, 'title', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium mb-1.5">Content</p>
                                                    <RichTextEditor
                                                        content={ep.content}
                                                        onChange={(val) => updateEpisode(ep.id, 'content', val)}
                                                        placeholder="Write episode content..."
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}

                                    {/* Add episode button */}
                                    <div className="flex justify-center">
                                        <Button
                                            variant="outline"
                                            className="gap-2 min-h-[44px] border-dashed border-2 px-6 text-primary hover:bg-primary/5 hover:border-primary transition-all"
                                            onClick={addEpisode}
                                        >
                                            <PlusCircle className="h-5 w-5" />
                                            Add episode
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                /* ── Normal mode ── */
                                <>
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
                                </>
                            )}
                        </div>
                    )}

                    {/* Step 3 – Review */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <OriginalConfirmationCard
                                isOriginal={state.isOriginal}
                                setIsOriginal={actions.setIsOriginal}
                            />
                        </div>
                    )}

                    <NavButtons
                        step={step}
                        totalSteps={total}
                        onBack={goBack}
                        onNext={goNext}
                        onSubmit={actions.submit}
                        isPending={state.isPending}
                        isOriginal={state.isOriginal}
                        submitLabel="Submit to Event"
                        disableNext={step === 0 && !state.selectedEventId}
                    />
                </CardContent>
            </Card>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

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

    // Only add "Add next episode" if episode_wise is true
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

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/30">
            {/* <div className="container mx-auto px-4 py-6 sm:py-8 ">
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Submit Your Work</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Share your story or poem with our community
                    </p>
                </div>


            </div> */}
            <Tabs value={activeTab} onValueChange={(val) => {
                setActiveTab(val);
                actions.setIsEvent(val === 'event');
                actions.resetForm();
            }}>
                <div className="mb-8 flex justify-center">
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

                <TabsContent value="content">
                    <ContentWizard
                        state={state}
                        actions={actions}
                        refs={refs}
                        contentSubmissionOptions={contentSubmissionOptions}
                        contentTypeLabel={contentTypeLabel}
                    />
                </TabsContent>

                <TabsContent value="event">
                    <EventWizard
                        state={state}
                        actions={actions}
                        eventSubmissionOptions={eventSubmissionOptions}
                        selectedEvent={selectedEvent}
                    />
                </TabsContent>
            </Tabs>

        </div>
    );
}
