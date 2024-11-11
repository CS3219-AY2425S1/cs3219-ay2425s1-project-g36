import mongoose, { isValidObjectId } from "mongoose";

import bcrypt from "bcrypt";
import { Request, Response } from "express";

import User from '../models/userModel';
import generateTokenAndSetCookie from '../lib/generateToken';
import AttemptHistory from "../models/attemptHistoryModel";

/**
 * Creates a new user account.
 * 
 * Endpoint: POST /users
 * 
 * @param {Request} req - The request object containing `username`, `email`, and `password` in the body.
 * @param {Response} res - The response object.
 * 
 * @returns {Promise<Response>} - Returns a JSON response with user data if creation is successful, 
 * or an error message if there are validation errors or other issues.
 * 
 * Workflow:
 * 1. Validates email format.
 * 2. Checks if the username or email is already taken.
 * 3. Validates password requirements.
 * 4. Hashes the password and creates a new user.
 * 5. Generates a token, attaches it to the cookie, and saves the user.
 * 
 * Expected HTTP Status Codes:
 * - 201: User created successfully.
 * - 400: Validation errors (e.g., invalid email format, username/email already taken, weak password).
 * - 500: Unknown server error.
 */
export async function createUser(req: Request, res: Response) {
  try {
    const { username, email, password } = req.body;

    // Email format validation 
    // Valid: user@example.com, invalid: user@ example.com
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Username uniqueness check
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username is already taken" });
    }

    // Email uniqueness check
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email is already taken" });
    }

    // Password strength validation
    const isPasswordValid = () => {
      const re = /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])[a-zA-Z0-9- ?!@#$%^&*\/\\]{8,}$/;
      return re.test(password);
    }

    if (!isPasswordValid()) {
      return res.status(400).json({ message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter and one digit. Special characters must be these: - ?!@#$%^&*\/\\" });
    }

    // Hash the password and create the user
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });
  
    if (newUser) {
      // Generate token and set it in the cookie
      generateTokenAndSetCookie(newUser._id as mongoose.Types.ObjectId, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when creating new user!" });
  }
}

/**
 * Retrieves a user by their ID.
 * 
 * Endpoint: GET /users/:id
 * 
 * @param {Request} req - The request object containing `id` as a URL parameter.
 * @param {Response} res - The response object.
 * 
 * @returns {Promise<Response>} - Returns a JSON response with the user data if found, 
 * or an error message if the user is not found or other errors occur.
 * 
 * Workflow:
 * 1. Validates the format of `userId`.
 * 2. Searches for the user by ID in the database.
 * 3. Returns the user data if found.
 * 
 * Expected HTTP Status Codes:
 * - 200: User found and data returned.
 * - 404: User not found (either due to invalid ID format or nonexistent user).
 * - 500: Unknown server error.
 */
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
    return res.status(500).json({ message: "Unknown error when getting all users!", data: [] });
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
      return res.status(400).json({ message: "Please provide both current password and new password" });
    }

    // sanity check
    // Valid: user@example.com, invalid: user@ example.com
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser && existingUser.username !== user.username) {
      return res.status(400).json({ message: "Username is already taken" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail && existingEmail.email !== user.email) {
      return res.status(400).json({ message: "Email is already taken" });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      if (newPassword.length < 10) {
        return res.status(400).json({ message: "Password must be at least 10 characters long" });
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
      return res.status(404).json({ message: `User ID ${userId} invalid` });
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

/**
 * Updates a specific user's privilege.
 */ 
export async function updateUserPrivilege(req : Request, res : Response) {
  try {
    const { isAdmin } = req.body;

    if (isAdmin !== undefined) {  // isAdmin can have boolean value true or false
      const userId = req.params.id;
      if (!isValidObjectId(userId)) {
        return res.status(404).json({ message: `User ${userId} not found` });
      }
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: `User ${userId} not found` });
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId, 
        {
          $set: {
            isAdmin: isAdmin
          }
        },
        { new: true }, // return the updated user
      );

      // @ts-ignore
      const resultString = updatedUser.isAdmin ? "now an admin" : "no longer an admin";

      return res.status(200).json({ message: `Updated privilege for user ${userId}. ${userId} is ${resultString}.` } );
    } else {
      return res.status(400).json({ message: "isAdmin is missing!" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unknown error when updating user privilege!" });
  }
}

export async function getUserAttempts(req: Request, res: Response) {
  try {
    const userId = req.params.id;

    // Validate if the userId is a valid MongoDB ObjectId
    if (!isValidObjectId(userId)) {
      return res.status(404).json({ message: `User ${userId} not found hu` });
    }

    // Find the user by ID
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: `User ${userId} not found huhu` });
    }

    // Retrieve the attemptHistory and send it in the response
    const attemptHistory = user.attemptHistory;
    return res.status(200).json({
      message: "Found user's attempt history",
      data: attemptHistory,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unknown error when getting user!" });
  }
}

export async function updateUserQuestionAttempt(req: Request, res: Response) {
  try {
    const { questionId, questionTitle, rawCode, language } = req.body;
    const userId = req.user._id;
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const attempt = new AttemptHistory({
      questionId: parseInt(questionId), 
      questionTitle,
      language,
      code: rawCode,
    });

    // Append the attempt to the user's history
    user.attemptHistory.push(attempt);

    await user.save();
    return res.status(200).json({ message: "Attempt history updated successfully", attemptHistory: user.attemptHistory });
  } catch (error) {
    console.log("error")
    console.error("Error updating user attempt history:", error);
    res.status(500).json({ message: "Server error", error });
  }
}
