import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Select } from '../../ui/select';

interface EventSubmissionCardProps {
    selectedEventId: string;
    setSelectedEventId: (value: string) => void;
    events?: any[];
    isEvent?: boolean;
    setIsEvent?: (value: boolean) => void;
}

export function EventSubmissionCard({
    selectedEventId,
    setSelectedEventId,
    events
}: EventSubmissionCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Select Event</CardTitle>
                <CardDescription>Choose the event you want to submit to</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Select
                    id="eventSelect"
                    options={[
                        { value: '', label: 'Choose an event...' },
                        ...(events
                            ?.filter(event => event.active) // Only show active events
                            ?.map(event => ({
                                value: event.eid,
                                label: event.name,
                            })) || []),
                    ]}
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                />
            </CardContent>
        </Card>
    );
}
