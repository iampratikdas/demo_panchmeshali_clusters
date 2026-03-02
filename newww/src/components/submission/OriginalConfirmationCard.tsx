import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';

interface OriginalConfirmationCardProps {
    isOriginal: boolean;
    setIsOriginal: (value: boolean) => void;
}

export function OriginalConfirmationCard({
    isOriginal,
    setIsOriginal
}: OriginalConfirmationCardProps) {
    return (
        <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                    <CheckCircle2 className="h-5 w-5" />
                    Original Writing Confirmation
                </CardTitle>
                <CardDescription>Required before submission</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-start gap-3">
                    <input
                        type="checkbox"
                        id="isOriginal"
                        checked={isOriginal}
                        onChange={(e) => setIsOriginal(e.target.checked)}
                        className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary cursor-pointer mt-0.5"
                    />
                    <label htmlFor="isOriginal" className="text-sm font-medium cursor-pointer leading-relaxed">
                        I confirm that this is my original work and I have not plagiarized from any source.
                        I understand that submitting plagiarized content may result in rejection and potential consequences.
                    </label>
                </div>
                {!isOriginal && (
                    <p className="text-xs text-muted-foreground mt-3 ml-8">
                        ⚠️ You must confirm that your work is original to submit
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
