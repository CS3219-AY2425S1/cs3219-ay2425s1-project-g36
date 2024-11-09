import mongoose, { Document } from "mongoose"
import AttemptHistory, { attemptHistorySchema, IAttemptHistory } from "./attemptHistoryModel";

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
    // Add more fields as needed
}

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
const User = mongoose.model<IUser>('User', userSchema)
export default User;