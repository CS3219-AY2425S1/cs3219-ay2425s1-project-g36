import mongoose, { Document } from "mongoose";

interface IAttemptHistory extends Document {
    timeSubmitted: Date;
    questionTitle: string;
    questionId: number;
    language: string;
    code: string;
    // Add more fields as needed
}

const attemptHistorySchema = new mongoose.Schema(
    {
        timeSubmitted: {
            type: Date,
            default: Date.now,
            required: true,
        },
        questionTitle: {
            type: String,
            required: true,
        },
        questionId: {
            type: Number,
            required: true,
        },
        language: {
            type: String,
            required: true,
        },
        code: {
            type: String,
            default: ""
        },
    },
    {
        timestamps: true,
    }
);

const AttemptHistory = mongoose.model<IAttemptHistory>("AttemptHistory", attemptHistorySchema);
export { attemptHistorySchema, IAttemptHistory }; 
export default AttemptHistory;
