import { Router, Request, Response } from 'express'
import { User } from '../models/userModel'
import { Blacklist } from '../models/blacklistModel'
import bcrypt from 'bcrypt'
import jwt, { JwtPayload } from 'jsonwebtoken'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import { EMAIL, PASSWORD } from '../../utils/config'

const router: Router = Router()
const secretKey = "undecided" // to be replaced with a more secure key in .env file
const MAX_FAILED_ATTEMPTS = 5; 
const CAPTCHA_REQUIRED_ATTEMPTS = 3; 

// Login route
router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: 'User not found' })

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

    //Reset failed attempts once login is successful
    user.numberOfFailedLoginAttempts = 0;
    await user.save();

    // Timeout set to 1 hour for now
    const token = jwt.sign({ id: user._id, email: user.email }, secretKey, { expiresIn: '1h' })
    res.json({ token, message: 'Login successful' });
});


// Request password reset route
router.post('/forgot-password', async (req: Request, res: Response) => {
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
    const resetURL = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
    const transporter = nodemailer.createTransport({ 
        service: 'gmail',
        auth: {
            user: EMAIL,
            pass: PASSWORD
        }
    });

    const mailOptions = {
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
});


// Reset password route
router.post('/reset-password/:token', async (req: Request, res: Response) => {
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
});


// Logout route
router.post('/logout', async (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(' ')[1]; // Assuming the token is passed in the Authorization header

    if (!token) {
        return res.status(400).json({ message: 'No token provided' });
    }

    // Decode the token to get the expiration
    var expiresAt = null
    try {
        const decodedToken = jwt.verify(token, secretKey)
        // Type guard to check if decodedToken is JwtPayload
        if (typeof decodedToken === 'object' && 'exp' in decodedToken) {
            const expiresAt = new Date((decodedToken as JwtPayload).exp! * 1000);
            console.log('Token expires at:', expiresAt);
        } else {
            return res.status(400).json({ message: 'Invalid token format' });
        }
    } catch (error) {
        return res.status(400).json({ message: 'Invalid token' })
    }

    // Add the token to the blacklist
    await Blacklist.create({ token, expiresAt })

    //TODO: clean up session data

    res.json({ message: 'Logout successful' });
});


export default router
