import mongoose, { Document, Schema } from "mongoose";

export type ChatMessage = {
    userToken: string,
    message: string,
}

// Message Interface
export interface MessageType extends Document {
    sender: string;
    role: 'system' | 'user' | 'assistant';
    timestamp: Date;
    content: string;
}

// Chat Interface
export interface ChatType extends Document {
    _id: string;
    user1: string;
    user2: string;
    messages: MessageType[];
}

const messageSchema: Schema<MessageType> = new mongoose.Schema({
    sender: { type: String, required: true },
    role: { type: String, enum: ["system", "user", "assistant"], required: true },
    timestamp: {
        type: Date,
        default: Date.now
    },
    content: { type: String, required: true }
});

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

const MessageModel = mongoose.model<MessageType>("Message", messageSchema);
const ChatModel = mongoose.model<ChatType>("Chat", chatSchema);

export { MessageModel, ChatModel };