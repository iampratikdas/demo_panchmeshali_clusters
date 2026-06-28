// ─────────────────────────────────────────────────────────────────────────────
// workspaceFileApi.ts  —  API helpers for Workspace File endpoints
// ─────────────────────────────────────────────────────────────────────────────

const BASE = import.meta.env.VITE_API_URL as string;

function authHeaders() {
    const token = localStorage.getItem('token') ?? '';
    return { Authorization: `Bearer ${token}` };
}

function authJsonHeaders() {
    return {
        ...authHeaders(),
        'Content-Type': 'application/json',
    };
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface ApiWorkspaceFile {
    _id: string;
    file_id: string;
    uid: string;
    folder_id: string;
    original_name: string;
    stored_name: string;
    file_path: string;
    mime_type: string;
    ext: 'pdf' | 'docx' | 'json';
    size_bytes: number;
    is_content?: boolean;
    excerpt?: string;
    cont_id?: string;
    is_deleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface StorageInfo {
    used_bytes: number;
    total_bytes: number;
    used_mb: number;
    total_mb: number;
    percentage: number;
    over_limit: boolean;
}

export interface UploadFileResponse {
    status: number;
    message: string;
    data: ApiWorkspaceFile;
    storage: StorageInfo;
    /** Only present when status === 402 */
    exceeded?: boolean;
}

// ── API calls ─────────────────────────────────────────────────────────────────

/** Upload a PDF or DOCX file into a folder */
export async function apiUploadWorkspaceFile(
    file: File,
    folder_id = 'root'
): Promise<UploadFileResponse> {
    const form = new FormData();
    form.append('file', file);
    form.append('folder_id', folder_id);

    const res = await fetch(`${BASE}/workspace_upload_file`, {
        method: 'POST',
        headers: authHeaders(), // NOTE: do NOT set Content-Type — browser sets multipart boundary
        body: form,
    });

    const json: UploadFileResponse = await res.json();

    // 402 = over quota — caller should show the "you must pay" alert
    if (json.status === 402) return json;

    if (json.status !== 200) throw new Error(json.message);
    return json;
}

/** List files in a specific folder */
export async function apiListWorkspaceFiles(folder_id = 'root'): Promise<ApiWorkspaceFile[]> {
    const res = await fetch(`${BASE}/workspace_list_files`, {
        method: 'POST',
        headers: authJsonHeaders(),
        body: JSON.stringify({ folder_id }),
    });
    const json = await res.json();
    if (json.status !== 200) throw new Error(json.message);
    return json.data as ApiWorkspaceFile[];
}

/** Delete a file by file_id */
export async function apiDeleteWorkspaceFile(file_id: string): Promise<StorageInfo> {
    const res = await fetch(`${BASE}/workspace_delete_file`, {
        method: 'POST',
        headers: authJsonHeaders(),
        body: JSON.stringify({ file_id }),
    });
    const json = await res.json();
    if (json.status !== 200) throw new Error(json.message);
    return json.storage as StorageInfo;
}

/** Update file content/title */
export async function apiUpdateWorkspaceContent(file_id: string, title?: string, content?: string): Promise<ApiWorkspaceFile> {
    const res = await fetch(`${BASE}/workspace_update_content`, {
        method: 'POST',
        headers: authJsonHeaders(),
        body: JSON.stringify({ file_id, title, content }),
    });
    const json = await res.json();
    if (json.status !== 200) throw new Error(json.message);
    return json.data as ApiWorkspaceFile;
}

/** Fetch JSON story content by file_id */
export async function apiFetchWorkspaceContent(file_id: string): Promise<{ title: string; content: string }> {
    const res = await fetch(`${BASE}/workspace_get_content`, {
        method: 'POST',
        headers: authJsonHeaders(),
        body: JSON.stringify({ file_id }),
    });
    const json = await res.json();
    if (json.status !== 200) throw new Error(json.message);
    return json.data as { title: string; content: string };
}

/** Get current storage usage (calculated from MongoDB document sizes) */
export async function apiFetchStorageInfo(): Promise<StorageInfo> {
    const res = await fetch(`${BASE}/workspace_storage`, {
        method: 'GET',
        headers: authJsonHeaders(),
    });
    const json = await res.json();
    if (json.status !== 200) throw new Error(json.message);
    return json.data as StorageInfo;
}
