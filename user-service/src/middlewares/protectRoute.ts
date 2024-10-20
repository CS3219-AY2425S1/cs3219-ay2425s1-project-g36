import jwt, { JwtPayload } from "jsonwebtoken";
import { Response, Request, NextFunction } from "express";
import mongoose from "mongoose";

import User from "../models/userModel";
import { JWT_SECRET } from "../../utils/config";

// Define custom JwtPayload type
interface CustomJwtPayload extends JwtPayload {
    userId: mongoose.Types.ObjectId;
}

/**
 * Middleware that verifies that a user is logged in before proceeding.
 */
export const protectRoute = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const token = req.cookies.jwt;
		if (!token) {
			return res.status(401).json({ error: "Unauthorized: No Token Provided" });
		}

		const decoded = jwt.verify(token, JWT_SECRET) as CustomJwtPayload;
		if (!decoded) {
			return res.status(401).json({ error: "Unauthorized: Invalid Token" });
		}

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
 * Middleware that verifies that a user is logged in as an admin before proceeding.
 * 
 * Needs to be performed with `protectRoute` that checks if a user is logged in.
 */
export const adminProtectRoute = async (req: Request, res: Response, next: NextFunction) => {
    if (req.user.isAdmin) {
        next();
    } else {
        return res.status(403).json({ message: "Not authorized to access this resource" });
    }
};