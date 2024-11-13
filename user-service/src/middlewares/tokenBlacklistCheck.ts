import { Request, Response } from 'express'

import { Blacklist } from '../models/blacklistModel'

/**
 * Verifies the JWT token in the request header and checks if it is blacklisted.
 * 
 * Endpoint: Middleware - runs before protected routes
 * Access: Protected - requires a valid token
 * 
 * @param {Request} req - The incoming HTTP request object with:
 *   - `authorization` (string in headers): The JWT token provided as a Bearer token.
 * @param {Response} res - The HTTP response object used to send status and message if token is invalid or blacklisted.
 * @param {Function} next - The next middleware or route handler function to execute if the token is valid and not blacklisted.
 * 
 * @returns {Promise<Response | void>} - Returns a JSON response:
 *   - 401: If no token is provided in the Authorization header.
 *   - 403: If the token is found in the blacklist, indicating it is invalid for use.
 *   - Calls `next()` if the token is valid and not blacklisted, allowing the request to proceed to the next handler.
 */
const CheckTokenAgainstBlacklist = async (req: Request, res: Response, next: Function) => {
    // Extract token from the Authorization header, expecting a Bearer token format
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    // Check if the token exists in the blacklist collection
    const isBlacklisted = await Blacklist.findOne({ token });
    if (isBlacklisted) {
        return res.status(403).json({ message: 'Token is blacklisted, please log in again' });
    }

    next(); // Continue to the next middleware or route handler
};