// External libraries
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import mongoose, { isValidObjectId } from "mongoose";

// Internal project modules
import AttemptHistory from "../models/attemptHistoryModel";
import generateTokenAndSetCookie from '../lib/generateToken';
import User from '../models/userModel';

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
    // Extract userId from request parameters
    const userId = req.params.id;

    // Validate userId format to ensure it's a valid MongoDB ObjectId
    if (!isValidObjectId(userId)) {
      return res.status(404).json({ message: `User ${userId} not found` });
    }

    // Attempt to find the user in the database by ID
    const user = await User.findById(userId);

    // Check if the user exists
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

/**
 * Retrieves all users in the database.
 * 
 * Endpoint: GET /users
 * 
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * 
 * @returns {Promise<Response>} - Returns a JSON response with an array of all user data, 
 * or an error message if a server error occurs.
 * 
 * Expected HTTP Status Codes:
 * - 200: Users found and data returned.
 * - 500: Unknown server error.
 */
export async function getAllUsers(req: Request, res: Response) {
  try {
    // Fetch all user documents from the database
    const users = await User.find();

    return res.status(200).json({ message: `Found users`, data: users.map(user => user) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unknown error when getting all users!", data: [] });
  }
}

/**
 * Updates the user's profile information, including username, email, and password.
 * 
 * Endpoint: PATCH /users/update
 * 
 * @param {Request} req - The request object containing:
 *   - `username` (optional): New username to update.
 *   - `email` (optional): New email address to update.
 *   - `currentPassword` (optional): The user's current password, required for password changes.
 *   - `newPassword` (optional): The new password to set, if changing password.
 * @param {Response} res - The response object.
 * 
 * @returns {Promise<Response>} - Returns a JSON response with updated user data if successful,
 * or an error message if the update fails due to validation issues or server error.
 * 
 * Workflow:
 * 1. Retrieves the user by `userId` from the authenticated request.
 * 2. Validates required fields when changing passwords (both `currentPassword` and `newPassword` must be provided).
 * 3. Validates the email format.
 * 4. Checks for uniqueness of `username` and `email` in the database.
 * 5. If changing password, verifies `currentPassword` and applies security checks on `newPassword`.
 * 6. Updates the user’s `username`, `email`, and/or `password` as necessary.
 * 7. Saves the updated user data and returns it in the response, with password field set to an empty string.
 * 
 * Expected HTTP Status Codes:
 * - 200: User updated successfully.
 * - 400: Validation error, such as missing fields or non-unique username/email.
 * - 404: User not found.
 * - 500: Server error.
 */
export const updateUser = async (req: Request, res: Response) => {
  const { username, email, currentPassword, newPassword } = req.body;
  const userId = req.user._id;

  try {
    // Retrieve user from database
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    } 

    // Validate that both currentPassword and newPassword are provided if attempting a password change
    if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
      return res.status(400).json({ message: "Please provide both current password and new password" });
    }

    // Email format validation
    // Valid: user@example.com, invalid: user@ example.com
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check if the new username is already in use by another user
    const existingUser = await User.findOne({ username });
    if (existingUser && existingUser.username !== user.username) {
      return res.status(400).json({ message: "Username is already taken" });
    }

    // Check if the new email is already in use by another user
    const existingEmail = await User.findOne({ email });
    if (existingEmail && existingEmail.email !== user.email) {
      return res.status(400).json({ message: "Email is already taken" });
    }

    // If updating password, verify the current password and validate the new password
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      if (newPassword.length < 10) {
        return res.status(400).json({ message: "Password must be at least 10 characters long" });
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    user.email = email || user.email;
    user.username = username || user.username;

    // Save updated user
    user = await user.save();

    // Remove password from the response for security
    user.password = "";

    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Unknown error when updating user" });
  }
};

/**
 * Deletes a user by their ID.
 * 
 * Endpoint: DELETE /users/:id
 * 
 * @param {Request} req - The request object containing `id` as a URL parameter.
 * @param {Response} res - The response object.
 * 
 * @returns {Promise<Response>} - Returns a JSON response confirming deletion if successful,
 * or an error message if the user is not found or if other errors occur.
 * 
 * Workflow:
 * 1. Validates that `userId` is a valid MongoDB ObjectId.
 * 2. Searches for the user by `userId` in the database.
 *    - If the user is found, deletes them and returns a success message.
 *    - If the user is not found, returns a 404 error.
 * 3. Catches and logs any unexpected errors, responding with a 500 status code.
 * 
 * Expected HTTP Status Codes:
 * - 200: User deleted successfully.
 * - 404: User not found or invalid user ID.
 * - 500: Server error.
 */
export async function deleteUser(req: Request, res: Response) {
  try {
    const userId = req.params.id;

    // Validate userId format to ensure it's a valid MongoDB ObjectId
    if (!isValidObjectId(userId)) {
      return res.status(404).json({ message: `User ID ${userId} invalid` });
    }

    // Retrieve user using user ID from database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: `User ${userId} not found` });
    }

    // Delete the user if found
    await User.findByIdAndDelete(userId);
    return res.status(200).json({ message: `Deleted user ${userId} successfully` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Unknown error when deleting user!" });
  }
}

/**
 * Updates a specific user's privilege level (admin status).
 * 
 * Endpoint: PATCH /users/:id/privilege
 * 
 * @param {Request} req - The request object containing:
 *   - `id` (URL parameter): The ID of the user whose privilege is being updated.
 *   - `isAdmin` (boolean in body): The new privilege status (true for admin, false for non-admin).
 * @param {Response} res - The response object.
 * 
 * @returns {Promise<Response>} - Returns a JSON response with a message confirming the privilege update 
 * if successful, or an error message if validation or server errors occur.
 * 
 * Workflow:
 * 1. Checks if `isAdmin` is provided in the request body.
 * 2. Validates the format of `userId` and verifies the user exists.
 * 3. Updates the `isAdmin` status of the user.
 * 4. Returns a success message confirming the updated status.
 * 
 * Expected HTTP Status Codes:
 * - 200: User privilege updated successfully.
 * - 400: `isAdmin` field missing in the request body.
 * - 404: User not found (either due to invalid ID format or nonexistent user).
 * - 500: Unknown server error.
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

/**
 * Retrieves a user's attempt history.
 * 
 * Endpoint: GET /users/:id/history
 * 
 * @param {Request} req - The request object containing:
 *   - `id` (URL parameter): The ID of the user whose attempt history is being retrieved.
 * @param {Response} res - The response object.
 * 
 * @returns {Promise<Response>} - Returns a JSON response with the user's attempt history if found,
 * or an error message if the user is not found or if other errors occur.
 * 
 * Workflow:
 * 1. Validates the format of `userId`.
 * 2. Verifies if the user exists in the database.
 * 3. Retrieves and returns the user's attempt history if found.
 * 
 * Expected HTTP Status Codes:
 * - 200: Attempt history retrieved successfully.
 * - 404: User not found (either due to invalid ID format or nonexistent user).
 * - 500: Unknown server error.
 */
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

/**
 * Updates the user's question attempt history by adding a new attempt.
 * 
 * Endpoint: PATCH /users/history
 * 
 * @param {Request} req - The request object containing:
 *   - `questionId` (number in body): The ID of the question being attempted.
 *   - `questionTitle` (string in body): The title of the question being attempted.
 *   - `rawCode` (string in body): The user's submitted code for the question.
 *   - `language` (string in body): The programming language used.
 * @param {Response} res - The response object.
 * 
 * @returns {Promise<Response>} - Returns a JSON response with the updated attempt history
 * if successful, or an error message if the user is not found or if other errors occur.
 * 
 * Workflow:
 * 1. Retrieves the authenticated user by `userId`.
 * 2. Validates the user’s existence in the database.
 * 3. Creates a new attempt entry and appends it to the user's attempt history.
 * 4. Saves the updated user data and returns the updated attempt history.
 * 
 * Expected HTTP Status Codes:
 * - 200: Attempt history updated successfully.
 * - 404: User not found.
 * - 500: Unknown server error.
 */
export async function updateUserQuestionAttempt(req: Request, res: Response) {
  try {
    const { questionId, questionTitle, rawCode, language } = req.body;
    const userId = req.user._id;

    // Retrieve user from database
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a new attempt object
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
    console.error(error);
    return res.status(500).json({ message: "Unknown error when updating user's attempt history!" });
  }
}
