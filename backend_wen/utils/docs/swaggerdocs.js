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


