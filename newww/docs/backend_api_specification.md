# Backend API Specification

This document outlines all the Backend APIs required for the **Panchmeshali Admin Portal**. Some endpoints are already partially implemented (e.g., `submit_contents`), while others are currently mocked in the frontend and need full backend implementation.

## Base URL
The API base URL is configured via the `VITE_API_URL` environment variable.

---

## 1. Content Management

### GET /contents
Fetch a paginated list of content (stories/poems).
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `pageSize`: Items per page (default: 10)
  - `status`: Filter by status (`Submitted`, `Under Review`, `Approved`, `Rejected`)
- **Response**: `PaginatedResponse<Content>`

### GET /contents/{id}
Fetch details of a specific content by ID.
- **Response**: `Content` object (including episodes if applicable)

### POST /submit_contents
Submit new content or an update to existing content.
- **Payload**:
  ```json
  {
    "type": "story" | "poem",
    "storyName": "string",
    "eid": "string", 
    "storyContent": "string (HTML)",
    "url": "string (folder id)",
    "page_id": "string (publisher id)",
    "event_content": boolean,
    "isOriginalWork": boolean,
    "parent_eid": "string",
    "episodeNumber": number | string,
    "destination": "string"
  }
  ```
- **Auth**: Bearer Token required.

---

## 2. Comments & Review

### GET /contents/{id}/comments
Fetch comments for a specific piece of content.
- **Response**: `Comment[]`

### POST /contents/{id}/comments
Add a new comment to a piece of content.
- **Payload**:
  ```json
  {
    "text": "string"
  }
  ```

---

## 3. Events Management

### GET /events
Fetch all available events.
- **Response**: `Event[]`

### GET /events/{id}
Fetch details for a specific event.
- **Response**: `Event`

### POST /events
Create a new competition/event.
- **Payload**: `CreateEventData`
  ```json
  {
    "name": "string",
    "description": "string",
    "active": boolean,
    "team": ["string"],
    "st_dt": "string (Unix timestamp)",
    "en_dt": "string (Unix timestamp)",
    "parent": "string",
    "w_count": number,
    "sh_list": number,
    "categories": ["string"],
    "logo": "string (URL)",
    "type": "string",
    "episode_wise": boolean,
    "for_book": boolean
  }
  ```

---

## 4. User Management

### GET /users
Fetch a list of all users.
- **Response**: `User[]`

### POST /users
Register a new user.
- **Payload**: `CreateUserData`
- **Response**: `User`

### PATCH /users/{id}/ban
Ban a user from the platform.

### DELETE /users/{id}
Remove a user account.

### POST /email/send
Send an email to one or more users.
- **Payload**: `EmailData`
  ```json
  {
    "to": ["string"],
    "subject": "string",
    "message": "string"
  }
  ```

---

## 5. Messaging & Chat

### GET /chats
Fetch list of all active chats for the admin.
- **Response**: `Chat[]` (including last message and unread count)

### POST /chats
Create a new chat session with a user.
- **Payload**: `{ "writerId": "string" }`

### GET /chats/{id}/messages
Fetch chat history for a specific chat ID.
- **Response**: `ChatMessage[]`

### POST /chats/{id}/messages
Send a message in a chat.
- **Payload**: `{ "message": "string" }`

---

## 6. Workspace (Drive) Management

### GET /workspace/folders
Get the folder structure for the workspace.

### POST /workspace/folders
Create a new folder.
- **Payload**: `{ "name": "string", "parentId": "string" }`

### PATCH /workspace/folders/{id}
Rename a folder.
- **Payload**: `{ "name": "string" }`

### DELETE /workspace/folders/{id}
Delete a folder (should verify it is empty first).

### POST /workspace/files/upload
Upload a file to a specific folder.
- **Payload**: Multipart file data, `folderId`.

### GET /workspace/files/{id}/download
Get download link for a file.

### DELETE /workspace/files/{id}
Delete a specific file.

### GET /workspace/storage-summary
Get storage quota and usage details.

---

## 7. Notifications

### GET /notifications
Fetch all notifications for the current admin.
- **Response**: `Notification[]`

### PATCH /notifications/{id}/read
Mark a specific notification as read.

### PATCH /notifications/read-all
Mark all notifications as read.

---

## 8. AI Services (External or Internally Hosted)

### POST /ai/check-quality
Analyze content quality score and feedback.
- **Payload**: `{ "content": "string (HTML/Text)" }`

### POST /ai/proofread
Get grammar and spelling corrections for content.
- **Payload**: `{ "content": "string (HTML/Text)" }`
