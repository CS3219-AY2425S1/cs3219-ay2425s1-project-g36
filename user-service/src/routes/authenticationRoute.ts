import { Router } from 'express';

import { login, forgotPassword, resetPassword, logout, getUserFromToken } from '../controllers/authController';

const router: Router = Router();

// Login route
router.post('/login', login);

// Request password reset route
router.post('/forgot-password', forgotPassword);

// Get user details from reset password token
router.get('/reset-password/:token', getUserFromToken);

// Reset password route
router.post('/reset-password/:token', resetPassword);

// Logout route
router.post('/logout', logout);

export default router
