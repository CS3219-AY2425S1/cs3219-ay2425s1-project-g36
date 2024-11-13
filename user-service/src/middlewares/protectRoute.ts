// External libraries
import { Response, Request, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";

// Internal project modules
import { JWT_SECRET } from "../../config";
import User from "../models/userModel";

// Define custom JwtPayload type
interface CustomJwtPayload extends JwtPayload {
    userId: mongoose.Types.ObjectId;
}

/**
 * Middleware that verifies that a user is logged in by checking the JWT token in cookies.
 * 
 * Endpoint: Middleware - runs before protected routes
 * Access: Protected - requires a valid token in cookies
 * 
 * @param {Request} req - The incoming HTTP request object, expecting:
 *   - `jwt` (string in cookies): The JWT token used to authenticate the user.
 * @param {Response} res - The HTTP response object used to send status and message if authentication fails.
 * @param {NextFunction} next - The next middleware or route handler to execute if the token is valid and user exists.
 * 
 * @returns {Promise<Response | void>} - Returns a JSON response:
 *   - 401: If no token is provided in cookies or if the token is invalid.
 *   - 404: If the user associated with the token is not found in the database.
 *   - Calls `next()` if the token is valid and the user exists, allowing the request to proceed.
 */
export const protectRoute = async (req: Request, res: Response, next: NextFunction) => {
	try {
		// Retrieve the JWT token from cookies
		const token = req.cookies.jwt;
		if (!token) {
			return res.status(401).json({ error: "Unauthorized: No Token Provided" });
		}

		// Verify the token against the JWT secret
		const decoded = jwt.verify(token, JWT_SECRET) as CustomJwtPayload;
		if (!decoded) {
			return res.status(401).json({ error: "Unauthorized: Invalid Token" });
		}

		// Find the user in the database based on decoded user ID
		const user = await User.findById(decoded.userId).select("-password");
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		req.user = user;
		next();
	} catch (error) {
		console.log("Error in protectRoute middleware", error);
		return res.status(500).json({ message: "Internal server error!" });
	}
};

/**
 * Middleware that verifies if the authenticated user has admin privileges before allowing access to the route.
 * 
 * Endpoint: Middleware - runs before admin-protected routes
 * Access: Protected - requires authenticated user with admin privileges
 * 
 * @param {Request} req - The incoming HTTP request object, expecting:
 *   - `user` (object): The authenticated user object added to `req` by the `protectRoute` middleware, 
 *      with an `isAdmin` boolean property.
 * @param {Response} res - The HTTP response object used to send status and message if authorization fails.
 * @param {NextFunction} next - The next middleware or route handler function to execute if the user is an admin.
 * 
 * @returns {Promise<Response | void>} - Returns a JSON response:
 *   - 403: If the user does not have admin privileges.
 *   - Calls `next()` if the user has admin privileges, allowing the request to proceed.
 */
export const adminProtectRoute = async (req: Request, res: Response, next: NextFunction) => {
    if (req.user.isAdmin) {
        next();
    } else {
        return res.status(403).json({ message: "Not authorized to access this resource" });
    }
};