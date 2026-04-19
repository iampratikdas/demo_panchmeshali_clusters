// ─────────────────────────────────────────────────────────────────────────────
// useFolders.ts  —  React Query hooks for folder operations
// ─────────────────────────────────────────────────────────────────────────────
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    apiFetchAllFolders,
    apiCreateFolder,
    apiRenameFolder,
    apiDeleteFolder,
    type ApiFolderItem,
} from '../lib/folderApi';
import type { WorkspaceFolder } from '../types/workspace';

// Query key constant
const FOLDERS_KEY = ['workspace-folders'] as const;

// ── Mapper: API shape → WorkspaceFolder ──────────────────────────────────────
export function mapApiFolder(f: ApiFolderItem): WorkspaceFolder {
    return {
        id: f.folder_id,
        name: f.name,
        parentId: f.parentId,
        color: f.color ?? '#374151',
        createdAt: f.createdAt,
        modifiedAt: f.updatedAt,
    };
}

// ── useAllFolders ─────────────────────────────────────────────────────────────
/** Fetches ALL folders for the logged-in user and caches them */
export function useAllFolders() {
    return useQuery({
        queryKey: FOLDERS_KEY,
        queryFn: async () => {
            const items = await apiFetchAllFolders();
            return items.map(mapApiFolder);
        },
        staleTime: 1000 * 30, // 30 seconds
    });
}

// ── useCreateFolder ───────────────────────────────────────────────────────────
export function useCreateFolder() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ name, parentId }: { name: string; parentId?: string }) =>
            apiCreateFolder(name, parentId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: FOLDERS_KEY });
        },
    });
}

// ── useRenameFolder ───────────────────────────────────────────────────────────
export function useRenameFolder() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ folder_id, name }: { folder_id: string; name: string }) =>
            apiRenameFolder(folder_id, name),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: FOLDERS_KEY });
        },
    });
}

// ── useDeleteFolder ───────────────────────────────────────────────────────────
export function useDeleteFolder() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (folder_id: string) => apiDeleteFolder(folder_id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: FOLDERS_KEY });
        },
    });
}
