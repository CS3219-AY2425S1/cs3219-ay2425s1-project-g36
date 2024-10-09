import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from '../models/userModel';
import generateTokenAndSetCookie from '../lib/generateToken';
import mongoose from "mongoose";

export async function createUser(req: Request, res: Response) {
  try {
    const { username, email, password } = req.body;

    // sanity check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({ error: "Invalid email format" });
		}

    const existingUser = await User.findOne({ username });
		if (existingUser) {
			return res.status(400).json({ error: "Username is already taken" });
		}

		const existingEmail = await User.findOne({ email });
		if (existingEmail) {
			return res.status(400).json({ error: "Email is already taken" });
		}

		if (password.length < 10) {
			return res.status(400).json({ error: "Password must be at least 10 characters long" });
		}

    // create new user
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });
  
    if (newUser) {
      generateTokenAndSetCookie(newUser._id as mongoose.Types.ObjectId, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when creating new user!" });
  }
}
