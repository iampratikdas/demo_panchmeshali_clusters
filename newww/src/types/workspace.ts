export interface WorkspaceFolder {
    id: string;
    name: string;
    parentId: string | null; // null for root folders
    createdAt: string;
    modifiedAt: string;
    color?: string; // Optional color for folder
}

export interface WorkspaceFile {
    id: string;
    name: string;
    folderId: string;
    type: 'doc' | 'docx' | 'pdf' | 'txt';
    size: number; // in bytes
    createdAt: string;
    modifiedAt: string;
    sharedWith?: string[]; // email addresses
    downloadUrl?: string; // mock URL for download
}

export interface StorageQuota {
    total: number; // Total storage in bytes
    used: number; // Used storage in bytes
    percentage: number; // Usage percentage
}

export interface ShareSettings {
    fileId: string;
    emails: string[];
    theme: EmailTheme;
    message?: string;
    includeLink: boolean;
}

export type EmailTheme = 'professional' | 'modern' | 'minimal';

export interface EmailThemeConfig {
    id: EmailTheme;
    name: string;
    description: string;
    previewImage: string;
    colors: {
        primary: string;
        secondary: string;
        background: string;
        text: string;
    };
}

export interface BreadcrumbItem {
    id: string;
    name: string;
}
