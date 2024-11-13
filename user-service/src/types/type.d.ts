import User from '../models/userModel';

/**
 * Extends the Express Request interface to include a custom `user` property.
 * This property will hold a `User` object, which can be set in middleware (e.g., authentication).
 * 
 * By using this declaration, TypeScript will recognize `req.user` as a `User` object
 * whenever it's used in request handling.
 */
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}