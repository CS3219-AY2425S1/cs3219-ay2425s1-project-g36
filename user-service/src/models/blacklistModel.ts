import mongoose, { Document } from "mongoose"

/**
 * Interface for the Blacklist model, extending Mongoose's Document.
 * This interface defines the shape of a Blacklist document in MongoDB,
 * helping TypeScript with type-checking and autocompletion.
 */
interface IBlacklist extends Document {
    token: string
    expiresAt: Date
    // Add more fields as needed
}

/**
 * Mongoose schema for the Blacklist model.
 * Defines the structure, data types, and validation for each field.
 */
const blacklistSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: true,
            unique: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
)

/**
 * Blacklist Model
 * This model interacts with the MongoDB 'Blacklist' collection,
 * where each document represents a blacklisted JWT token.
 */
export const Blacklist = mongoose.model<IBlacklist>('Blacklist', blacklistSchema)