// ─────────────────────────────────────────────────────────────────────────────
// useWorkspaceFiles.ts  —  React Query hooks for workspace file operations
// ─────────────────────────────────────────────────────────────────────────────
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    apiUploadWorkspaceFile,
    apiListWorkspaceFiles,
    apiDeleteWorkspaceFile,
    apiFetchStorageInfo,
    type ApiWorkspaceFile,
    type StorageInfo,
} from '../lib/workspaceFileApi';

// ── Query keys ────────────────────────────────────────────────────────────────
export const filesQueryKey = (folder_id: string) => ['workspace-files', folder_id] as const;
export const STORAGE_KEY = ['workspace-storage'] as const;

// ── useWorkspaceFiles ─────────────────────────────────────────────────────────
/** Lists files in a given folder from the API */
export function useWorkspaceFiles(folder_id: string) {
    return useQuery({
        queryKey: filesQueryKey(folder_id),
        queryFn: () => apiListWorkspaceFiles(folder_id),
        staleTime: 1000 * 30,
    });
}

// ── useStorageInfo ────────────────────────────────────────────────────────────
/** Fetches real storage usage from the backend (aggregated from MongoDB docs) */
export function useStorageInfo() {
    return useQuery({
        queryKey: STORAGE_KEY,
        queryFn: apiFetchStorageInfo,
        staleTime: 1000 * 20, // refresh every 20 s
    });
}

// ── useUploadWorkspaceFile ────────────────────────────────────────────────────
export interface UploadVars {
    file: File;
    folder_id: string;
}

export interface UploadResult {
    /** true if upload was rejected because quota is exceeded */
    overQuota: boolean;
    file?: ApiWorkspaceFile;
    storage?: StorageInfo;
    message?: string;
}

export function useUploadWorkspaceFile() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async ({ file, folder_id }: UploadVars): Promise<UploadResult> => {
            const resp = await apiUploadWorkspaceFile(file, folder_id);
            if (resp.status === 402 || resp.exceeded) {
                return { overQuota: true, storage: resp.storage, message: resp.message };
            }
            return { overQuota: false, file: resp.data, storage: resp.storage };
        },
        onSuccess: (result, variables) => {
            if (!result.overQuota) {
                // Refresh the file list for this folder
                qc.invalidateQueries({ queryKey: filesQueryKey(variables.folder_id) });
                // Refresh storage bar
                qc.invalidateQueries({ queryKey: STORAGE_KEY });
            }
        },
    });
}

// ── useDeleteWorkspaceFile ────────────────────────────────────────────────────
export function useDeleteWorkspaceFile(folder_id: string) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (file_id: string) => apiDeleteWorkspaceFile(file_id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: filesQueryKey(folder_id) });
            qc.invalidateQueries({ queryKey: STORAGE_KEY });
        },
    });
}

// ── useUpdateWorkspaceContent ─────────────────────────────────────────────────
export interface UpdateVars {
    file_id: string;
    title?: string;
    content?: string;
}

export function useUpdateWorkspaceContent(folder_id: string) {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ file_id, title, content }: UpdateVars) => 
            import('../lib/workspaceFileApi').then(m => m.apiUpdateWorkspaceContent(file_id, title, content)),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: filesQueryKey(folder_id) });
            qc.invalidateQueries({ queryKey: STORAGE_KEY });
        },
    });
}
