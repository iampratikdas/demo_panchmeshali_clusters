import { atom } from 'jotai';
import type { ContentStatus } from '../types/content';

// User state
export const currentUserAtom = atom({
    id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
});

// UI state
export const sidebarOpenAtom = atom(true);
export const themeAtom = atom<'light' | 'dark'>('light');

// Filter state for content list
export const contentFilterAtom = atom<ContentStatus | 'all'>('all');
export const currentPageAtom = atom(1);

// Workspace state with mock data
import type { WorkspaceFolder, WorkspaceFile, StorageQuota } from '../types/workspace';

import { initialFolders } from '../data/folderData';

export const workspaceFoldersAtom = atom<WorkspaceFolder[]>(initialFolders);

export const workspaceFilesAtom = atom<WorkspaceFile[]>([
    {
        id: 'file-1',
        name: 'Project Proposal.pdf',
        folderId: 'folder-2',
        type: 'pdf',
        size: 2457600, // 2.4 MB
        createdAt: '2025-01-20T09:30:00Z',
        modifiedAt: '2025-01-20T09:30:00Z',
    },
    {
        id: 'file-2',
        name: 'Meeting Notes.docx',
        folderId: 'folder-3',
        type: 'docx',
        size: 524288, // 512 KB
        createdAt: '2025-01-21T14:00:00Z',
        modifiedAt: '2025-01-22T10:15:00Z',
    },
    {
        id: 'file-3',
        name: 'Budget 2025.pdf',
        folderId: 'folder-3',
        type: 'pdf',
        size: 1048576, // 1 MB
        createdAt: '2025-01-22T11:20:00Z',
        modifiedAt: '2025-01-22T11:20:00Z',
        sharedWith: ['admin@company.com'],
    },
    {
        id: 'file-4',
        name: 'Personal Notes.txt',
        folderId: 'folder-4',
        type: 'txt',
        size: 10240, // 10 KB
        createdAt: '2025-01-23T08:00:00Z',
        modifiedAt: '2025-01-23T08:00:00Z',
    },
    {
        id: 'file-5',
        name: 'Annual Report.pdf',
        folderId: 'root',
        type: 'pdf',
        size: 5242880, // 5 MB
        createdAt: '2025-01-15T12:00:00Z',
        modifiedAt: '2025-01-20T15:30:00Z',
    },
]);

export const currentFolderAtom = atom<string>('root');

// Mock storage data - in production, this would come from backend API
export const storageQuotaAtom = atom<StorageQuota>({
    total: 5368709120, // 5 GB in bytes
    used: 1288490188, // ~1.2 GB in bytes
    percentage: 24, // ~24% used
});

export const selectedFilesAtom = atom<string[]>([]);

