/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: mypassword123
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: User does not exist
 *       401:
 *         description: Invalid password
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /createuser:
 *   post:
 *     summary: Create a new user
 *     tags: [Create User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - username
 *               - gender
 *               - role
 *               - em_country_code
 *               - ph_country_code
 *               - email
 *               - name
 *               - password
 *               - dob
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: John Doe
 *               username:
 *                 type: string
 *                 example: johndoe123
 *               gender:
 *                 type: string
 *                 example: male
 *               role:
 *                 type: string
 *                 example: user
 *               ph_country_code:
 *                 type: string
 *                 example: +91
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               name:
 *                 type: string
 *                 example: Johnny
 *               profile_image:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/images/profile.jpg
 *               password:
 *                 type: string
 *                 example: mypassword123
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: 1990-01-01
 *     responses:
 *       200:
 *         description: User created successfully
 *       400:
 *         description: Bad request - missing or invalid data
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /publisher_lists/{uid}:
 *   get:
 *     summary: Fetch the list of assigned publishers for a writer
 *     tags: [Publisher]
 *     parameters:
 *       - in: path
 *         name: uid
 *         schema:
 *           type: string
 *         required: true
 *         description: Writer user ID
 *     responses:
 *       200:
 *         description: Lists of assigned publishers fetched successfully
 *       400:
 *         description: Missing uid parameter
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /request_publisher_users/{uid}:
 *   post:
 *     summary: Request a relationship between a Writer and Publisher
 *     tags: [Publisher]
 *     parameters:
 *       - in: path
 *         name: uid
 *         schema:
 *           type: string
 *         required: true
 *         description: Target user ID (Publisher or Writer)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requested_by
 *             properties:
 *               requested_by:
 *                 type: string
 *                 example: Publisher
 *     responses:
 *       201:
 *         description: Request sent successfully
 *       400:
 *         description: Validation error / Missing fields
 *       409:
 *         description: Request already exists
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /remove_publisher_users/{uid}:
 *   post:
 *     summary: Remove an assigned relationship between a Writer and Publisher
 *     tags: [Publisher]
 *     parameters:
 *       - in: path
 *         name: uid
 *         schema:
 *           type: string
 *         required: true
 *         description: Target user ID (Publisher or Writer)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 example: Writer
 *     responses:
 *       200:
 *         description: Successfully removed
 *       400:
 *         description: Missing target UID or role in body
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * tags:
 *   - name: Voting
 *     description: Voting related APIs
 *   - name: Event
 *     description: Event management APIs
 *   - name: Content
 *     description: Content management APIs
 *   - name: User
 *     description: User profile and auth APIs
 */

/**
 * @swagger
 * /content_list_for_voting:
 *   get:
 *     summary: Get list of contents available for voting
 *     tags: [Voting]
 *     responses:
 *       200:
 *         description: Success
 */

/**
 * @swagger
 * /top_5_contents:
 *   get:
 *     summary: Get the top 5 contents by vote count
 *     tags: [Voting]
 *     responses:
 *       200:
 *         description: Success
 */

/**
 * @swagger
 * /vote_a_content:
 *   post:
 *     summary: Cast a vote for a content
 *     tags: [Voting]
 *     responses:
 *       200:
 *         description: Vote successful
 */

/**
 * @swagger
 * /vote_counts_derivatives:
 *   post:
 *     summary: Get voting counts and derivative statistics
 *     tags: [Voting]
 *     responses:
 *       200:
 *         description: Success
 */

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback handler
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Authenticated
 */

/**
 * @swagger
 * /auth/google/callback/mobile:
 *   get:
 *     summary: Google OAuth callback handler for mobile
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Authenticated
 */

/**
 * @swagger
 * /logout:
 *   get:
 *     summary: Logout user session
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Logged out
 */

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     responses:
 *       201:
 *         description: User registered
 */

/**
 * @swagger
 * /updateprofile:
 *   post:
 *     summary: Update user profile
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Profile updated
 */

/**
 * @swagger
 * /getuserprofile:
 *   get:
 *     summary: Fetch current user's profile
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Profile data
 */

/**
 * @swagger
 * /updateprofile_by_admin:
 *   post:
 *     summary: Administrator action to update a user's profile
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Profile updated by admin
 */

/**
 * @swagger
 * /event_lists:
 *   get:
 *     summary: Fetch all events
 *     tags: [Event]
 *     responses:
 *       200:
 *         description: List of events
 */

/**
 * @swagger
 * /event_lists_users:
 *   get:
 *     summary: Fetch list of events accessible to users
 *     tags: [Event]
 *     responses:
 *       200:
 *         description: List of standard events
 */

/**
 * @swagger
 * /create_events:
 *   post:
 *     summary: Create a new event
 *     tags: [Event]
 *     responses:
 *       201:
 *         description: Event created
 */

/**
 * @swagger
 * /update_events:
 *   put:
 *     summary: Modify an existing event
 *     tags: [Event]
 *     responses:
 *       200:
 *         description: Event updated
 */

/**
 * @swagger
 * /delete_events:
 *   delete:
 *     summary: Remove an event
 *     tags: [Event]
 *     responses:
 *       200:
 *         description: Event deleted
 */

/**
 * @swagger
 * /submit_contents:
 *   post:
 *     summary: Submit new content
 *     tags: [Content]
 *     responses:
 *       201:
 *         description: Content submitted
 */

/**
 * @swagger
 * /list_contents:
 *   post:
 *     summary: Retrieve list of existing contents based on filters
 *     tags: [Content]
 *     responses:
 *       200:
 *         description: Fetched successfully
 */

/**
 * @swagger
 * /list_notice:
 *   get:
 *     summary: Fetch available notices
 *     tags: [Content]
 *     responses:
 *       200:
 *         description: Success
 */

/**
 * @swagger
 * /certificate_fetch:
 *   get:
 *     summary: Fetch certificate for current user context
 *     tags: [Content]
 *     responses:
 *       200:
 *         description: Certificate details
 */

/**
 * @swagger
 * /add_marks_by_admins:
 *   post:
 *     summary: Admin tool to add marks grading on content
 *     tags: [Content]
 *     responses:
 *       200:
 *         description: Marks stored successfully
 */

/**
 * @swagger
 * /create_notice_by_admin_and_mail:
 *   post:
 *     summary: Generate a notice and trigger mailing job
 *     tags: [Content]
 *     responses:
 *       200:
 *         description: Complete
 */

/**
 * @swagger
 * /fetch_the_content:
 *   get:
 *     summary: Grab single specific content data payload
 *     tags: [Content]
 *     responses:
 *       200:
 *         description: Success
 */
