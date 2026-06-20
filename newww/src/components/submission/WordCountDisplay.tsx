interface WordCountDisplayProps {
    count: number;
    requiredCount?: number;
    isPaid?: boolean;
}

export function WordCountDisplay({ count, requiredCount, isPaid }: WordCountDisplayProps) {
    return (
        <p className="text-sm text-muted-foreground mt-3 flex items-center gap-1">
            <span>Current Word Count:</span>
            <span className="font-semibold text-foreground">{count}</span>
            {isPaid && requiredCount !== undefined && requiredCount > 0 && (
                <span className="text-muted-foreground">
                    (minimum {requiredCount} required)
                </span>
            )}
        </p>
    );
}
