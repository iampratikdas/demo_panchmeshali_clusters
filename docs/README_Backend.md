# backend_wen — Panchmeshali API Server

> **Node.js + Express + MongoDB** REST API backend for the Panchmeshali Writers' Community platform.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Getting Started](#getting-started)
4. [Environment Variables](#environment-variables)
5. [Project Structure](#project-structure)
6. [Server Bootstrap (`app.js`)](#server-bootstrap)
7. [Database Connections](#database-connections)
8. [Models](#models)
9. [Routes — Complete API Reference](#routes--complete-api-reference)
10. [Controllers](#controllers)
11. [Middlewares](#middlewares)
12. [Reusable Functions](#reusable-functions)
13. [Utils](#utils)
14. [Data Flow Diagram](#data-flow-diagram)
15. [Auth & Role System](#auth--role-system)
16. [Email System](#email-system)
17. [Swagger API Docs](#swagger-api-docs)

---

## Overview

`backend_wen` is the central REST API powering:
- **User management** — registration, login (email/password + Google OAuth), profile management, OTP & forgot-password flows.
- **Content management** — story/poem submission, admin review with marks, status tracking, certificate generation.
- **Event management** — create, update, delete, and list writing competitions. Supports hierarchical events (parent → child).
- **Voting system** — users vote on approved content; top-N leaderboard.
- **Notice system** — admin creates notices and bulk-emails writers via Nodemailer.

---

## Tech Stack

| Layer | Library |
|---|---|
| Runtime | Node.js |
| Framework | Express 4 |
| Primary DB | MongoDB via Mongoose 8 |
| Secondary DB | MySQL via Sequelize (mysql2) |
| Auth | JWT (`jsonwebtoken`) + Google OAuth 2.0 (`passport-google-oauth20`) |
| Password hashing | `bcrypt` / `bcryptjs` |
| Validation | `Joi` |
| Email | `nodemailer` (Gmail SMTP) |
| File uploads | `multer` |
| Date/time | `moment.js` |
| Rate limiting | `express-rate-limit` |
| Cron jobs | `node-cron` |
| API docs | Swagger (`swagger-jsdoc` + `swagger-ui-express`) |
| Cloud storage | `aws-sdk`, `firebase-admin` (integrated) |
| Excel exports | `xlsx` |

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Create .env file (see Environment Variables section)

# 3. Start with hot-reload (recommended for development)
npm start        # uses: npx nodemon index

# 4. Test run without nodemon
npm test         # uses: node app.js
```

Server starts on **`http://localhost:5000`** by default (override with `PORT` in `.env`).

---

## Environment Variables

Create a `.env` file in the `backend_wen/` root:

```env
# Server
PORT=5000

# MongoDB
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/<dbname>

# JWT
JWT_SECRET=your_jwt_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Email (Gmail SMTP)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password

# MySQL (if used)
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=panchmeshali
```

---

## Project Structure

```
backend_wen/
├── index.js                        ← Entry point — creates Server instance and calls run()
├── app.js                          ← Server class — middlewares, DB, routes, listen
├── swagger.js                      ← Swagger/OpenAPI spec configuration
├── sql.config.js                   ← Sequelize (MySQL) connection config
│
├── Route/
│   ├── Route.js                    ← Root router — instantiates all controllers + sub-routers
│   └── AppRoutes/
│       ├── User.js                 ← User route definitions
│       ├── ContentRoutes.js        ← Content route definitions
│       ├── EventRoutes.js          ← Event route definitions
│       └── VotingRoutes.js         ← Voting route definitions
│
├── controllers/
│   ├── UserController.js           ← All user-related business logic
│   ├── ContentController.js        ← Content submission, listing, marks, notices, certificates
│   ├── EventController.js          ← Event CRUD + hierarchy building
│   └── VotingController.js         ← Voting logic, leaderboard, vote counts
│
├── models/
│   ├── monogdb/                    ← Mongoose Schemas
│   │   ├── User.js
│   │   ├── Contents.js
│   │   ├── EventLists.js
│   │   ├── Votes.js
│   │   ├── StatusContent.js
│   │   └── NoticesAdmin.js
│   └── sql/                        ← Sequelize Models (MySQL)
│       └── (SQL model files)
│
├── db/
│   ├── mongodb/
│   │   └── setupDatabase.js        ← Connects to MongoDB; registers all Mongoose models
│   └── sql/
│       └── (SQL DB setup files)
│
├── middlewares/                    ← Joi validation schemas per endpoint
│   ├── UserLoginMiddleware.js
│   ├── UserRegistrationMiddleware.js
│   ├── UserForgotPasswordMiddleware.js
│   ├── UserResetPasswordMiddleware.js
│   ├── UserProfileMiddleware.js
│   ├── VerifyOtpMiddleware.js
│   ├── RequestOtpMiddleware.js
│   ├── MethodCheck.js
│   ├── PillMiddleware.js
│   ├── PillMiddlewareupdate.js
│   ├── PillCompartmentMiddleware.js
│   ├── PillConfirmationMiddleware.js
│   ├── CareGiverMiddleware.js
│   └── GeneralSettingsMiddleware.js
│
├── resuable_functions/
│   ├── Initializer.js              ← JWT auth guard + role check (used by all protected routes)
│   └── mongodb/
│       ├── GlobalModelFunctions.js ← Aggregates all model function groups into one object
│       ├── UserFunctions.js        ← MongoDB CRUD helpers for Users
│       ├── ContentFunctions.js     ← MongoDB CRUD helpers for Contents
│       ├── EventFunctions.js       ← MongoDB CRUD helpers for Events
│       ├── VoteFunctions.js        ← MongoDB CRUD helpers for Votes
│       └── NoticeFunctions.js      ← MongoDB CRUD helpers for Notices
│
├── utils/
│   ├── Authorization.js            ← JWT generation + verification helpers
│   ├── GenKey.js                   ← Generates random alphanumeric keys (IDs)
│   ├── Config.js                   ← App-wide config constants
│   ├── hashing.js                  ← bcrypt encrypt + verify helpers
│   ├── Method_Check.js             ← MethodValidate() — HTTP method guard
│   └── (other utility files)
│
├── postman/                        ← Postman collection for API testing
├── uploads/                        ← Temp directory for multer file uploads
└── public/                         ← Static files served at /public
```

---

## Server Bootstrap

**File:** `app.js` — `index.js` imports and calls `new Server().run()`.

The `Server` class runs in 4 ordered phases:

```
index.js
  └── Server.run()
        ├── 1. setupMiddlewares()   → CORS, rate limiter, session, passport, body-parser, MethodCheck
        ├── 2. setupDatabase()      → connects MongoDB via SetupDatabase.UserDbSetup(MONGO_URI)
        ├── 3. setupRoutes()        → mounts Route router at /api
        └── 4. start()             → app.listen(PORT)
```

### Key Middleware Applied Globally

| Middleware | Config |
|---|---|
| `express-rate-limit` | 100 requests / 1 minute per IP |
| `cors` | All origins (`*`), methods: GET/POST/PUT/DELETE |
| `express-session` | Secret: `'SECRET'` (change in production!) |
| `passport` | Google OAuth (web + mobile strategies) |
| `body-parser` | JSON + URL-encoded |
| `MethodCheck.validate()` | Blocks wrong HTTP methods per route |

### Google OAuth Endpoints (middleware-level, app.js)

| Path | Strategy | Description |
|---|---|---|
| `GET /api/auth/google` | `google` | Initiates Google OAuth web flow |
| `GET /api/auth/google/mobile` | `google-admin` | Initiates Google OAuth mobile/admin flow |

---

## Database Connections

### MongoDB

**File:** `db/mongodb/setupDatabase.js`

- Called as `SetupDatabase.UserDbSetup(process.env.MONGO_URI)`.
- Creates a single Mongoose connection.
- Registers all 5 collections by calling each model factory function with the `db` connection.
- Collections created: `users`, `contents`, `events`, `votes`, `noticesadmins` (or similar).

### MySQL (Secondary)

**File:** `sql.config.js`

- Uses `Sequelize` + `mysql2` driver.
- Configured separately for any relational data needs.
- Not currently used by the main API controllers (MongoDB is primary).

---

## Models

All MongoDB models are Mongoose schemas registered via factory functions: `async function Schema(db) { return db.model('CollectionName', schema) }`.

---

### `User` — `models/monogdb/User.js`

Collection: **`users`**

| Field | Type | Notes |
|---|---|---|
| `uid` | String (unique) | Auto-generated 10-char key via `GenKey` |
| `full_name` | String (required) | |
| `email` | String (required, unique, lowercase) | |
| `password` | String (required) | bcrypt hashed |
| `ph_country_code` | String | Default `""` |
| `phone_number` | String | Default `""` |
| `address` | String | Default `""` |
| `role` | String enum | `'admin'` / `'user'` / `'manager'` — default `'user'` |
| `skills` | String | Default `"writer"` |
| `badge` | Array | Achievement badges |
| `type` | Array | User type tags |
| `isActive` | Boolean | Default `false` |
| `isfirstTimeLogin` | Boolean | Default `true` |
| `lastLogin` | Date | |
| `profileImage` | String | URL or file path |
| `dob` | String | Date of birth |
| `is_deleted` | Boolean | Soft-delete flag. Default `false` |
| `createdAt` | String | Unix timestamp |
| `updatedAt` | String | Unix timestamp |

---

### `Contents` — `models/monogdb/Contents.js`

Collection: **`contents`**

| Field | Type | Notes |
|---|---|---|
| `cont_id` | String (required) | 10-char unique content ID |
| `uid` | String (required) | Submitting user's UID |
| `eid` | String | Event ID (empty if not an event submission) |
| `page_id` | String | Publisher page ID |
| `type` | String | Content type (story, poem, etc.) |
| `name` | String | Content / story title |
| `author_name` | String | Denormalized from user token |
| `content` | String | Full rich-text HTML content |
| `status` | String | Default `"Pending"`. Values: `Pending`, `Approved`, `Rejected`, `Reviewing` |
| `marks` | Array | Array of `{ uid, score }` objects added by judges |
| `event_content` | Boolean | `true` if this is an event entry |
| `orgin_content` | Boolean (required) | Author's originality declaration |
| `url` | String | Optional file/media URL |
| `token` | String | (Reserved) |
| `createdAt` | String | Unix timestamp |
| `updatedAt` | String | Unix timestamp |

---

### `Events` — `models/monogdb/EventLists.js`

Collection: **`events`**

| Field | Type | Notes |
|---|---|---|
| `eid` | String (required) | Unique event ID |
| `name` | String | Event name |
| `description` | String | Event description |
| `active` | Boolean | Whether event is live |
| `created_by` | String | UID of creator |
| `team` | Array | Team member names/IDs |
| `st_dt` | String | Start date (Unix timestamp) |
| `en_dt` | String | End date (Unix timestamp) |
| `sh_list` | Number | Shortlist count (top N who qualify for next phase) |
| `w_count` | Number | Word-count limit |
| `parent` | String | Parent event `eid` (empty string if root event) |
| `categories` | Array | Content categories |
| `result` | Boolean | Whether results have been released |
| `type` | String | `"vote"` or `"number"` (scoring method) |
| `createdAt` | String | Unix timestamp |
| `updatedAt` | String | Unix timestamp |

---

### `Votes` — `models/monogdb/Votes.js`

Collection: **`votes`**

| Field | Type | Notes |
|---|---|---|
| `vid` | String (required, unique) | 10-char unique vote ID |
| `uid` | String (required) | Voter's user UID |
| `cont_id` | String (required) | Content being voted on |
| `eid` | String | Event ID the content belongs to |
| `createdAt` | String | Unix timestamp |
| `updatedAt` | String | Unix timestamp |

One document = one vote. Duplicate vote is blocked by checking existing `{ uid, cont_id, eid }`.

---

### `NoticesAdmin` — `models/monogdb/NoticesAdmin.js`

Stores admin-created notices/announcements visible to all users.

---

### `StatusContent` — `models/monogdb/StatusContent.js`

Auxiliary schema for tracking content approval state transitions.

---

### `Publishers` — `models/monogdb/Publishers.js`

Collection: **`publishers`** (stores registered publisher companies)

| Field | Type | Notes |
|---|---|---|
| `pid` | String (unique) | Unique publisher ID |
| `uids` | Array of Strings | Linked managers/publishers user UIDs |
| `name` | String (required) | Company name |
| `description` | String | Description of the publisher |
| `email` | String | Contact email |
| `phone` | String | Contact phone |
| `logo_url` | String | URL of the publisher logo |
| `rgst_gov_id` | String | Government registration ID |
| `status` | String | Active, Pending, Inactive (default: Pending) |
| `address` / `city` / `state` / `country` / `zip_code` | String | Address details |
| `createdAt` / `updatedAt` | String | Unix timestamps |

---

### `WritersAssignedPublishers` — `models/monogdb/WritersAssignedPublishers.js`

Collection: **`writersassignedpublishers`** (stores connection status/assignments between writers and publishers)

| Field | Type | Notes |
|---|---|---|
| `pid` | String (required) | Publisher ID |
| `writer_uid` | String (required) | Writer user UID |
| `status` | String | Connection status (Pending, Accepted, Cancelled) |
| `requested_by` | String | Initiator role (publisher, writer) |
| `createdAt` / `updatedAt` | String | Unix timestamps |

---

### `WriterStats` — `models/monogdb/WriterStats.js`

Collection: **`writerstats`** (stores aggregate writer statistics and profile details)

| Field | Type | Notes |
|---|---|---|
| `writer_uid` | String (required, unique) | Writer user UID |
| `followers_count` | Number | Total followers |
| `average_rating` | Number | Average user rating (0 to 5) |
| `total_ratings` | Number | Count of ratings |
| `bio` | String | Writer bio |
| `genre_specialization` | Array of Strings | Specialized genres |
| `activity_status` | String | active, inactive, on_leave |
| `createdAt` / `updatedAt` | String | Unix timestamps |

---

## Routes — Complete API Reference

All routes are mounted at the `/api` prefix.  
**Auth guard** routes require a valid JWT in the `Authorization: Bearer <token>` header.

---

### 👤 User Routes — `Route/AppRoutes/User.js`

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/api/auth/google/callback` | — | — | Google OAuth web callback; calls `signupbygoogle` |
| `GET` | `/api/auth/google/callback/mobile` | — | — | Google OAuth mobile callback; calls `signupbygoogle` |
| `GET` | `/api/logout` | — | — | Logs out and redirects to `/hello` |
| `POST` | `/api/signup` | — | — | Email/password registration |
| `POST` | `/api/createuser` | — | — | Admin-style user creation |
| `POST` | `/api/login` | — | — | Email/password login; returns JWT |
| `GET` | `/api/getuserprofile` | ✅ JWT | any | Get own profile |
| `POST` | `/api/updateprofile` | ✅ JWT | any | Update own profile |
| `POST` | `/api/user_list` | ✅ JWT | admin, manager | List all users |
| `POST` | `/api/resetpassword` | — | — | Reset password (requires OTP) |
| `POST` | `/api/verifyotp` | — | — | Verify OTP code |
| `POST` | `/api/requestforgotpasswordotp` | — | — | Request forgot password OTP |
| `POST` | `/api/forgotpassword` | — | — | Set new password after OTP verification |
| `DELETE` | `/api/deleteaccount` | — | — | Delete own account |
| `POST` | `/api/upload-image` | — | — | Upload profile image via multipart |
| `POST` | `/api/updateprofile_by_admin` | ✅ JWT | admin, manager | Admin updates any user profile |

---

### 📝 Content Routes — `Route/AppRoutes/ContentRoutes.js`

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| `POST` | `/api/submit_contents` | ✅ JWT | any | Submit a new content piece (event or publication) |
| `POST` | `/api/list_contents` | ✅ JWT | any | List contents (user sees own; admin/manager sees all) |
| `GET` | `/api/list_notice` | — | — | Fetch all notices (public) |
| `GET` | `/api/certificate_fetch` | ✅ JWT | any | Fetch participation/winner certificate for an event |
| `POST` | `/api/add_marks_by_admins` | ✅ JWT | admin, manager | Add/update judge marks + content status |
| `POST` | `/api/create_notice_by_admin_and_mail` | ✅ JWT | admin, manager | Create notice + bulk-email writers |
| `GET` | `/api/fetch_the_content` | ✅ JWT | admin, manager | Fetch a single content for review (with mark filter) |

---

### 🏆 Event Routes — `Route/AppRoutes/EventRoutes.js`

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/api/event_lists` | ✅ JWT | admin, manager | All events with nested child hierarchy |
| `GET` | `/api/event_lists_users` | — | — | Flat event list (public, for users) |
| `POST` | `/api/create_events` | ✅ JWT | admin, manager | Create a new event |
| `PUT` | `/api/update_events?eid=<eid>` | ✅ JWT | admin, manager | Update event fields |
| `DELETE` | `/api/delete_events?eid=<eid>` | ✅ JWT | admin, manager | Hard-delete an event |

---

### 🗳️ Voting Routes — `Route/AppRoutes/VotingRoutes.js`

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/api/content_list_for_voting?eid=<eid>&status=<status>` | — | — | Content list with per-user `hasVoted` flag |
| `GET` | `/api/top_5_contents?eid=<eid>&top=<N>` | — | — | Top-N voted contents for an event |
| `POST` | `/api/vote_a_content` | ✅ JWT | any | Cast a vote for a content piece |
| `POST` | `/api/vote_counts_derivatives` | ✅ JWT | any | Vote count analytics / derivatives |

---

### 🏢 Publisher & Teams Routes — `Route/AppRoutes/PublisherRoutes.js`

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/api/publisher_lists/:uid` | ✅ JWT | any | Fetch assigned publishers for a writer |
| `GET` | `/api/publisher_companies` | ✅ JWT | admin | Fetch all publisher companies |
| `POST` | `/api/create_publisher_company` | ✅ JWT | admin | Create a new publisher company |
| `POST` | `/api/request_publisher_users/:uid` | ✅ JWT | any | Send a join request between publisher and writer |
| `POST` | `/api/update_publisher_users/:uid` | ✅ JWT | any | Update a publisher-writer assignment/connection |
| `GET` | `/api/team_requests` | ✅ JWT | publisher, both | Publisher fetches writer requests/members for their company |
| `GET` | `/api/team_requests_by_uid` | ✅ JWT | writer | Writer fetches their own requests |
| `POST` | `/api/update_team_request/:writerUid` | ✅ JWT | publisher, both | Publisher accepts, rejects, or removes a writer |
| `GET` | `/api/writer_stats/:writerUid` | ✅ JWT | any | Fetch writer stats |
| `POST` | `/api/writer_stats/:writerUid` | ✅ JWT | any | Update writer stats (bio, genres, activity) |
| `GET` | `/api/publisher_profile/:pid` | ✅ JWT | any | Fetch publisher profile details |
| `GET` | `/api/publisher_stats/:pid` | ✅ JWT | any | Fetch publisher statistics |
| `GET` | `/api/publisher_books/:pid` | ✅ JWT | any | Fetch publisher's listed books (paginated) |
| `GET` | `/api/publisher_categories/:pid` | ✅ JWT | any | Fetch distinct book categories for a publisher |

---

## Controllers

### `UserController.js`

Handles all user lifecycle operations.

| Method | Description |
|---|---|
| `signup(req, res)` | Registers new user with email/password. Hashes password with bcrypt. Generates JWT on success. |
| `createuser(req, res)` | Admin-style user creation (no immediate login). |
| `login(req, res)` | Validates email + password; returns signed JWT containing `uid`, `email`, `full_name`, `role`. |
| `signupbygoogle(req, res)` | Handles Google OAuth profile; finds or creates user in DB; returns JWT. |
| `getprofile(req, res, token_data)` | Returns authenticated user's full profile document. |
| `updateprofile(req, res, token_data)` | Updates own profile fields. |
| `updateprofileAdmin(req, res, token_data)` | Admin updates another user's profile by UID. |
| `userslist(req, res, token_data)` | Returns paginated list of all users (admin/manager only). |
| `resetpassword(req, res)` | Changes password using verified OTP token. |
| `verifyotp(req, res)` | Verifies OTP code submitted by user. |
| `requestforgotpasswordotp(req, res)` | Sends OTP email for forgot-password flow. |
| `forgotpassword(req, res)` | Sets new password after OTP verification. |
| `deleteAccount(req, res)` | Soft-deletes user (`is_deleted: true`). |
| `uploadImage(req, res)` | Accepts multipart image, processes it (via jimp/firebase/S3), saves URL to profile. |

---

### `ContentController.js`

Handles the full content lifecycle from submission to review and certificate issuance.

| Method | Description |
|---|---|
| `checkEvent(eid, parent_id, uid)` | **Internal helper.** Validates if a user qualifies for a child event by checking their participation in the parent event and whether they are in the shortlist. Uses MongoDB aggregation with `$lookup` on votes, ranked by vote count. |
| `submit(req, res, token_data)` | Submits new content. Validates event dates, parent-event participation, duplicate submission prevention, and shortlist eligibility. Inserts final content document. |
| `update(req, res)` | Updates existing content (simple field update). |
| `listContents(req, res, token_data)` | Returns paginated content list. Users see only their own; admin/manager see all. Computes `totalMarks` via `$addFields` aggregation pipeline. |
| `addMarks(req, res, token_data)` | Admin/manager assigns marks to a content entry and updates its status. Returns updated paginated list. |
| `fetchEventOneContent(req, res, token_data)` | Fetches a single content for review. If event has ended (`result: true`) returns early. If admin has already marked, returns their mark-filtered view. |
| `createNotice(req, res, token_data)` | Creates a DB notice record + sends styled HTML email to all matching users via Nodemailer. |
| `allNotice(req, res)` | Returns all notices from DB. |
| `certificateFetch(req, res, token_data)` | Validates participation, event end time, result status. Builds ranked leaderboard using vote aggregation (for `"vote"` type) or marks aggregation (for `"number"` type). Returns user rank + event details for certificate generation. |

**`submit` Flow:**
```
POST /submit_contents
  → Validate event exists + dates (st_dt ≤ now ≤ en_dt)
  → If child event: check parent participation + shortlist eligibility (checkEvent)
  → Check no duplicate submission (same uid + eid)
  → ContentInsert() → 200 OK
```

---

### `EventController.js`

Manages the full event lifecycle, including hierarchical assemblage.

| Method | Description |
|---|---|
| `eventLists(req, res, token_data)` | Fetches all events; builds a recursive tree by grouping `parent → children` into a `siblings` array. Returns root-level events with nested children. |
| `eventListsUsers(req, res)` | Returns flat list of all events (no hierarchy, public endpoint). |
| `createEvents(req, res, token_data)` | Creates a new event. If `?parent=<eid>` query param is provided, validates parent exists and links the new event. Timestamps as Unix. |
| `updatedEvents(req, res, token_data)` | Partial update: only updates fields that are present in the request body. Requires `?eid=<eid>`. |
| `deletEvents(req, res, token_data)` | Hard-deletes event document by `eid`. Requires `?eid=<eid>`. |

---

### `VotingController.js`

Handles voting operations and leaderboard generation.

| Method | Description |
|---|---|
| `contentListForVoting(req, res)` | Fetches approved contents for an event. Joins with `votes` collection via `$lookup`. Computes `voteCount` and `hasVoted` (whether the requesting user has already voted for each item). |
| `topContents(req, res)` | Aggregates via `votes` collection: groups by `cont_id`, counts votes, joins with `contents` for details, sorts descending, limits to `top` N (default 10). |
| `voteAContent(req, res, token_data)` | Validates no existing vote, verifies event + content exist, inserts vote document via `VoteInsert`, returns updated content list with `hasVoted` flags. |
| `voteCounts(req, res, token_data)` | (Defined in route; analytics endpoint for vote count breakdown.) |

---

## Middlewares

Located in `middlewares/`. Each file exports a class with:
- `static linkSchema` — a `Joi` validation schema
- `static validate(schema)` — returns an Express middleware that validates `req.body` against the schema and returns `400` with error details if invalid.

| File | Validated Schema |
|---|---|
| `UserLoginMiddleware.js` | `email` (required), `password` (required) |
| `UserRegistrationMiddleware.js` | `full_name`, `email`, `password`, `phone_number` |
| `UserForgotPasswordMiddleware.js` | `email`, `otp`, `new_password` |
| `UserResetPasswordMiddleware.js` | `email`, `old_password`, `new_password` |
| `UserProfileMiddleware.js` | Profile update fields |
| `VerifyOtpMiddleware.js` | `email`, `otp` |
| `RequestOtpMiddleware.js` | `email` |
| `MethodCheck.js` | Blocks invalid HTTP method globally via `validate()` |

> **Note:** Some middlewares are imported in routes but commented out (e.g., `UserLoginMiddleware` on `/login`). This means validation is currently opt-in per endpoint.

---

## Reusable Functions

### `resuable_functions/Initializer.js` — Auth + Role Guard

Used on **every protected route** as an `async` pre-check:

```
initializes(req, res, userFunc, role?)
  → GetUserAuthorization(req.headers.authorization)   ← verifies JWT
  → findOneUserByEmail(token_data.email)               ← user must exist in DB
  → if is_deleted === true → throw "User not found"
  → if role provided → check existingUser.role is in allowed roles[]
  → returns existingUser (used as token_data in controllers)
```

**Usage pattern in every protected route:**
```js
await initializes(req, res, userFunc, ["admin", "manager"])
  .then((token_data) => Controller.method(req, res, token_data))
  .catch((data) => res.status(404).json({ message: data.message }))
```

---

### `resuable_functions/mongodb/GlobalModelFunctions.js`

Central factory that groups all MongoDB helper function sets into one object passed to every controller:

```js
{
  usersFunctions:   UserFunctions,
  contentFunctions: ContentFunctions,
  voteFunctions:    VoteFunctions,
  eventFunctions:   EventFunctions,
  noticeFunctions:  NoticeFunctions,
  pagination:       paginationHelper
}
```

This object (`userFunc`) is constructed once in `Route.js` and passed down to all controllers and `Initializer`.

---

### `resuable_functions/mongodb/` — Model Helper Files

Each file wraps the Mongoose model with clean async helper functions:

**`UserFunctions.js`**
| Function | Description |
|---|---|
| `findOneUserByEmail(email)` | Find single user by email |
| `findOneUserById(uid)` | Find single user by UID |
| `UserInsert(data)` | Insert new user |
| `UserUpdate(filter, update)` | Update user document |
| `userList(filter, projections, limit, skip)` | List users with projections |
| `userListByData(filter)` | Find users by arbitrary filter |
| `checkUser(req)` | Optionally decodes JWT from request and returns user or null |

**`ContentFunctions.js`**
| Function | Description |
|---|---|
| `ContentInsert(data)` | Insert new content |
| `ContentUpdate(filter, update)` | Update content |
| `ContentMarksUpdate(filter, update, token_data, marks)` | Add marks entry; pushes to `marks[]` array |
| `findOneContentById(cont_id)` | Find single content by `cont_id` |
| `findOneEvenTContentOne(filter)` | Find one content (for cert / review) |
| `findOneEvenTContentAll(filter)` | Find all matching contents (for duplicate check) |
| `findUserEventAggregates(pipeline)` | Run MongoDB aggregation pipeline on `contents` |
| `contentCount(filter)` | Count matching documents |

**`EventFunctions.js`**
| Function | Description |
|---|---|
| `insertEvent(data)` | Insert new event |
| `findOneEvent(filter)` | Find single event |
| `findAllEvents(filter?)` | Find all events, optionally filtered |
| `updateEvent(filter, update)` | Update event document |
| `deleteEvent(filter)` | Delete event document |

**`VoteFunctions.js`**
| Function | Description |
|---|---|
| `VoteInsert(data)` | Insert new vote |
| `findOneEvenTVoteOne(filter)` | Check if vote exists |
| `findContentListAggregates(pipeline)` | Aggregate on `contents` (for voting view) |
| `findVoteListAggregates(pipeline)` | Aggregate on `votes` (for leaderboard) |

---

## Utils

| File | Export | Description |
|---|---|---|
| `Authorization.js` | `GenUserToken(payload)` | Signs a JWT with `JWT_SECRET`, expiry 5 weeks |
| `Authorization.js` | `GetUserAuthorization(authHeader)` | Verifies Bearer token; returns decoded payload or `{ error_code, message }` |
| `GenKey.js` | `gen(length)` | Returns a random alphanumeric string of given length (used for UIDs, content IDs, vote IDs) |
| `hashing.js` | `encrypt(plain)` | bcrypt hash (salt rounds: 10) |
| `hashing.js` | `verify(plain, hash)` | bcrypt compare |
| `Config.js` | Config object | App-wide constants (OTP expiry, etc.) |
| `Method_Check.js` | `MethodValidate(req, res, next, method)` | Returns 405 if `req.method` doesn't match expected `method` string |

---

## Data Flow Diagram

```
Client (App / Web / Postman)
         │
         ▼
   Express App  (/api/*)
         │
         ├─ Global: RateLimit → CORS → Session → Passport → BodyParser → MethodCheck
         │
         ▼
   Route.js  (creates controllers + userFunc)
         │
         ├── User.js routes
         ├── ContentRoutes.js routes
         ├── EventRoutes.js routes
         └── VotingRoutes.js routes
                   │
                   ├── MethodValidate()          ← blocks wrong HTTP methods
                   ├── initializes(req,res,userFunc,[roles])
                   │       ├── JWT decode + verify    ← GetUserAuthorization()
                   │       ├── DB lookup user by email
                   │       └── Role check
                   │
                   ▼
            Controller.method(req, res, token_data)
                   │
                   ├── Business logic
                   ├── resuable_functions/mongodb/* helpers
                   │       └── Mongoose model calls (find, insert, update, aggregate)
                   │
                   ▼
               MongoDB Atlas
                   │
                   ▼
              JSON Response
```

---

## Auth & Role System

**JWT Payload** (stored in every token):
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "uid": "abc1234567",
  "role": "user",
  "iat": 1234567890,
  "exp": 1237159890
}
```

**Roles:**

| Role | Can access |
|---|---|
| `user` | Own content, own profile, voting, event list (public), certificates |
| `manager` | All user routes + content listing + event CRUD + marks + notices |
| `admin` | All manager permissions + user management |

**How role check works:**

The `initializes()` function accepts an optional `role` array (e.g., `["admin", "manager"]`). If set, the logged-in user's `role` field must be one of the values in that array, or a `403` error is thrown.

Public routes (no `initializes()`) simply call the controller directly.

---

## Email System

**Config:** `nodemailer` with Gmail SMTP (`EMAIL_USER` + `EMAIL_PASS` app password).

**Used in:**
- `UserController` — OTP emails for forgot-password flow.
- `ContentController.createNotice()` — Bulk HTML email to all filtered users.

**Email template** in `createNotice`:
- Styled HTML with Panchmeshali branding (gold gradient header, Noto Sans Bengali font, logo).
- Supports Bengali text content.
- Dynamic `body` field from `req.body.mail.body`.

---

## Swagger API Docs

**File:** `swagger.js`

Swagger UI is served at:
```
http://localhost:5000/api-docs
```

Uses `swagger-jsdoc` to generate spec from JSDoc comments in route files (if annotated). The `swagger.js` file exports the resolved `swaggerSpec` object passed to `swagger-ui-express`.

---

## Future Roadmap (Planned Features)

We need to implement the following features next:
1. **Publisher Book Listing**: Add a feature where publishers can add the books or ebooks they have in the market that they are listing in publisher details.
2. **Sales Tracking**: Enable publishers to track and record how many sales happened on respective books/ebooks.
3. **Royalty Tracking (Optional)**: Add a feature to track how much royalty is provided to the authors.

