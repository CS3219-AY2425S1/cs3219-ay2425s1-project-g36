import { Router } from 'express';

import { createUser, getAllUsers, getUser, updateUser, deleteUser, updateUserPrivilege } from '../controllers/userController';
import { protectRoute, adminProtectRoute } from '../middlewares/protectRoute';

const router: Router = Router();

/**
 * Non-protected routes
 */
router.post("/", createUser);

/**
 * Normal protected routes
 */
router.get("/:id", protectRoute, getUser);

router.get("/", protectRoute, getAllUsers);

router.patch("/update", protectRoute, updateUser);

router.delete("/:id", protectRoute, deleteUser);

/**
 * Admin-protected routes
 */

// POST {URL}/:id/privilege
// Allows admins to update the privilege of a user by its ID.
//
// Body:
// isAdmin: true/false.
router.patch("/:id/privilege", protectRoute, adminProtectRoute, updateUserPrivilege);

export default router;
