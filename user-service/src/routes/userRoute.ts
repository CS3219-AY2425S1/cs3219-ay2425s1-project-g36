import { Router } from 'express';

import { 
    createUser, 
    getAllUsers, 
    getUser, 
    updateUser, 
    deleteUser, 
    updateUserPrivilege,
    getUserAttempts,
    updateUserQuestionAttempt
} from '../controllers/userController';
import { protectRoute, adminProtectRoute } from '../middlewares/protectRoute';

const router: Router = Router();

/**
 * @route POST /
 * @description Creates a new user
 * @access Public
 * 
 * Endpoint to create a new user with the provided username, email, and password. 
 * This route is not protected as it is intended for new users to register.
 */
router.post("/", createUser);

/**
 * @route GET /:id
 * @description Retrieves a specific user by ID
 * @access Protected (Normal User)
 * 
 * Requires the user to be authenticated. Returns user data for the given user ID.
 */
router.get("/:id", protectRoute, getUser);

/**
 * @route GET /
 * @description Retrieves all users
 * @access Protected (Normal User)
 * 
 * Requires the user to be authenticated. Returns a list of all users in the database.
 */
router.get("/", protectRoute, getAllUsers);

/**
 * @route PATCH /update
 * @description Updates the authenticated user's information
 * @access Protected (Normal User)
 * 
 * Requires the user to be authenticated. Allows the user to update their own profile information.
 */
router.patch("/update", protectRoute, updateUser);

/**
 * @route DELETE /:id
 * @description Deletes a specific user by ID
 * @access Protected (Normal User)
 * 
 * Requires the user to be authenticated. Deletes the user with the specified ID.
 */
router.delete("/:id", protectRoute, deleteUser);

/**
 * @route GET /history/:id
 * @description Retrieves the attempt history of a specific user by ID
 * @access Protected (Normal User)
 * 
 * Requires the user to be authenticated. Returns the attempt history of the user with the specified ID.
 */
router.get("/history/:id", protectRoute, getUserAttempts);

/**
 * @route PATCH /history/:id
 * @description Updates the attempt history of a specific user by ID
 * @access Protected (Normal User)
 * 
 * Requires the user to be authenticated. Allows the user to update their attempt history, 
 * such as adding information about a question they attempted.
 */
router.patch("/history/:id", protectRoute, updateUserQuestionAttempt);

/**
 * Admin-Protected Routes
 * 
 * This route is restricted to admin users only. The `adminProtectRoute` middleware 
 * is used in addition to `protectRoute` to ensure the user is both authenticated and has admin privileges.
 */

/**
 * @route PATCH /:id/privilege
 * @description Updates the privilege level of a specific user by ID
 * @access Protected (Admin Only)
 * 
 * Allows admin users to update the privilege level of a specific user.
 * 
 * Body:
 * - `isAdmin` (boolean): Specifies whether the user should be granted admin privileges.
 */
router.patch("/:id/privilege", protectRoute, adminProtectRoute, updateUserPrivilege);

export default router;
