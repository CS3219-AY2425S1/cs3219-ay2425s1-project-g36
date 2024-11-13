import mongoose, { Document } from "mongoose"

import { attemptHistorySchema, IAttemptHistory } from "./attemptHistoryModel";

/**
 * Interface for the User model, extending Mongoose's Document.
 * This interface defines the shape of a User document in the MongoDB collection
 * and helps TypeScript with type-checking and autocompletion.
 */
interface IUser extends Document {
    username: string
    email: string
    password: string
    createdAt: Date
    numberOfFailedLoginAttempts: number
    passwordResetToken?: string
    passwordResetTokenExpiration?: Date
    isAdmin: boolean
    attemptHistory: IAttemptHistory[]
}

/**
 * Mongoose schema for the User model.
 * Defines the structure, data types, and validation for each field.
 */
const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now, // Setting default to the current date/time
        },
        numberOfFailedLoginAttempts: {
            type: Number,
            default: 0,
            required: true,
        },
        passwordResetToken: {
            type: String,
            required: false
        },
        passwordResetTokenExpiration: {
            type: Date,
            required: false
        },
        isAdmin: {
            type: Boolean,
            required: true,
            default: false
        },
        attemptHistory: {
            type: [attemptHistorySchema], 
        }
    },
    {
        timestamps: true,
    }
)

/**
 * User Model
 * This is the model that interacts with the MongoDB 'User' collection.
 */
const User = mongoose.model<IUser>('User', userSchema)
export default User;