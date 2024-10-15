import mongoose, { isValidObjectId } from "mongoose";

import bcrypt from "bcrypt";
import { Request, Response } from "express";

import User from '../models/userModel';
import generateTokenAndSetCookie from '../lib/generateToken';

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

export async function getUser(req: Request, res: Response) {
  try {
    const userId = req.params.id;
    if (!isValidObjectId(userId)) {
      return res.status(404).json({ message: `User ${userId} not found` });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: `User ${userId} not found` });
    } else {
      return res.status(200).json({ message: `Found user`, data: user });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unknown error when getting user!" });
  }
}

export async function getAllUsers(req: Request, res: Response) {
  try {
    const users = await User.find();

    return res.status(200).json({ message: `Found users`, data: users.map(user => user) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unknown error when getting all users!" });
  }
}

export const updateUser = async (req: Request, res: Response) => {
	const { username, email, currentPassword, newPassword } = req.body;
	const userId = req.user._id;

	try {
		let user = await User.findById(userId);
		if (!user) {
      return res.status(404).json({ message: "User not found" });
    } 

		if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
			return res.status(400).json({ error: "Please provide both current password and new password" });
		}

		if (currentPassword && newPassword) {
			const isMatch = await bcrypt.compare(currentPassword, user.password);
			if (!isMatch) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }
			if (newPassword.length < 10) {
				return res.status(400).json({ error: "Password must be at least 10 characters long" });
			}

			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(newPassword, salt);
		}

		user.email = email || user.email;
		user.username = username || user.username;

		user = await user.save();

		// password should be null in response
		user.password = "";

		return res.status(200).json(user);
	} catch (error) {
		console.log(error);
		res.status(500).json({ error });
	}
};

export async function deleteUser(req: Request, res: Response) {
  try {
    const userId = req.params.id;
    if (!isValidObjectId(userId)) {
      return res.status(404).json({ message: `User ${userId} not found` });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: `User ${userId} not found` });
    }

    await User.findByIdAndDelete(userId);
    return res.status(200).json({ message: `Deleted user ${userId} successfully` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unknown error when deleting user!" });
  }
}