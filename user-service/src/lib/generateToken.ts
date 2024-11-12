// External libraries
import { Response } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Internal project modules
import { JWT_SECRET } from "../../utils/config";

/**
 * Generates a JWT token for the specified user ID and sets it as a cookie on the response.
 * 
 * This function creates a JWT token containing the user's ID, sets it to expire in 1 day,
 * and attaches it as a secure, HTTP-only cookie on the response. This ensures that the token
 * is protected against XSS and CSRF attacks.
 * 
 * @param {mongoose.Types.ObjectId} userId - The unique identifier of the user for whom the token is generated.
 * @param {Response} res - The HTTP response object to which the cookie containing the token is attached.
 * 
 * @returns {void} - The function does not return a value, but attaches the token as a cookie to the response.
 */
const generateTokenAndSetCookie = (userId: mongoose.Types.ObjectId, res: Response) => {
	// Generate a token with a 1-day expiry, embedding the user's ID as the payload
	const token = jwt.sign(
		{ userId },
		JWT_SECRET,
		{ expiresIn: "1d" },
	);

	// Set the token as a cookie with security settings
	res.cookie("jwt", token, {
		maxAge: 1 * 24 * 60 * 60 * 1000, //MS
		httpOnly: true, // prevent XSS attacks cross-site scripting attacks
		sameSite: "strict", // CSRF attacks cross-site request forgery attacks
		secure: process.env.NODE_ENV !== "development",
	});
};

export default generateTokenAndSetCookie;