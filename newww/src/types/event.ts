export interface Event {
    eid: string;                    // Event ID
    name: string;                   // Event name
    description: string;            // Event description
    active: boolean;                // Is event currently active
    created_by: string;             // User ID who created the event
    team: string[];                 // Team member names
    st_dt: string;                  // Start date (Unix timestamp as string)
    sh_list: number;                // Short list count
    en_dt: string;                  // End date (Unix timestamp as string)
    parent: string;                 // Parent/sibling event ID (empty string if none)
    w_count: number;                // Word count limit
    categories: string[];           // Event categories
    episode_wise: boolean;          // If false: only show "new submission", If true: also show "next episode"
    createdAt: string;              // ISO timestamp
    updatedAt: string;              // ISO timestamp
    __v: number;                    // Version key (MongoDB)
    logo: string;                   // Logo URL
    result: boolean;                // Results released status
    type: string;                   // Event type (e.g., "vote")
}

export interface CreateEventData {
    name: string;
    description: string;
    active: boolean;
    team: string[];
    st_dt: string;                  // Unix timestamp as string
    en_dt: string;                  // Unix timestamp as string
    parent?: string;                // Optional parent event ID
    w_count: number;
    sh_list: number;
    categories: string[];
    logo: string;
    type: string;
}
