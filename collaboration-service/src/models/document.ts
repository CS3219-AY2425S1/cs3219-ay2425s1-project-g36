import mongoose, { Document, Schema } from "mongoose";

/**
 * Interface representing a document stored in MongoDB.
 */
export interface DocumentType extends mongoose.Document {
    _id: string;
    data: object;
}

/**
 * Mongoose schema defining the structure of the `Document` collection.
 */
const documentSchema: Schema<DocumentType> = new Schema({
    _id: { 
        type: String,
        required: true
    },
    data: { 
        type: Object,
        required: true 
    }
});

/** Mongoose model for the `Document` collection in MongoDB. */
export const DocumentModel = mongoose.model<DocumentType>("Document", documentSchema)