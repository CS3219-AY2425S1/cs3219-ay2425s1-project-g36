// External libraries
import mongoose, { Document } from "mongoose";
const AutoIncrement = require("mongoose-sequence")(mongoose);

// Internal project modules
import QUESTION_TOPICS from "./questionTopics";

/**
 * Interface for the Question model, extending Mongoose's Document.
 * 
 * This interface defines the structure of a Question document in the MongoDB collection.
 */
interface IQuestion extends Document {
    title: string;
    difficulty: "easy" | "medium" | "hard";
    topics?: Topic[];
    description: string;
    testInputs: string[];
    testOutputs: string[];
}

// Type alias for topics, constrained to valid values in QUESTION_TOPICS array
type Topic = typeof QUESTION_TOPICS[number]

/**
 * Mongoose schema for the Question model.
 * 
 * This schema defines the structure, data types, default values, and validation 
 * for each field in a Question document. An auto-incrementing `_id` is added to each document.
 */
const questionSchema = new mongoose.Schema(
    {
        _id: {
            type: Number,
        },
        title: {
            type: String,
            required: true,
            index: {
                // makes title a primary key, which ignores caps when checking for uniqueness
                // i.e. 'Word Search' and 'word search' are considered duplicates
                unique: true,
                collation: { locale: "en", strength: 2 },
            },
        },
        difficulty: {
            type: String,
            required: true,
            enum: ["easy", "medium", "hard"],
        },
        topics: {
            type: [String],
            required: false,
            
        },
        description: {
            type: String,
            required: true,
        },
        testInputs: {
            type: [String]
        },
        testOutputs: {
            type: [String]
        },
    },
    {
        timestamps: true,
        id_: false,
    }
);

// Add auto-increment plugin to handle sequential `_id` generation
questionSchema.plugin(AutoIncrement);

/**
 * Question Model
 * 
 * This model provides an interface to interact with the `Question` collection in MongoDB.
 */
export const Question = mongoose.model<IQuestion>("Question", questionSchema);
