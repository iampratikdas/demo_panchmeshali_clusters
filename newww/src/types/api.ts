export interface AIQualityResponse {
    score: number;
    feedback: string[];
    strengths: string[];
    improvements: string[];
}

export interface AIProofreadResponse {
    correctedText: string;
    corrections: Array<{
        original: string;
        corrected: string;
        reason: string;
    }>;
    summary: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
