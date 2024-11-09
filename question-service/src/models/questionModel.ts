import mongoose, { Document } from "mongoose";
import QUESTION_TOPICS from "./questionTopics";
const AutoIncrement = require("mongoose-sequence")(mongoose);


interface IQuestion extends Document {
    title: string;
    difficulty: "easy" | "medium" | "hard";
    topics?: Topic[];
    description: string;
    testInputs: string[];
    testOutputs: string[];
}

type Topic = typeof QUESTION_TOPICS[number]

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

questionSchema.plugin(AutoIncrement);
export const Question = mongoose.model<IQuestion>("Question", questionSchema);
