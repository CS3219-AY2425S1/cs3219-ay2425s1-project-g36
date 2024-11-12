import mongoose, { Document } from "mongoose";

/**
 * Interface for the AttemptHistory model, extending Mongoose's Document.
 * 
 * This interface defines the structure of an AttemptHistory document in the MongoDB collection.
 * It specifies the properties for each attempt made by a user, including types for each field.
 */
interface IAttemptHistory extends Document {
    timeSubmitted: Date;
    questionTitle: string;
    questionId: number;
    language: string;
    code: string;
    // Add more fields as needed
}

/**
 * Mongoose schema for the AttemptHistory model.
 * 
 * This schema defines the structure, data types, default values, and validation 
 * for each field in an AttemptHistory document.
 */
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

/**
 * AttemptHistory Model
 * 
 * This model provides an interface to interact with the `AttemptHistory` collection in MongoDB.
 */
const AttemptHistory = mongoose.model<IAttemptHistory>("AttemptHistory", attemptHistorySchema);

export { attemptHistorySchema, IAttemptHistory }; 
export default AttemptHistory;
