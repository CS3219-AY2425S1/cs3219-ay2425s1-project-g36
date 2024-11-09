import { ChatModel, ChatType, MessageType } from '../models/chat';
import { MongoServerError } from "mongodb";

export async function getMessagesInChat(chatId: string) {
    try {
        // Find the chat by its _id
        const chat = await ChatModel.findById(chatId);
        if (!chat) {
            throw new Error('Chat not found');
        }
    
        const messages = chat.messages;
    
        return messages; // Return the found messages
    } catch (error : any) {
        console.error('Error:', error.message);
        throw error;
    }
}

/**
 * Finds or creates a chat between two matched users.
 * @param roomId The room ID to create the chat between the two users.
 * @param userId1 The first user in the chat.
 * @param userId2 The second user in the chat.
 * @returns The created or found chat, as a promise (null promise if error)
 */
export async function findOrCreateChat(roomId : string, userId1: string, userId2: string): Promise<ChatType | null> {
    if (roomId === null || userId1 === null || userId2 === null) return null;

    console.log("Finding chat with room id", roomId)

    const botChat = await ChatModel.findById(roomId + "-user");
    if (botChat) return botChat;

    try {
        return await ChatModel.create({
            _id: roomId + "-user",
            user1: userId1,
            user2: userId2,
            messages: []
        });
    } catch (error: unknown) {
        if (error instanceof MongoServerError && error.code === 11000) {
            console.error("Duplicate key error, code 11000:", error.message);
        } else {
            console.error("Error creating chat:", error);
        }
        return null;
    }
}

/**
 * Finds or creates a chat between a user and a bot.
 * @param roomId The room ID to create the chat in.
 * @param userId The user communicating with the bot.
 * @returns The created or found chat, as a promise (null promise if error)
 */
export async function findOrCreateBotChat(roomId : string, userId : string): Promise<ChatType | null> {
    if (userId == null) return null;

    console.log("Finding bot chat with room id", roomId, "and user id", userId)

    // why roomId? Just to distinguish between chat logs by the same user in past sessions.
    // it's a good security measure either way
    const chatId = roomId + "-bot-" + userId;

    const botChat = await ChatModel.findById(chatId);
    if (botChat) return botChat;

    try {
        return await ChatModel.create({
            _id: chatId,
            user1: userId,
            user2: "PeerPrepBot",
            messages: []
        });
    } catch (error: unknown) {
        if (error instanceof MongoServerError && error.code === 11000) {
            console.error("Duplicate key error, code 11000:", error.message);
        } else {
            console.error("Error creating chat with bot:", error);
        }
        return null;
    }
}