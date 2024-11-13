// External libraries
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import nodemailer from 'nodemailer';

// Internal project modules
import { Blacklist } from '../models/blacklistModel';
import generateTokenAndSetCookie from '../lib/generateToken';
import User from '../models/userModel';
import { EMAIL, PASSWORD, JWT_SECRET } from '../../config';

const MAX_FAILED_ATTEMPTS = 5; 
const CAPTCHA_REQUIRED_ATTEMPTS = 3; 

/**
 * Authenticates the user with email and password.
 * 
 * Endpoint: POST /login
 * Access: Public
 * 
 * @param {Request} req - The request object containing:
 *   - `email` (string in body): The user's email address.
 *   - `password` (string in body): The user's password.
 * @param {Response} res - The response object.
 * 
 * @returns {Promise<Response>} - Returns a JSON response:
 *   - 200: On successful login, resets failed login attempts, sets the JWT token cookie, and returns user data.
 *   - 400: If the email or password is incorrect or the user is not found.
 *   - 500: For unknown server errors.
 */
export async function login(req: Request, res: Response) {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: 'User not found' })

    /*   
    // To be implemented in future milestones
    // Check if account is blocked due to too many failed attempts
    if (user.numberOfFailedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        return res.status(403).json({ message: 'Account locked due to too many failed attempts' });
    }

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        user.numberOfFailedLoginAttempts += 1;
        await user.save();

        if (user.numberOfFailedLoginAttempts >= CAPTCHA_REQUIRED_ATTEMPTS) {
            //TODO: Implement captcha
            return res.status(403).json({ message: 'Captcha Required' });
        }
        return res.status(400).json({ message: 'Invalid Credentials' })
    }
    */

    // Compare provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid Credentials' })
    }

    // Reset failed attempts once login is successful
    user.numberOfFailedLoginAttempts = 0;
    await user.save();

    // Generate a JWT token and set it in a cookie
    generateTokenAndSetCookie(user.id, res);
    return res.status(200).json({ message: 'Login successful', id: user.id, username: user.username, email: user.email, isAdmin: user.isAdmin });
}

/**
 * Sends a password reset link to the user's email.
 * 
 * Endpoint: POST /forgot-password
 * Access: Public
 * 
 * @param {Request} req - The request object containing:
 *   - `email` (string in body): The user's email address.
 * @param {Response} res - The response object.
 * 
 * @returns {Promise<Response>} - Returns a JSON response:
 *   - 200: Sends the reset link to the user's email.
 *   - 404: If the email is not found.
 *   - 500: For errors during email sending or server issues.
 */
export async function forgotPassword(req: Request, res: Response) {
    const { email } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: 'User with this email does not exist' });
    }

    // Generate a password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash the reset token and set an expiration time (15 minutes)
    const resetTokenHashed = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetToken = resetTokenHashed;
    user.passwordResetTokenExpiration = new Date(Date.now() + 900000); // Token valid for 15 mins (in miliseconds)
    await user.save();

    // Prepare the reset URL to be sent in the email
    const resetURL = `${req.get('Referer')}reset-password/${resetToken}`;
    // Configure email settings and send the email
    const transporter = nodemailer.createTransport({ 
        service: 'gmail',
        auth: {
            user: EMAIL,
            pass: PASSWORD
        }
    });

    const mailOptions = {
        from: `"PeerPrep" ${EMAIL}`,
        to: user.email,
        subject: 'Password Reset',
        text: `Please use the following link to reset your password: ${resetURL}`
    };

    try {
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: 'Password reset link sent to email!' });
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpiration = undefined;
        await user.save();
        return res.status(500).json({ message: 'Error sending email' });
    }
}

/**
 * Verifies the password reset token and retrieves the user's email and username.
 * 
 * Endpoint: GET /reset-password/:token
 * Access: Public
 * 
 * @param {Request} req - The request object containing:
 *   - `token` (string in URL): The reset token from the URL.
 * @param {Response} res - The response object.
 * 
 * @returns {Promise<Response>} - Returns a JSON response:
 *   - 200: If token is valid, returns user data.
 *   - 400: If token is invalid or expired.
 */
export async function getUserFromToken(req: Request, res: Response) {
    const { token } = req.params;
    
    // Hash the token and look for a matching user with a valid token
    const hashedResetToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ 
        passwordResetToken: hashedResetToken, 
        passwordResetTokenExpiration: { $gt: Date.now() } 
    });

    if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token', username: null, email: null });
    } else {
        return res.status(200).json({ username: user.username, email: user.email });
    }
}

/**
 * Resets the user's password.
 * 
 * Endpoint: POST /reset-password/:token
 * Access: Public
 * 
 * @param {Request} req - The request object containing:
 *   - `token` (string in URL): The reset token.
 *   - `password` (string in body): The new password to set.
 * @param {Response} res - The response object.
 * 
 * @returns {Promise<Response>} - Returns a JSON response:
 *   - 200: On successful password reset.
 *   - 400: If token is invalid or expired.
 */
export async function resetPassword(req: Request, res: Response) {
    const { token } = req.params;
    const { password } = req.body;

    // Hash the token and look for a matching user with a valid token
    const hashedResetToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ 
        passwordResetToken: hashedResetToken, 
        passwordResetTokenExpiration: { $gt: Date.now() } 
    });

    if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Set the new password, hash it, and remove the reset token fields
    user.password = await bcrypt.hash(password, 10);
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiration = undefined;
    await user.save();

    return res.status(200).json({ message: 'Password reset successful' });
}

/**
 * Logs out the user by blacklisting the JWT and clearing the cookie.
 * 
 * Endpoint: POST /logout
 * 
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * 
 * @returns {Promise<Response>} - Returns a JSON response:
 *   - 200: On successful logout.
 *   - 400: If no token is provided or if it’s already blacklisted.
 */
export async function logout(req: Request, res: Response) {
    // Retrieve the JWT token from the cookies
    const token = req.cookies.jwt; 
    if (!token) {
        return res.status(400).json({ message: 'No token provided' });
    }

    // Decode and validate the token
    let expiresAt = null
    try {
        const decodedToken = jwt.verify(token, JWT_SECRET)
        // Type guard to check if decodedToken is JwtPayload
        if (typeof decodedToken === 'object' && 'exp' in decodedToken) {
            expiresAt = new Date((decodedToken as JwtPayload).exp! * 1000);
            console.log('Token expires at:', expiresAt);
        } else {
            return res.status(400).json({ message: 'Invalid token format' });
        }
    } catch (error) {
        console.log(error)
        return res.status(400).json({ message: 'Invalid token' })
    }

    // Check if the token is already blacklisted
    const existingToken = await Blacklist.findOne({ token });
    if (existingToken) {
        return res.status(400).json({ message: 'Token already blacklisted' });
    }

    // Add the token to the blacklist
    await Blacklist.create({ token, expiresAt })

    // Clear the JWT cookie to complete logout
    res.cookie('jwt', '', { 
        httpOnly: true, 
		secure: process.env.NODE_ENV !== "development", 
        sameSite: 'strict', 
        maxAge: 0 // Expire the cookie immediately
    });

    //TODO: clean up session data
    return res.status(200).json({ message: 'Logout successful' });
}