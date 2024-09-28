import mongoose, { Document } from "mongoose"

interface IUser extends Document {
    email: string
    password: string
    numberOfFailedLoginAttempts: number
    // Add more fields as needed
}

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        numberOfFailedLoginAttempts: {
            type: Number,
            default: 0,
            required: true,
        },
    },
    {
        timestamps: true,
    }
)

export const User = mongoose.model<IUser>('User', userSchema)