import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { AnimatedSelect } from '../../ui/animated-select';
import { Input } from '../../ui/input';
import { CONTENT_TYPES, CATEGORY_TYPES } from '../../constants/submission';

interface SubmissionTypeCardProps {
    newSubmission: boolean;
    setNewSubmission: (value: boolean) => void;
    type: string;
    setType: (value: string) => void;
    newContent: string;
    setNewContent: (value: string) => void;
    episodeNumber: string;
    setEpisodeNumber: (value: string) => void;
    category: string;
    setCategory: (value: string) => void;
}

export function SubmissionTypeCard({
    newSubmission,
    setNewSubmission,
    type,
    setType,
    newContent,
    setNewContent,
    episodeNumber,
    setEpisodeNumber,
    category,
    setCategory
}: SubmissionTypeCardProps) {
    return (
        <>


            {newSubmission && (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle>Content Type</CardTitle>
                            <CardDescription>Select what you want to submit</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AnimatedSelect
                                options={CONTENT_TYPES}
                                value={type}
                                onChange={setType}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Category</CardTitle>
                            <CardDescription>Select the category</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AnimatedSelect
                                options={CATEGORY_TYPES}
                                value={category}
                                onChange={setCategory}
                            />
                        </CardContent>
                    </Card>
                </>
            )}

            {!newSubmission && (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle>(Update or Continue) for (existing or new) Episode</CardTitle>
                            <CardDescription>Select the submission you want to update</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AnimatedSelect
                                options={[
                                    { value: '', label: 'Choose an option...' },
                                    { value: 'story_1', label: 'Story 1' },
                                    { value: 'story_2', label: 'Story 2' },
                                    { value: 'story_3', label: 'Story 3' },
                                    { value: 'story_4', label: 'Story 4' },
                                    { value: 'story_5', label: 'Story 5' },
                                ]}
                                value={newContent}
                                onChange={setNewContent}
                            />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Episode Number</CardTitle>
                            <CardDescription>Enter the episode number</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Input
                                placeholder={`Enter your ${type} episode number...`}
                                value={episodeNumber}
                                type="number"
                                min={1}
                                onChange={(e) => setEpisodeNumber(e.target.value)}
                            />
                        </CardContent>
                    </Card>
                </>
            )}
        </>
    );
}
