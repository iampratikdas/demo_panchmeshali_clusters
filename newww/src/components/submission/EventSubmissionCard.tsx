import { CalendarDays } from 'lucide-react';
import { AnimatedSelect } from '../../ui/animated-select';

interface EventSubmissionCardProps {
    selectedEventId: string;
    setSelectedEventId: (value: string) => void;
    events?: Array<{ eid: string; name: string; active?: boolean }>;
}

export function EventSubmissionCard({
    selectedEventId,
    setSelectedEventId,
    events,
}: EventSubmissionCardProps) {
    const activeEvents = events?.filter((event) => event.active) ?? [];

    const options = [
        { value: '', label: 'Choose an event…' },
        ...activeEvents.map((event) => ({
            value: event.eid,
            label: event.name,
        })),
    ];

    return (
        <section className="rounded-2xl bg-slate-50/80 ring-1 ring-slate-100 p-4 sm:p-5 space-y-3">
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <CalendarDays className="h-5 w-5 text-emerald-700" />
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base font-semibold text-foreground">Select Event</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                        Choose the active event you want to submit to
                    </p>
                </div>
            </div>
            {activeEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground py-3 text-center rounded-xl bg-white ring-1 ring-slate-100">
                    No active events available right now.
                </p>
            ) : (
                <AnimatedSelect
                    value={selectedEventId}
                    onChange={setSelectedEventId}
                    options={options}
                    placeholder="Choose an event…"
                />
            )}
        </section>
    );
}
