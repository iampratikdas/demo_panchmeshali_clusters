// ─────────────────────────────────────────────────────────────────────────────
// folderApi.ts  —  API helpers for the Folder endpoints
// All requests require a Bearer token from localStorage.
// ─────────────────────────────────────────────────────────────────────────────

const BASE = import.meta.env.VITE_API_URL as string;

function authHeaders() {
    const token = localStorage.getItem('token') ?? '';
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface ApiFolderItem {
    _id: string;
    folder_id: string;
    name: string;
    uid: string;
    parentId: string;
    color: string;
    is_deleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface FolderApiResponse<T = ApiFolderItem[]> {
    status: number;
    message: string;
    data: T;
}

// ── API calls ─────────────────────────────────────────────────────────────────

/** Fetch ALL folders for the authenticated user (returns flat array) */
export async function apiFetchAllFolders(): Promise<ApiFolderItem[]> {
    const res = await fetch(`${BASE}/list_folders`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({}),
    });
    const json: FolderApiResponse = await res.json();
    if (json.status !== 200) throw new Error(json.message);
    return json.data;
}

/** Fetch children of a specific folder */
export async function apiFetchChildren(parentId: string): Promise<ApiFolderItem[]> {
    const res = await fetch(`${BASE}/list_folders`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ parentId }),
    });
    const json: FolderApiResponse = await res.json();
    if (json.status !== 200) throw new Error(json.message);
    return json.data;
}

/** Create a new folder */
export async function apiCreateFolder(name: string, parentId = 'root'): Promise<ApiFolderItem> {
    const res = await fetch(`${BASE}/create_folder`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ name, parentId }),
    });
    const json: FolderApiResponse<ApiFolderItem> = await res.json();
    if (json.status !== 200) throw new Error(json.message);
    return json.data;
}

/** Rename an existing folder */
export async function apiRenameFolder(folder_id: string, name: string): Promise<void> {
    const res = await fetch(`${BASE}/rename_folder`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ folder_id, name }),
    });
    const json: FolderApiResponse = await res.json();
    if (json.status !== 200) throw new Error(json.message);
}

/** Delete a folder (soft-delete on backend) */
export async function apiDeleteFolder(folder_id: string): Promise<void> {
    const res = await fetch(`${BASE}/delete_folder`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ folder_id }),
    });
    const json: FolderApiResponse = await res.json();
    if (json.status !== 200) throw new Error(json.message);
}
