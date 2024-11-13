import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

if (!process.env.COLLABORATION_SERVICE_MONGODB_URI) {
    throw new Error(
        "COLLABORATION_SERVICE_MONGODB_URI is not defined in the environment variables"
    );
}
if (!process.env.JDOODLE_CLIENT_ID) {
    throw new Error(
        "JDOODLE_CLIENT_ID is not defined in the environment variables"
    );
}
if (!process.env.JDOODLE_CLIENT_SECRET_KEY) {
    throw new Error(
        "JDOODLE_CLIENT_SECRET_KEY is not defined in the environment variables"
    );
}

if (!process.env.NODE_ENV) {
    process.env.NODE_ENV=""
}

export const WEBSOCKET_PORT = 3001;
export const COLLABORATION_SERVICE_PORT = 3002
export const FRONTEND_PORT = 5173;
export const COLLABORATION_SERVICE_MONGODB_URI = process.env.COLLABORATION_SERVICE_MONGODB_URI;
export const JDOODLE_CLIENT_ID = process.env.JDOODLE_CLIENT_ID
export const JDOODLE_CLIENT_SECRET_KEY = process.env.JDOODLE_CLIENT_SECRET_KEY
