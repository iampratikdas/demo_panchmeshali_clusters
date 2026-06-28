import { Loader2, Send, ChevronRight, ChevronLeft, Check, PlusCircle, Trash2, PenLine } from 'lucide-react';
import { useState, useMemo, useEffect, type ReactNode } from 'react';import { useSubmissionForm } from '../hooks/useSubmissionForm';
import { CONTENT_TYPES } from '../constants/submission';
import { RichTextEditor } from '../components/RichTextEditor';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { AnimatedSelect } from '../ui/animated-select';
import { Tabs, TabsContent } from '../ui/tabs';import { ConfirmModal } from '../components/teams/ConfirmModal';
import { WordCountDisplay } from '../components/submission/WordCountDisplay';
import { countWordsFromHtml } from '../lib/wordCount';
import { isSingleNovelEpisodeMode, requiresCategorySelection, requiresHeadTitle } from '../lib/eventRules';
import { EventSubmissionCard } from '../components/submission/EventSubmissionCard';
import { PublicationDestinationCard } from '../components/submission/PublicationDestinationCard';
import { SubmissionTypeCard } from '../components/submission/SubmissionTypeCard';
import { ImageUploadField } from '../components/submission/ImageUploadField';
import { OriginalConfirmationCard } from '../components/submission/OriginalConfirmationCard';
import { CheckForApp } from '../components/submission/CheckForApp';
import { motion, AnimatePresence } from 'framer-motion';

const innerCardClass = 'border-0 shadow-none ring-1 ring-slate-100 rounded-xl bg-white';

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
    const pct = ((currentStep + 1) / steps.length) * 100;

    return (
        <div className="mb-6 sm:mb-8">
            {/* Mobile: compact progress */}
            <div className="sm:hidden space-y-2">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                        Step {currentStep + 1} of {steps.length}
                    </span>
                    <span className="font-semibold text-emerald-700">{steps[currentStep]?.label}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-emerald-600 rounded-full"
                        initial={false}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                    />
                </div>
                <p className="text-xs text-muted-foreground text-center">{steps[currentStep]?.description}</p>
            </div>

            {/* Desktop: horizontal stepper */}
            <div className="hidden sm:flex items-start justify-between relative px-2">
                <div className="absolute top-5 left-8 right-8 h-0.5 bg-slate-200 z-0" />
                <motion.div
                    className="absolute top-5 left-8 h-0.5 bg-emerald-600 z-0"
                    initial={false}
                    animate={{
                        width:
                            steps.length > 1
                                ? `calc(${(currentStep / (steps.length - 1)) * 100}% - 4rem)`
                                : '0%',
                    }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                />

                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isActive = index === currentStep;
                    return (
                        <div key={step.label} className="flex flex-col items-center z-10 flex-1 min-w-0 px-1">
                            <div
                                className={`
                                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-semibold text-sm
                                    ${isCompleted
                                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                                        : isActive
                                            ? 'bg-white border-emerald-600 text-emerald-700 ring-4 ring-emerald-100 shadow-sm'
                                            : 'bg-white border-slate-200 text-slate-400'
                                    }
                                `}
                            >
                                {isCompleted ? <Check className="w-4 h-4" /> : <span>{index + 1}</span>}
                            </div>
                            <div className="mt-2.5 text-center max-w-[7rem]">
                                <p
                                    className={`text-xs font-semibold truncate ${
                                        isActive ? 'text-emerald-700' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                                    }`}
                                >
                                    {step.label}
                                </p>
                                <p className="text-[10px] mt-0.5 text-muted-foreground line-clamp-2">{step.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function WizardShell({ children }: { children: ReactNode }) {
    return (
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 overflow-hidden">
            <div className="p-4 sm:p-6 md:p-8">{children}</div>
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
    disableSubmit?: boolean;
}

function NavButtons({ step, totalSteps, onBack, onNext, onSubmit, onDraft, isPending, isOriginal, submitLabel, disableNext, disableSubmit }: NavButtonsProps) {
    const isLastStep = step === totalSteps - 1;

    return (
        <div className="sticky bottom-0 z-20 -mx-4 sm:mx-0 px-4 sm:px-0 py-4 sm:py-0 mt-6 sm:mt-8 bg-white/95 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none border-t border-slate-100 sm:border-t sm:border-slate-100 sm:pt-6">
            <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 max-w-3xl mx-auto">
                <Button
                    variant="outline"
                    onClick={onBack}
                    disabled={step === 0}
                    className="w-full sm:w-auto min-h-[48px] gap-2 rounded-xl border-slate-200 touch-manipulation"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                </Button>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    {isLastStep && onDraft && (
                        <Button
                            variant="outline"
                            onClick={onDraft}
                            disabled={!isOriginal || isPending}
                            className="w-full sm:w-auto min-h-[48px] gap-2 rounded-xl border-slate-200 touch-manipulation"
                        >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            Save as Draft
                        </Button>
                    )}

                    {isLastStep ? (
                        <Button
                            onClick={onSubmit}
                            disabled={!isOriginal || isPending || disableSubmit}
                            className="w-full sm:w-auto min-h-[48px] gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm touch-manipulation"
                        >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            {submitLabel ?? 'Submit'}
                        </Button>
                    ) : (
                        <Button
                            onClick={onNext}
                            disabled={disableNext}
                            className="w-full sm:w-auto min-h-[48px] gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm touch-manipulation disabled:opacity-50"
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    )}
                </div>
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
        <div className="w-full max-w-3xl mx-auto">
            <StepIndicator steps={CONTENT_STEPS} currentStep={step} />

            <WizardShell>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -12 }}
                            transition={{ duration: 0.25 }}
                            className="space-y-4 sm:space-y-5"
                        >
                    {/* Step 1 – Destination */}
                    {step === 0 && (
                        <div className="space-y-4 sm:space-y-5">
                            <Card className={innerCardClass}>
                                <CardHeader>
                                    <CardTitle>Submission Type</CardTitle>
                                    <CardDescription>Is this a new submission or an update to an existing submission?</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <AnimatedSelect
                                        options={contentSubmissionOptions}
                                        value={String(state.newSubmission)}
                                        onChange={(value) => actions.setNewSubmission(value === 'true')}
                                    />
                                </CardContent>
                            </Card>
                            {
                                state.newSubmission && (
                                    <PublicationDestinationCard
                                        selectedPublisher={state.selectedPublisher}
                                        setSelectedPublisher={actions.setSelectedPublisher}
                                        selectedFolder={state.selectedFolder}
                                        setSelectedFolder={actions.setSelectedFolder}
                                    />
                                )
                            }
                            <CheckForApp
                                selectedDestination={state.publicationDestination}
                                setSelectedDestination={actions.setPublicationDestination}
                            />
                        </div>
                    )}

                    {/* Step 2 – Details */}
                    {step === 1 && (
                        <div className="space-y-4 sm:space-y-6">
                            {state.newSubmission && (
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

                            {state.newSubmission && (
                                <Card className={innerCardClass}>
                                    <CardHeader>
                                        <CardTitle>Story Title</CardTitle>
                                        <CardDescription>Enter a compelling title for your story</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <Input
                                            placeholder="Enter your story title..."
                                            value={state.story_title}
                                            onChange={(e) => actions.setStoryTitle(e.target.value)}
                                            className="rounded-xl h-11"
                                        />
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Destination</label>
                                            <Input
                                                value={state.destination || state.story_title}
                                                readOnly
                                                disabled
                                                placeholder="Auto-generated from story title"
                                                className="bg-muted/50"
                                            />
                                            <p className="text-xs text-muted-foreground">Auto-generated from your story title</p>
                                        </div>
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

                            {!state.newSubmission && (
                                <Card className={innerCardClass}>
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
                            <Card className={innerCardClass}>
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
                                    <WordCountDisplay count={state.wordCount} />
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

                        </motion.div>
                    </AnimatePresence>

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
                            (step === 0 && state.newSubmission && !state.selectedPublisher) ||
                            (step === 1 && (
                                !state.type ||
                                (state.newSubmission && (!state.story_title || !state.category))
                            ))
                        }
                    />
            </WizardShell>
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

    const isEpisodeMode = !!(selectedEvent as any)?.episode_wise && !!(selectedEvent as any)?.for_book;

    const [episodes, setEpisodes] = useState<Episode[]>([{ id: Date.now(), title: '', content: '' }]);

    const episodeWordCount = useMemo(
        () => episodes.reduce((sum, ep) => sum + countWordsFromHtml(ep.content), 0),
        [episodes]
    );

    const categoryOptions = [
        { value: '', label: 'Choose a category...' },
        ...(selectedEvent?.categories?.map(cat => ({ value: cat, label: cat })) ?? []),
    ];

    const isEpisodeWise = !!selectedEvent?.episode_wise;
    const showCategory = !!(
        selectedEvent?.categories?.length
        && requiresCategorySelection(selectedEvent, state.newSubmission)
    );
    const showHeadTitle = requiresHeadTitle(selectedEvent);
    const hasNoEpisodes = !state.eventEpisodes?.length;
    const isNextEpisodeBlocked =
        isEpisodeWise && !state.newSubmission && (hasNoEpisodes || !state.previousEpisode);
    const isHeadTitleBlocked = showHeadTitle && !state.h_title.trim();
    const isEpisodeNumberBlocked = isEpisodeWise && !!state.episodeNumberError;

    const previousEpisodeOptions = [
        { value: '', label: 'Choose previous episode...' },
        ...(state.eventEpisodes?.map(ep => ({
            value: ep.cont_id,
            label: ep.name,
        })) ?? []),
    ];

    const handlePreviousEpisodeChange = (contId: string) => {
        actions.setPreviousEpisode(contId);
        const ep = state.eventEpisodes?.find(e => e.cont_id === contId);
        if (ep?.h_title) {
            actions.setHeadTitle(ep.h_title);
        }
    };

    const handleSubmit = () => {
        if (isEpisodeMode) {
            actions.attemptSubmit(episodeWordCount);
        } else {
            actions.attemptSubmit();
        }
    };

    const currentWordCount = isEpisodeMode ? episodeWordCount : state.modalWordCount;
    const disableSubmit = !!(
        (selectedEvent?.w_count ?? 0) > 0 &&
        currentWordCount > (selectedEvent?.w_count ?? 0)
    );

    const addEpisode = () =>
        setEpisodes(prev => [...prev, { id: Date.now(), title: '', content: '' }]);

    const removeEpisode = (id: number) =>
        setEpisodes(prev => prev.length > 1 ? prev.filter(ep => ep.id !== id) : prev);

    const updateEpisode = (id: number, field: 'title' | 'content', value: string) =>
        setEpisodes(prev => prev.map(ep => ep.id === id ? { ...ep, [field]: value } : ep));

    const goNext = () => setStep(s => Math.min(s + 1, total - 1));
    const goBack = () => setStep(s => Math.max(s - 1, 0));

    return (
        <div className="w-full max-w-3xl mx-auto">
            <StepIndicator steps={EVENT_STEPS} currentStep={step} />
            <WizardShell>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-4 sm:space-y-5"
                    >
                    {/* Step 1 – Event selection */}
                    {step === 0 && (
                        <div className="space-y-4 sm:space-y-5">
                            <EventSubmissionCard
                                selectedEventId={state.selectedEventId}
                                setSelectedEventId={actions.setSelectedEventId}
                                events={state.events}
                            />
                            {showCategory && (
                                <Card className={innerCardClass}>
                                    <CardHeader>
                                        <CardTitle>Category</CardTitle>
                                        <CardDescription>Select a category for your submission</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <AnimatedSelect
                                            options={categoryOptions}
                                            value={state.category}
                                            onChange={actions.setCategory}
                                        />
                                    </CardContent>
                                </Card>
                            )}
                            {isEpisodeWise && (
                                <>
                                    <Card className={innerCardClass}>
                                        <CardHeader>
                                            <CardTitle>Submission Type</CardTitle>
                                            <CardDescription>Is this a new submission or the next episode?</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <AnimatedSelect
                                                options={eventSubmissionOptions}
                                                value={String(state.newSubmission)}
                                                onChange={(value) => actions.setNewSubmission(value === 'true')}
                                            />
                                        </CardContent>
                                    </Card>
                                    {!state.newSubmission && (
                                        <Card className={innerCardClass}>
                                            <CardHeader>
                                                <CardTitle>Previous Episode</CardTitle>
                                                <CardDescription>Select the previous episode this continues from</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                {state.eventEpisodes && state.eventEpisodes.length > 0 ? (
                                                    <AnimatedSelect
                                                        options={previousEpisodeOptions}
                                                        value={state.previousEpisode}
                                                        onChange={handlePreviousEpisodeChange}
                                                    />
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">
                                                        No existing episodes found for this event. Submit a new episode first.
                                                    </p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )}
                                    {showHeadTitle && (
                                    <Card className={innerCardClass}>
                                        <CardHeader>
                                            <CardTitle>Head Title</CardTitle>
                                            <CardDescription>
                                                Main series title — required for episode-wise events with multiple content
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Input
                                                placeholder="Enter head title..."
                                                value={state.h_title}
                                                onChange={(e) => actions.setHeadTitle(e.target.value)}
                                            />
                                            {!state.h_title.trim() && (
                                                <p className="text-sm text-destructive mt-2">Head title is required</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                    )}
                                    <Card className={innerCardClass}>
                                        <CardHeader>
                                            <CardTitle>Episode Number</CardTitle>
                                            <CardDescription>
                                                Must be unique — cannot match an existing episode for this event
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Input
                                                type="number"
                                                min={1}
                                                placeholder="Enter episode number..."
                                                value={state.episodeNumber}
                                                onChange={(e) => actions.setEpisodeNumber(e.target.value)}
                                            />
                                            {state.episodeNumberError && (
                                                <p className="text-sm text-destructive mt-2">{state.episodeNumberError}</p>
                                            )}
                                            {state.usedEpisodeNumbers.length > 0 && (
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    Already used: {state.usedEpisodeNumbers.join(', ')}
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </>
                            )}
                        </div>
                    )}

                    {/* Step 2 – Write */}
                    {step === 1 && (
                        <div className="space-y-6">
                            {isEpisodeMode ? (
                                /* ── Multi-episode mode ── */
                                <>
                                    {episodes.map((ep, index) => (
                                        <Card key={ep.id} className={innerCardClass}>
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
                                                    <WordCountDisplay
                                                        count={countWordsFromHtml(ep.content)}
                                                        requiredCount={selectedEvent?.w_count}
                                                        isPaid={selectedEvent?.paid}
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
                                    <WordCountDisplay
                                        count={episodeWordCount}
                                        requiredCount={selectedEvent?.w_count}
                                        isPaid={selectedEvent?.paid}
                                    />
                                </>
                            ) : (
                                /* ── Normal mode ── */
                                <>
                                    <Card className={innerCardClass}>
                                        <CardHeader>
                                            <CardTitle>Title</CardTitle>
                                            <CardDescription>Enter a compelling title for your {state.type}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <Input
                                                placeholder={`Enter your ${state.type} title...`}
                                                value={state.title}
                                                onChange={(e) => actions.setTitle(e.target.value)}
                                            />
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Destination</label>
                                                <Input
                                                    value={state.destination || state.title}
                                                    readOnly
                                                    disabled
                                                    placeholder="Auto-generated from story title"
                                                    className="bg-muted/50"
                                                />
                                                <p className="text-xs text-muted-foreground">Auto-generated from your story title</p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className={innerCardClass}>
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
                                            <WordCountDisplay
                                                count={state.wordCount}
                                                requiredCount={selectedEvent?.w_count}
                                                isPaid={selectedEvent?.paid}
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
                            {disableSubmit && (
                                <p className="text-sm text-red-700 font-medium rounded-xl ring-1 ring-red-200 bg-red-50 px-4 py-3">
                                    Your word count ({currentWordCount}) exceeds the allowed limit of {selectedEvent?.w_count} words. Please reduce your content to submit.
                                </p>
                            )}
                            {!disableSubmit && (
                                <p className="text-sm text-emerald-800 font-medium rounded-xl ring-1 ring-emerald-200 bg-emerald-50 px-4 py-3">
                                    Your content is ready to be submitted. Please review once before submitting.
                                </p>
                            )}
                        </div>
                    )}

                    </motion.div>
                </AnimatePresence>

                    <NavButtons
                        step={step}
                        totalSteps={total}
                        onBack={goBack}
                        onNext={goNext}
                        onSubmit={handleSubmit}
                        isPending={state.isPending}
                        isOriginal={state.isOriginal}
                        submitLabel="Submit to Event"
                        disableSubmit={disableSubmit}
                        disableNext={
                            step === 0 && (
                                !state.selectedEventId ||
                                (showCategory && !state.category) ||
                                isNextEpisodeBlocked ||
                                isHeadTitleBlocked ||
                                isEpisodeNumberBlocked
                            ) ||
                            (step === 1 && !state.title.trim())
                        }
                    />
            </WizardShell>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Submit() {
    const { state, actions, refs } = useSubmissionForm();
    const [activeTab, setActiveTab] = useState('event');

    useEffect(() => {
        actions.setIsEvent(activeTab === 'event');
    }, [activeTab]);

    const contentTypeLabel = CONTENT_TYPES.find(ct => ct.value === state.type)?.label || 'Content';

    // Get the selected event to check episode_wise property
    const selectedEvent = state.selectedEvent ?? state.events?.find(event => event.eid === state.selectedEventId);
    const isEpisodeWise = selectedEvent?.episode_wise === undefined ? false : selectedEvent?.episode_wise ? true : false;
    const singleNovelMode = isSingleNovelEpisodeMode(selectedEvent);
    const hasExistingEpisodes = !!state.eventEpisodes?.length;

    let eventSubmissionOptions = [
        { value: 'true', label: 'New Submission' },
    ];

    if (isEpisodeWise) {
        eventSubmissionOptions.push({ value: 'false', label: 'Next Episode' });
    }

    if (singleNovelMode && hasExistingEpisodes) {
        eventSubmissionOptions = [{ value: 'false', label: 'Next Episode' }];
    }

    // Content submission options
    const contentSubmissionOptions = [
        { value: 'true', label: 'New Submission' },
        { value: 'false', label: 'Add next episode of contents' },
    ];

    return (
        <div className="w-full max-w-3xl mx-auto pb-6 sm:pb-8">
            <div className="mb-5 sm:mb-6 px-1">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                        <PenLine className="h-5 w-5 text-emerald-700" />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-semibold text-foreground">Submit your work</h2>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                            Complete each step to send your content to an event
                        </p>
                    </div>
                </div>
            </div>

            <Tabs
                value={activeTab}
                onValueChange={(val) => {
                    setActiveTab(val);
                    actions.setIsEvent(val === 'event');
                    actions.resetForm();
                }}
            >
                <TabsContent value="content" className="mt-0">
                    <ContentWizard
                        state={state}
                        actions={actions}
                        refs={refs}
                        contentSubmissionOptions={contentSubmissionOptions}
                        contentTypeLabel={contentTypeLabel}
                    />
                </TabsContent>

                <TabsContent value="event" className="mt-0">
                    <EventWizard
                        state={state}
                        actions={actions}
                        eventSubmissionOptions={eventSubmissionOptions}
                        selectedEvent={selectedEvent}
                    />
                    {selectedEvent?.paid && (
                        <ConfirmModal
                            open={state.showPaidEventModal}
                            onClose={actions.dismissPaidEventModal}
                            onConfirm={actions.confirmPaidEventSubmit}
                            title="Word Count Below Requirement"
                            description={`This is a paid event requiring a minimum of ${selectedEvent.w_count} words. Your submission currently contains ${state.modalWordCount} words. Do you still want to continue?`}
                            confirmLabel="Continue Submission"
                            variant="warning"
                            isLoading={state.isPending}
                        />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
