import dotenv from 'dotenv';

dotenv.config({ path:'./.env' });

if (!process.env.USER_SERVICE_MONGODB_URI) {
    throw new Error('USER_SERVICE_MONGODB_URI is not defined in the environment variables');
}

if (!process.env.EMAIL) {
    throw new Error('EMAIL is not defined in the environment variables');
}

if (!process.env.PASSWORD) {
    throw new Error('PASSWORD is not defined in the environment variables');
}

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in the environment variables');
}

export const PORT: string | number = process.env.PORT || 4000;
export const USER_SERVICE_MONGO_URI = process.env.USER_SERVICE_MONGODB_URI;
export const EMAIL = process.env.EMAIL;
export const PASSWORD = process.env.PASSWORD;
export const JWT_SECRET = process.env.JWT_SECRET;
export const NODE_ENV = process.env.NODE_ENV;