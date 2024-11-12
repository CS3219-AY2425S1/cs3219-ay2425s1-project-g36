import express, { Application, Request, Response } from "express";
import cors from 'cors'
import { Server } from "socket.io";
import mongoose from "mongoose";
import { MongoServerError } from "mongodb";
import { DocumentModel, DocumentType } from './src/models/document'
import { WEBSOCKET_PORT, COLLABORATION_SERVICE_MONGODB_URI, FRONTEND_PORT, COLLABORATION_SERVICE_PORT } from './config'
import { listenToMatchingService } from './src/kafka/collabController'
import { makeReplyToChat } from './src/chat/chatbotController'
import { ChatMessage, ChatModel, ChatType, MessageType } from "./src/models/chat";
import { ProgrammingLanguage } from './src/models/ProgrammingLanguage'

import collabRoutes from './src/routes/collabRoute'
import { findOrCreateBotChat, findOrCreateChat } from "./src/chat/chatController";

const app: Application = express();

app.use(express.json());

const corsOptions = {
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200,
    credentials: true
}

app.use(cors(corsOptions))
app.use("/collaboration", collabRoutes);

app.listen(COLLABORATION_SERVICE_PORT, () => {
    console.log(`Collab server is running on port ${COLLABORATION_SERVICE_PORT}`);
});

mongoose
    .connect(COLLABORATION_SERVICE_MONGODB_URI)
    .then(() => {
        console.log('successfully connected to Collaboration-service mongodb')
    }).catch((error: unknown) => {
        console.error(error);
    })

const io = new Server(WEBSOCKET_PORT, {
    cors: {
        origin: `http://localhost:${FRONTEND_PORT}`,
        methods: ["GET", "POST"],
    },
})

listenToMatchingService()

// runs when the collaboration page is loaded
io.on("connection", socket => {
    socket.on('get-document', async (documentId: string) => {
        const document = await findOrCreateDocument(documentId)
        if (document) {

            // Leave the previous room if joined
            for (const room of socket.rooms) {
                if (room !== socket.id) {
                    socket.leave(room);
                }
            }
            socket.join(documentId)
            console.log(documentId, "joined");

            socket.emit('load-document', document.data) // tells frontend to update its contents

            socket.on('send-changes', (delta: object) => {
                // when server receives changes from client, server will emit changes to the document
                socket.broadcast.to(documentId).emit("receive-changes", delta)
            })

            socket.on('save-document', async data => {
                // need to update database every 2 seconds
                await DocumentModel.findByIdAndUpdate(documentId, { data })
            })

            socket.on('run-code', (runCodeResult: string, isCodeRunning: boolean) => {
                // when server receives the new runCodeResult, broadcast to the document the result
                socket.broadcast.to(documentId).emit('run-code-result', runCodeResult, isCodeRunning)
            })

            socket.on('change-prog-language', (progLanguage: ProgrammingLanguage) => {
                // when server receives the new programming language, broadcast to the document the new language
                socket.broadcast.to(documentId).emit('update-prog-language', progLanguage)
            })

            socket.on('update-isCodeRunning', (isCodeRunning: boolean) => {
                socket.broadcast.to(documentId).emit('update-isCodeRunning', isCodeRunning)
            })
        }
    });

    /**
     * roomId: The collaboration room ID.
     * userId: The ID of the client user that is calling this socket handler.
     * matchedId: The ID of the matched user that the client user is matched with.
     */
    socket.on('get-messages', async (roomId : string, userId : string, matchedId : string) => {

        /* Chat between the two matched users */
        const userChat = await findOrCreateChat(roomId, userId, matchedId);

        /* Chat between user and bot */
        const botChat = await findOrCreateBotChat(roomId, userId);

        socket.join(roomId + "-messages");

        if (botChat) {
            socket.emit('load-messages-bot', botChat.messages) // tells frontend to update its contents

            socket.on('send-chat-message-bot', async (
                questionId : string,
                progLang : string,
                chatMessage: {
                    message: string,
                    userId: string
                }
            ) => {     
                const message : MessageType = {
                    sender: userId,
                    role: 'user',
                    timestamp: new Date(),
                    content: chatMessage.message
                } as MessageType;


                // get most updated messages
                const latestBotChat = await ChatModel.findById(botChat._id);

                if (latestBotChat) {
                    const latestMessages = latestBotChat.messages;
                    await ChatModel.findByIdAndUpdate(botChat._id, { messages: [...latestMessages, message] });
                }

                // when server receives a chat message from client, the AI bot will come up with
                // a response, then socket transmits the answer back
                const aiResponse = await makeReplyToChat(questionId, progLang, botChat._id);
                console.log(aiResponse);
                socket.emit("receive-chat-message-bot", aiResponse);
            });

            // websocket handler to clear chat
            socket.on('clear-chat-bot', async () => {
                await ChatModel.findByIdAndUpdate(botChat._id, { messages: [] });
            });
        }

        if (userChat) {
            socket.emit('load-messages-user', userChat.messages) // tells frontend to update its contents
            
            socket.on('send-chat-message-user', async (chatMessage: ChatMessage) => {
                const message : MessageType = {
                    sender: userId,
                    role: 'user',
                    timestamp: new Date(),
                    content: chatMessage.message
                } as MessageType;

                // get most updated messages
                const latestUserChat = await ChatModel.findById(userChat._id);

                if (latestUserChat) {
                    const latestMessages = latestUserChat.messages;
                    await ChatModel.findByIdAndUpdate(userChat._id, { messages: [...latestMessages, message] });
                }

                // when server receives a chat message from client, server will broadcast the chat message
                socket.broadcast.to(roomId + "-messages").emit("receive-chat-message-user", chatMessage)
            })

            // websocket handler to clear chat
            socket.on('clear-chat-user', async () => {
                await ChatModel.findByIdAndUpdate(userChat._id, { messages: [] });

                // inform other user to clear their messages in frontend (and produce toast message)
                socket.broadcast.to(roomId + "-messages").emit("received-clear-chat-user");
            });
        }
    });
})

console.log('Collaboration-service is up - Starting service')

async function findOrCreateDocument(id: string): Promise<DocumentType | null> {
    if (id == null) return null;

    const document = await DocumentModel.findById(id);
    if (document) return document;

    try {
        return await DocumentModel.create({
            _id: id,
            data: ""
        });
    } catch (error: unknown) {
        if (error instanceof MongoServerError && error.code === 11000) {
            // if code enters here, means the same uuid was generated twice, which by the laws of cryptography (idk), should never happen 
            console.error("Duplicate key error, code 11000:", error.message);
        } else {
            console.error("Error creating document:", error);
        }
        return null;
    }
}