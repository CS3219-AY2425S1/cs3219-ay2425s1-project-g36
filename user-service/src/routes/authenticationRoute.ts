import { Router } from 'express';

import { login, forgotPassword, resetPassword, logout, getUserFromToken } from '../controllers/authController';

const router: Router = Router();

/**
 * @route POST /login
 * @description Authenticates the user and logs them in by setting a JWT token.
 * @access Public
 * 
 * Endpoint to authenticate the user by validating the email and password. If successful,
 * a JWT token is generated and set for future authenticated requests.
 */
router.post('/login', login);

/**
 * @route POST /forgot-password
 * @description Initiates a password reset by generating a reset token and sending it to the user's email.
 * @access Public
 * 
 * Endpoint to start the password reset process. If the email is valid and associated with an account, 
 * a reset token is generated, stored in the database, and sent to the user's email.
 */
router.post('/forgot-password', forgotPassword);

/**
 * @route GET /reset-password/:token
 * @description Retrieves user details associated with a valid password reset token.
 * @access Public
 * 
 * Endpoint to validate the provided password reset token and, if valid, returns the user's details 
 * (e.g., email and username) for further verification in the password reset process.
 */
router.get('/reset-password/:token', getUserFromToken);

/**
 * @route POST /reset-password/:token
 * @description Resets the user's password using a valid reset token.
 * @access Public
 * 
 * Endpoint to reset the user's password. The token is validated, and if valid, the user's password 
 * is updated. The reset token is cleared after the password reset is successful.
 */
router.post('/reset-password/:token', resetPassword);

/**
 * @route POST /logout
 * @description Logs out the user by blacklisting the JWT token and clearing the token from cookies.
 * @access Protected - requires user authentication
 * 
 * Endpoint to log the user out. The JWT token is added to a blacklist to prevent further use, 
 * and it is also cleared from the user's cookies.
 */
router.post('/logout', logout);

export default router
