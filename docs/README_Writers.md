# newww — Panchmeshali Admin Portal

> **Vite + React 19 + TypeScript** admin portal for the Panchmeshali Writers' Community platform.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Getting Started](#getting-started)
4. [Environment Variables](#environment-variables)
5. [Project Structure](#project-structure)
6. [Routes](#routes)
7. [Components](#components)
8. [UI Primitives (`src/ui/`)](#ui-primitives)
9. [Hooks](#hooks)
10. [API Layer (`src/lib/api.ts`)](#api-layer)
11. [State Management (`src/store/`)](#state-management)
12. [Types (`src/types/`)](#types)
13. [Constants & Data](#constants--data)
14. [Submission Wizard Logic](#submission-wizard-logic)
15. [Event Flags Reference](#event-flags-reference)

---

## Project Overview

`newww` is a single-page admin portal built with Vite. It allows administrators to:

- **Submit** stories, poems, and multi-episode books for publication or event entries.
- **Review & manage** submitted content with status tracking.
- **Create and manage Events** (writing competitions, book challenges).
- **Manage Users** — view, ban, and communicate with writers.
- **Chat** with individual writers in real time.
- **Organize a Workspace** — folder/file tree for stored content.
- Receive **Notifications** about submissions, approvals, and messages.

---

## Tech Stack

| Layer | Library / Tool |
|---|---|
| Bundler | [Vite 7](https://vitejs.dev/) |
| UI Framework | React 19 |
| Language | TypeScript 5.9 |
| Routing | [@tanstack/react-router](https://tanstack.com/router) |
| Data Fetching | [@tanstack/react-query](https://tanstack.com/query) |
| Global State | [Jotai](https://jotai.org/) |
| Styling | Tailwind CSS 4 + shadcn/ui conventions |
| Rich Text Editor | [Tiptap](https://tiptap.dev/) (`@tiptap/react`, `@tiptap/starter-kit`) |
| HTTP Client | [Axios](https://axios-http.com/) |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Forms | [@tanstack/react-form](https://tanstack.com/form) + [Zod](https://zod.dev/) |

---

## Getting Started

```bash
# Install dependencies
pnpm install

# Start dev server (http://localhost:5173)
pnpm dev

# Type-check + build for production
pnpm build

# Preview production build
pnpm preview

# Run linter
pnpm lint
```

---

## Environment Variables

Create a `.env` file in the `newww/` root:

```env
VITE_API_URL=https://your-backend-api.com
```

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL for all backend API requests |

> **Note:** The Bearer token used for authenticated API calls is currently hardcoded in `src/lib/api.ts`. This should be replaced with a dynamic auth token from a login flow in production.

---

## Project Structure

```
newww/
├── docs/                         ← Project documentation (this file)
├── public/                       ← Static assets served directly
├── src/
│   ├── App.tsx                   ← Root component; router + query client setup
│   ├── main.tsx                  ← React DOM entry point
│   ├── index.css                 ← Global styles, CSS variables, design tokens
│   ├── App.css                   ← App-level animation / utility styles
│   ├── assets/                   ← Static image/SVG assets (e.g. react.svg)
│   ├── components/               ← Shared, reusable components
│   │   └── submission/           ← Form sub-cards for the Submit wizard
│   ├── constants/                ← App-wide constant values
│   ├── data/                     ← Static mock/seed data files
│   ├── hooks/                    ← Custom React hooks
│   ├── lib/                      ← Core utilities: API, query client, helpers
│   ├── routes/                   ← One file per page/route
│   ├── store/                    ← Jotai atoms (global state)
│   ├── types/                    ← TypeScript interfaces for all domain models
│   └── ui/                       ← Primitive UI components (shadcn/ui style)
├── .env                          ← Local environment variables (not committed)
├── index.html                    ← HTML shell
├── vite.config.ts                ← Vite configuration
├── tailwind.config.js            ← Tailwind configuration
├── tsconfig.app.json             ← TypeScript config for application code
└── package.json
```

---

## Routes

All routes are registered in `src/App.tsx` using `@tanstack/react-router`. Every route is wrapped by the shared `Layout` component.

| Path | Component File | Description |
|---|---|---|
| `/` | `routes/Dashboard.tsx` | Overview dashboard with stats and quick links |
| `/submit` | `routes/Submit.tsx` | Multi-step content & event submission wizard |
| `/content` | `routes/ContentList.tsx` | Paginated list of submitted content with filters |
| `/content/$id` | `routes/ContentDetail.tsx` | Detail view for a single piece of content |
| `/events` | `routes/Events.tsx` | Event management — create, list, search |
| `/users` | `routes/Users.tsx` | User management — create, ban, email |
| `/chats` | `routes/Chats.tsx` | Admin–Writer chat interface |
| `/workspace` | `routes/Workspace.tsx` | Folder tree & file workspace |
| `/settings` | `routes/Settings.tsx` | Application settings |

---

## Components

### Shared Components (`src/components/`)

| File | Description |
|---|---|
| `Layout.tsx` | App shell — animated sidebar, top notification bar, page banner, and mobile overlay. Reads sidebar state from Jotai. Renders a `Banner` per route. |
| `Banner.tsx` | Full-width hero banner at the top of every page. Receives `title` and `image` URL from `Layout`. |
| `NotificationDropdown.tsx` | Bell icon dropdown that shows unread notifications. Fetches from `fetchNotifications()` and supports mark-as-read. |
| `RichTextEditor.tsx` | Tiptap-based rich text editor with Bold, Italic, Heading, List, Blockquote, Undo/Redo toolbar. Accepts `content` and `onChange` props. |
| `ContentCard.tsx` | Card component for rendering a content item in the list view. Shows title, type badge, status badge, author, word count. |
| `CommentBox.tsx` | Comment thread component for `ContentDetail`. Displays existing comments and a textarea to add a new one. |
| `LoadingSkeleton.tsx` | Animated placeholder skeleton shown while data is loading. |
| `Pagination.tsx` | Reusable pagination bar. Accepts `currentPage`, `totalPages`, and `onPageChange` callback. |
| `StatusBadge.tsx` | Color-coded badge for content status: `Approved` (green), `Under Review` (yellow), `Submitted` (blue), `Rejected` (red). |
| `StorageBar.tsx` | Visual storage usage bar for the Workspace. |
| `ShareModal.tsx` | Modal for sharing a content link. |
| `FileGrid.tsx` | Grid view of files in the Workspace. |
| `FolderGrid.tsx` | Grid view of folders in the Workspace. |
| `FolderTree.tsx` | Recursive tree view of the folder hierarchy in the Workspace. |
| `CreateFolderModal.tsx` | Modal dialog for creating a new workspace folder. |
| `DeleteConfirmModal.tsx` | Confirmation dialog before deleting a file/folder. |
| `RenameFolderModal.tsx` | Modal dialog for renaming a workspace folder. |

---

### Submission Sub-components (`src/components/submission/`)

These are individual card sections used inside the multi-step Submit wizard.

| File | Props | Description |
|---|---|---|
| `EventSubmissionCard.tsx` | `selectedEventId`, `setSelectedEventId`, `events` | Dropdown card to select which event to submit to. |
| `PublicationDestinationCard.tsx` | `selectedPublisher`, `setSelectedPublisher`, `selectedFolder`, `setSelectedFolder` | Card for choosing a publisher page and folder. Required for "New Submission" in Content tab. |
| `SubmissionTypeCard.tsx` | `newSubmission`, `type`, `setType`, `newContent`, `episodeNumber`, `category`, etc. | Card for selecting Content Type (story/poem/etc.) and Category. |
| `ImageUploadField.tsx` | `title`, `description`, `image`, `onImageUpload`, `onRemoveImage`, `inputRef`, `aspectRatio`, `previewAspectRatio`, `previewMaxWidth` | Image upload with aspect ratio validation. Used for Background (16:9) and Cover (9:16) images. |
| `OriginalConfirmationCard.tsx` | `isOriginal`, `setIsOriginal` | Checkbox card for the author to confirm original authorship before final submission. |
| `CheckForApp.tsx` | `selectedDestination`, `setSelectedDestination` | Selector for publish destination: App, Social, or Both. |

---

## UI Primitives

Located in `src/ui/`. These are low-level, reusable UI building blocks following shadcn/ui conventions.

| File | Component(s) | Description |
|---|---|---|
| `button.tsx` | `Button` | Styled button with `variant` (`default`, `outline`, `ghost`, `destructive`) and `size` props. |
| `card.tsx` | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` | Composable card container. |
| `input.tsx` | `Input` | Styled `<input>` element. |
| `badge.tsx` | `Badge` | Small inline badge with `variant` (`default`, `secondary`, `outline`, `destructive`). |
| `tabs.tsx` | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | Accessible tab group controlled by `value` / `onValueChange`. |
| `animated-select.tsx` | `AnimatedSelect` | Custom animated dropdown/select replacing native `<select>`. Accepts `options: { value, label }[]`, `value`, and `onChange`. |

---

## Hooks

### `src/hooks/useSubmissionForm.ts`

The central form state hook for the entire Submit page. Manages all form fields, image upload validation, and the content submission mutation.

**Returns:**

```ts
{ state, actions, refs }
```

| `state` key | Type | Description |
|---|---|---|
| `type` | `string` | Content type (story, poem, etc.) |
| `title` | `string` | Episode / content title |
| `story_title` | `string` | Top-level story title (for new submissions) |
| `content` | `string` | Rich-text HTML content |
| `isEvent` | `boolean` | Whether the active tab is Event Submission |
| `selectedEventId` | `string` | ID of the selected event |
| `selectedPublisher` | `string` | Publisher page ID |
| `selectedFolder` | `string` | Workspace folder path |
| `isOriginal` | `boolean` | Authorship confirmation |
| `newSubmission` | `string` | `'new'` or `'Add next episode'` |
| `newContent` | `string` | Whether it is new content |
| `category` | `string` | Selected category |
| `episodeNumber` | `string` | Episode number (for next-episode submissions) |
| `backgroundImage` | `string` | Base64 background image (16:9) |
| `coverImage` | `string` | Base64 cover image (9:16) |
| `destination` | `'app' \| 'social' \| 'both' \| ''` | Publish destination |
| `events` | `Event[]` | List of fetched events |
| `folders` | `WorkspaceFolder[]` | Workspace folders from Jotai |
| `isPending` | `boolean` | Submission mutation loading state |

**Key `actions`:** `setType`, `setTitle`, `setContent`, `setIsEvent`, `setSelectedEventId`, `setSelectedPublisher`, `setNewSubmission`, `setCategory`, `setEpisodeNumber`, `setIsOriginal`, `setDestination`, `handleImageUpload`, `handleRemoveImage`, `submit`, `resetForm`

**Image validation (`handleImageUpload`):** Reads the uploaded image, calculates the aspect ratio, and rejects it with a toast + alert if it doesn't match the target ratio within a ±0.05 tolerance.

---

### `src/hooks/useToast.ts`

Lightweight toast notification hook. Returns a `toast()` function that accepts `{ title, description, variant }`.

---

## API Layer

**File:** `src/lib/api.ts`

All API calls use **Axios** with a Bearer token set in the `Authorization` header. The base URL is read from `import.meta.env.VITE_API_URL`.

> Currently the data layer is partially mocked (in-memory `mockContents`, `mockEvents`, `mockUsers`, etc.) and partially live (content submission hits the real backend). This is a migration-in-progress pattern.

---

### Content Functions

| Function | Signature | Description |
|---|---|---|
| `fetchContents` | `(page, pageSize, status?) → PaginatedResponse<Content>` | Returns paginated content list, optionally filtered by status. Mock data. 800 ms delay. |
| `fetchContentById` | `(id) → Content \| null` | Returns a single content item by ID. Mock data. 500 ms delay. |
| `fetchCommentsByContentId` | `(contentId) → Comment[]` | Returns all comments for a content item. Mock data. 400 ms delay. |
| `submitContent` | `(formData) → any` | **Live API.** POSTs to `POST /submit_contents`. Maps form fields to the backend schema. |
| `addComment` | `(contentId, text) → Comment` | Adds a comment to mock storage. 600 ms delay. |
| `checkQualityAI` | `(content) → AIQualityResponse` | Mocked AI quality scoring (score 70–100 + feedback). 1500 ms delay. |
| `proofreadAI` | `(content) → AIProofreadResponse` | Mocked AI proofreader returning corrections. 1200 ms delay. |

---

### Event Functions

| Function | Signature | Description |
|---|---|---|
| `fetchEvents` | `() → Event[]` | Returns all events sorted by creation date (newest first). Mock data. 600 ms delay. |
| `fetchEventById` | `(id) → Event \| null` | Returns a single event by `eid`. Mock data. 400 ms delay. |
| `createEvent` | `(data: CreateEventData) → Event` | Creates a new event in mock storage. 1000 ms delay. Assigns auto-generated `eid`. |

---

### User Functions

| Function | Signature | Description |
|---|---|---|
| `fetchUsers` | `() → User[]` | Returns all users sorted by creation date. Mock data. 500 ms delay. |
| `createUser` | `(data: CreateUserData) → User` | Creates a new user; throws if email already exists. Mock data. 800 ms delay. |
| `banUser` | `(userId) → User` | Sets user status to `'banned'`. Mock data. 400 ms delay. |
| `removeUser` | `(userId) → void` | Deletes a user from mock storage. 400 ms delay. |
| `sendEmail` | `(emailData: EmailData) → { success, message }` | Simulated email sending (logs to console). 1000 ms delay. |

---

### Chat Functions

| Function | Signature | Description |
|---|---|---|
| `fetchChats` | `() → Chat[]` | Returns all chats sorted by last activity, with unread counts calculated. 400 ms delay. |
| `fetchChatMessages` | `(chatId) → ChatMessage[]` | Returns all messages for a chat, sorted by timestamp. 300 ms delay. |
| `sendMessage` | `(data: SendMessageData) → ChatMessage` | Adds a new admin message to a chat. Updates the chat's `updatedAt`. 500 ms delay. |
| `createChat` | `(writerId) → Chat` | Opens a new chat session with a writer (or returns existing one). 600 ms delay. |

---

### Notification Functions

| Function | Signature | Description |
|---|---|---|
| `fetchNotifications` | `() → Notification[]` | Returns all notifications sorted by date. 300 ms delay. |
| `markNotificationAsRead` | `(notificationId) → void` | Marks a single notification as read. 200 ms delay. |
| `markAllNotificationsAsRead` | `() → void` | Marks all notifications as read. 300 ms delay. |
| `getUnreadNotificationsCount` | `() → number` | Returns count of unread notifications. 100 ms delay. |

---

## State Management

**File:** `src/store/atoms.ts`

Uses [Jotai](https://jotai.org/) for global state atoms.

| Atom | Type | Description |
|---|---|---|
| `sidebarOpenAtom` | `boolean` | Whether the sidebar is open. Defaults to `true` on desktop, `false` on mobile. |
| `currentUserAtom` | `{ name: string }` | Currently logged-in admin user info (currently static). |
| `workspaceFoldersAtom` | `WorkspaceFolder[]` | Folder tree for the Workspace page. |

**`src/lib/queryClient.ts`** — Exports the singleton `QueryClient` instance configured for `@tanstack/react-query`.

**`src/lib/utils.ts`** — Exports `cn()`: a utility that merges Tailwind class strings using `clsx` + `tailwind-merge`.

---

## Types

All domain model interfaces live in `src/types/`.

| File | Exported Types |
|---|---|
| `content.ts` | `Content`, `Story`, `Poem`, `Episode`, `Comment`, `ContentStatus` |
| `event.ts` | `Event`, `CreateEventData` |
| `user.ts` | `User`, `CreateUserData`, `EmailData` |
| `chat.ts` | `Chat`, `ChatMessage`, `SendMessageData` |
| `notification.ts` | `Notification` |
| `api.ts` | `PaginatedResponse<T>`, `AIQualityResponse`, `AIProofreadResponse` |
| `workspace.ts` | `WorkspaceFolder`, `WorkspaceFile` |

### Key Type: `Event`

```ts
interface Event {
  eid: string;           // Unique event ID
  name: string;
  description: string;
  active: boolean;
  created_by: string;
  team: string[];
  st_dt: string;         // Start date as Unix timestamp string
  en_dt: string;         // End date as Unix timestamp string
  sh_list: number;       // Shortlist count
  w_count: number;       // Word count limit
  categories: string[];
  episode_wise: boolean; // Enables "Add next episode" option in submission
  for_book?: boolean;    // Enables multi-episode book write mode
  logo: string;
  result: boolean;
  type: string;          // e.g. "vote"
  createdAt: string;
  updatedAt: string;
  __v: number;
}
```

---

## Constants & Data

### `src/constants/submission.ts`

Exports `CONTENT_TYPES` — the list of selectable content types for the submission form:

```ts
export const CONTENT_TYPES = [
  { value: 'story',  label: 'Story'  },
  { value: 'poem',   label: 'Poem'   },
  // ...
];
```

### `src/data/folderData.ts`

Static seed data for the Workspace folder tree used to populate `workspaceFoldersAtom`.

---

## Submission Wizard Logic

The `/submit` route contains two independent multi-step wizards, toggled by a Tab component:

### Content Submission Wizard (4 steps)

| Step | Label | Validation to unlock Next |
|---|---|---|
| 0 | Destination | If `newSubmission === 'new'`, a publisher must be selected |
| 1 | Details | `type` always required; if `new`: `story_title` + `category` also required |
| 2 | Write | No gate — editor always accessible |
| 3 | Review | Must confirm original authorship to Submit |

### Event Submission Wizard (3 steps)

| Step | Label | Validation to unlock Next |
|---|---|---|
| 0 | Event | An event must be selected from the list |
| 1 | Write | Conditional on event flags (see below) |
| 2 | Review | Must confirm original authorship to Submit |

---

## Event Flags Reference

Two boolean fields on an `Event` control the Write step behaviour:

| `episode_wise` | `for_book` | Write Step behaviour |
|---|---|---|
| `false` | `false` / unset | **Normal mode**: single Title input + Content editor |
| `true` | `false` / unset | Normal mode (adds "Add next episode" to submission type dropdown) |
| `true` | `true` | **Book/Episode mode**: one episode card (title + content) pre-rendered; "Add episode" button appends more cards; each card (except the last) has a remove button |

These flags are set when creating an event via the **Events Management** page (`/events`) using the three toggle checkboxes: *Event is Active*, *Episode Wise*, and *For Book*.
