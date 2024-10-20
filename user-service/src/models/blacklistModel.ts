import mongoose, { Document } from "mongoose"

interface IBlacklist extends Document {
    token: string
    expiresAt: Date
    // Add more fields as needed
}

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

export const Blacklist = mongoose.model<IBlacklist>('Blacklist', blacklistSchema)