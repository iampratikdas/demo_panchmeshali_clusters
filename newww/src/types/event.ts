export type EventType =
    | 'Novel'
    | 'Novella / Short novel'
    | 'Essay / Article'
    | 'Story'
    | 'Long story'
    | 'Short story'
    | 'Micro story'
    | 'Nano story / Ultra-short story'
    | 'Dramatic story'
    | 'Verse'
    | 'Rhyme / Rhyming poem'
    | 'Poem'
    | 'Prose poem'
    | 'Haiku'
    | 'Limerick'
    | 'Movie'
    | 'Web Series'
    | 'Short-stories';

export interface Event {
    _id?: string;
    eid: string;                    // Event ID
    pid?: string;                   // Publisher ID
    logo_url: string;               // Event logo
    name: string;                   // Event name
    paid: boolean;                  // Paid event
    paid_amt: number;               // Paid amount
    description: string;            // Event description
    competition: boolean;           // Is it a competition
    is_social_media: boolean;       // For social media
    default_folder: string;         // Default folder
    is_book: boolean;               // Is book
    is_app: boolean;                // Is app
    event_type: EventType;          // Event Type enum
    episode_wise: boolean;          // Episode wise submissions allowed
    active: boolean;                // Is event currently active
    created_by: string;             // User ID who created the event
    team: string[];                 // Team member names
    st_dt: string;                  // Start date (Unix timestamp as string)
    sh_list: number;                // Short list count
    en_dt: string;                  // End date (Unix timestamp as string)
    parent: string;                 // Parent/sibling event ID (empty string if none)
    parent_id?: string;             // Alias from API (same as parent)
    w_count: number;                // Word count limit
    categories: string[];           // Event categories
    createdAt: string;              // ISO timestamp
    updatedAt: string;              // ISO timestamp
    __v?: number;                    // Version key (MongoDB)
    writer_uid?: string;
    status?: string;
    // Mapped form-friendly fields (populated after fetchEventsUsers)
    type?: string;
    folders?: string;
    selectedPublisher?: string;
}

export interface CreateEventData {
    eid: string;                    // Event ID
    logo_url: string;               // Event logo
    name: string;                   // Event name
    paid: boolean;                  // Paid event
    paid_amt: number;               // Paid amount
    description: string;            // Event description
    competition: boolean;           // Is it a competition
    is_social_media: boolean;       // For social media
    default_folder: string;         // Default folder
    is_book: boolean;               // Is book
    is_app: boolean;                // Is app
    event_type: EventType;          // Event Type enum
    episode_wise: boolean;          // Episode wise submissions allowed
    active: boolean;                // Is event currently active
    team: string[];                 // Team member names
    st_dt: string;                  // Unix timestamp as string
    en_dt: string;                  // Unix timestamp as string
    parent?: string;                // Optional parent event ID
    w_count: number;
    sh_list: number;
    categories: string[];
}
