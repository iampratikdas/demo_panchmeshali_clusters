import { atom } from 'jotai';
import type { ContentStatus } from '../types/content';

// User state
export const currentUserAtom = atom({
    id: 'user1',
    name: localStorage.getItem("name"),
    email: localStorage.getItem("email"),
    role: localStorage.getItem("role"),   // set false to test writer-only view
    uid: localStorage.getItem("uid"),   // set false to test writer-only view
});

// UI state
export const sidebarOpenAtom = atom(true);
export const themeAtom = atom<'light' | 'dark'>('light');

// Filter state for content list
export const contentFilterAtom = atom<ContentStatus | 'all'>('all');
export const currentPageAtom = atom(1);

// Workspace state
// Folders are loaded from the API (see useFolders hook) and cached here.
// Files are loaded from the API per-folder (see useWorkspaceFiles hook) — no local atom needed.
import type { WorkspaceFolder } from '../types/workspace';
import { initialFolders } from '../data/folderData';

// Pre-seeded with static data; overwritten by API response in Workspace.tsx
export const workspaceFoldersAtom = atom<WorkspaceFolder[]>(initialFolders);

export const currentFolderAtom = atom<string>('root');

export const selectedFilesAtom = atom<string[]>([]);
