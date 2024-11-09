import crypto from 'crypto';

import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import nodemailer from 'nodemailer';

import User from '../models/userModel';
import { Blacklist } from '../models/blacklistModel';
import generateTokenAndSetCookie from '../lib/generateToken';
import { EMAIL, PASSWORD, JWT_SECRET } from '../../utils/config';

const MAX_FAILED_ATTEMPTS = 5; 
const CAPTCHA_REQUIRED_ATTEMPTS = 3; 

export async function login(req: Request, res: Response) {
    const { email, password } = req.body;
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

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid Credentials' })
    }

    //Reset failed attempts once login is successful
    user.numberOfFailedLoginAttempts = 0;
    await user.save();

    generateTokenAndSetCookie(user.id, res);
    res.json({ message: 'Login successful', id: user.id, username: user.username, email: user.email, isAdmin: user.isAdmin });
}

export async function forgotPassword(req: Request, res: Response) {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: 'User with this email does not exist' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash the reset token and set an expiration time 
    const resetTokenHashed = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetToken = resetTokenHashed;
    user.passwordResetTokenExpiration = new Date(Date.now() + 900000); // Token valid for 15 mins (in miliseconds)
    await user.save();

    // Send email 
    const resetURL = `${req.get('Referer')}reset-password/${resetToken}`;
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
        res.json({ message: 'Password reset link sent to email!' });
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpiration = undefined;
        await user.save();
        return res.status(500).json({ message: 'Error sending email' });
    }
}

export async function getUserFromToken(req: Request, res: Response) {
    const { token } = req.params;
    
    // Hash the token and find the user
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

export async function resetPassword(req: Request, res: Response) {
    const { token } = req.params;
    const { password } = req.body;

    // Hash the token and find the user
    const hashedResetToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ 
        passwordResetToken: hashedResetToken, 
        passwordResetTokenExpiration: { $gt: Date.now() } 
    });

    if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Set new password
    user.password = await bcrypt.hash(password, 10);
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiration = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
}

export async function logout(req: Request, res: Response) {
    // const token = req.headers.authorization?.split(' ')[1]; // Assuming the token is passed in the Authorization header
    const token = req.cookies.jwt; // Get token from the cookie
    if (!token) {
        return res.status(400).json({ message: 'No token provided' });
    }

    // Decode the token to get the expiration
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

    // Check if the token already exists in the blacklist
    const existingToken = await Blacklist.findOne({ token });
    if (existingToken) {
        return res.status(400).json({ message: 'Token already blacklisted' });
    }

    // Add the token to the blacklist
    await Blacklist.create({ token, expiresAt })

    // Remove JWT token cookie upon logout (as added measure)
    res.cookie('jwt', '', { 
        httpOnly: true, 
		secure: process.env.NODE_ENV !== "development", 
        sameSite: 'strict', 
        maxAge: 0 // Expire the cookie immediately
    });

    //TODO: clean up session data

    res.json({ message: 'Logout successful' });
}