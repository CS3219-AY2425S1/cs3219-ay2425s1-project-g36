import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

if (!process.env.QUESTION_SERVICE_MONGODB_URL) {
    throw new Error(
        "QUESTION_SERVICE_MONGODB_URL is not defined in the environment variables"
    );
}

export const PORT = 3000;
export const QUESTION_SERVICE_MONGODB_URL =
    process.env.QUESTION_SERVICE_MONGODB_URL;
