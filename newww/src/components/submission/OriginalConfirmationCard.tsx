import { CheckCircle2, ShieldCheck } from 'lucide-react';

interface OriginalConfirmationCardProps {
    isOriginal: boolean;
    setIsOriginal: (value: boolean) => void;
}

export function OriginalConfirmationCard({
    isOriginal,
    setIsOriginal,
}: OriginalConfirmationCardProps) {
    return (
        <section
            className={`rounded-2xl p-4 sm:p-5 ring-1 transition-colors ${
                isOriginal
                    ? 'bg-emerald-50/80 ring-emerald-200'
                    : 'bg-slate-50/80 ring-slate-100'
            }`}
        >
            <div className="flex items-start gap-3">
                <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isOriginal ? 'bg-emerald-100' : 'bg-slate-200'
                    }`}
                >
                    <ShieldCheck
                        className={`h-5 w-5 ${isOriginal ? 'text-emerald-700' : 'text-slate-500'}`}
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold flex items-center gap-2">
                        Original Writing Confirmation
                        {isOriginal && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Required before submission</p>

                    <label
                        htmlFor="isOriginal"
                        className="mt-4 flex items-start gap-3 cursor-pointer group touch-manipulation"
                    >
                        <input
                            type="checkbox"
                            id="isOriginal"
                            checked={isOriginal}
                            onChange={(e) => setIsOriginal(e.target.checked)}
                            className="h-5 w-5 mt-0.5 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                        />
                        <span className="text-sm leading-relaxed text-foreground/90 group-hover:text-foreground">
                            I confirm this is my original work and I have not plagiarized from any source. I
                            understand that submitting plagiarized content may result in rejection.
                        </span>
                    </label>

                    {!isOriginal && (
                        <p className="text-xs text-amber-700 mt-3 pl-8">
                            You must confirm originality to submit.
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}
