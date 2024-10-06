import { Request, Response } from 'express'
import { Blacklist } from '../models/blacklistModel'

// Middleware for verifying token and checking blacklist
const CheckTokenAgainstBlacklist = async (req: Request, res: Response, next: Function) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const isBlacklisted = await Blacklist.findOne({ token });
    if (isBlacklisted) {
        return res.status(403).json({ message: 'Token is blacklisted, please log in again' });
    }

    next(); // Continue to the next middleware or route handler
};