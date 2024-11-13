import mongoose, { Document, Schema } from "mongoose";

/**
 * Type representing an individual chat message sent by a user.
 */
export type ChatMessage = {
    userToken: string,
    message: string,
}

/**
 * Interface for a message in the chat system.
 */
export interface MessageType extends Document {
    sender: string;
    role: 'system' | 'user' | 'assistant';
    timestamp: Date;
    content: string;
}

/**
 * Interface representing a chat session between two users.
 */
export interface ChatType extends Document {
    _id: string;
    user1: string;
    user2: string;
    messages: MessageType[];
}

/** Schema for individual messages in a chat. */
const messageSchema: Schema<MessageType> = new mongoose.Schema({
    sender: { type: String, required: true },
    role: { type: String, enum: ["system", "user", "assistant"], required: true },
    timestamp: {
        type: Date,
        default: Date.now
    },
    content: { type: String, required: true }
});

/** Schema for a chat session between two users, containing multiple messages. */
const chatSchema: Schema<ChatType> = new Schema({
    _id: { 
        type: String,
        required: true
    },
    user1: {
        type: String,
        required: true
    },
    user2: {
        type: String,
        required: true
    },
    messages: { 
        type: [messageSchema],
        required: true 
    }
});

/** Mongoose model for individual messages within a chat. */
const MessageModel = mongoose.model<MessageType>("Message", messageSchema);

/** Mongoose model for chat sessions between two users. */
const ChatModel = mongoose.model<ChatType>("Chat", chatSchema);

export { MessageModel, ChatModel };