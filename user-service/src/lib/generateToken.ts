import jwt from "jsonwebtoken";
import { Response } from "express";
import mongoose from "mongoose";

import { JWT_SECRET } from "../../utils/config";
import User from "../models/userModel";

const generateTokenAndSetCookie = (userId: mongoose.Types.ObjectId, res: Response) => {
	// ensure the token expiry and maxAge fields are aligned. currently, expiry is 1 day.
	const token = jwt.sign(
		{ userId },
		JWT_SECRET,
		{ expiresIn: "1d" },
	);

	res.cookie("jwt", token, {
		maxAge: 1 * 24 * 60 * 60 * 1000, //MS
		httpOnly: true, // prevent XSS attacks cross-site scripting attacks
		sameSite: "strict", // CSRF attacks cross-site request forgery attacks
		secure: process.env.NODE_ENV !== "development",
	});
};

export default generateTokenAndSetCookie;