import OpenAI from "openai";
import { ChatMessage, ChatModel, MessageType } from "../models/chat";
import axios from "axios";
import { getMessagesInChat } from "./chatController";

/**
 * Implementation of an AI chatbot as a controller to allow users to seek for help
 * within the PeerPrep interface.
 */

type Role = "system" | "user" | "assistant";

type OpenAIMessage = {
    role: Role;
    content: string;
}

const SYSTEM_PROMPT_HEADER = "You are a chatbot that assists users in solving programming questions. You should try to guide the user towards a correct approach for the programming question. You should encourage users to figure out the solution on their own.\n\nThe question is given as follows:\n\n\"\"\"\n";
const SYSTEM_PROMPT_MIDDLE = "\n\"\"\"\n\nThe users are working with the programming language **";
const SYSTEM_PROMPT_FOOTER = "**.";

const openai = new OpenAI(); 

async function makeSystemPrompt(questionId : string, progLang : string) {
    const questionDesc = await fetchQuestionById(questionId);
    return SYSTEM_PROMPT_HEADER + questionDesc + SYSTEM_PROMPT_MIDDLE + progLang + SYSTEM_PROMPT_FOOTER;
}

export async function makeReply(questionId : string, progLang : string, messages : OpenAIMessage[]) {
    const systemPrompt = await makeSystemPrompt(questionId, progLang);
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: systemPrompt },
            ...messages
        ]
    });
    console.log("Prompt tokens used:", completion.usage?.prompt_tokens);
    console.log("Completion tokens used:", completion.usage?.completion_tokens);
    console.log("Total tokens used:", completion.usage?.total_tokens);
    return completion.choices[0].message.content;
}

/**
 * Runs the OpenAI chatbot and provides a reply, that is then added to the chat log.
 * 
 * @param questionId The question ID to provide context to the chatbot.
 * @param progLang The programming language to provide context for the chatbot.
 * @param chatId The ID of the chat that the chatbot should reply to.
 * 
 * @return The OpenAI chatbot reply.
 */
export async function makeReplyToChat(questionId : string, progLang : string, chatId : string) {

    const chat = await ChatModel.findById(chatId);
    
    if (!chat) {
        console.log("Could not fetch chat with ID", chatId);
        return "";
    }

    const openAiMessages = chat.messages.map(message => {
        return {
            role: message.role,
            content: message.content
        }
    }) as OpenAIMessage[];

    const replyMessage = await makeReply(questionId, progLang, openAiMessages);

    const newMessage = {
        sender: 'PeerPrepBot',
        role: 'assistant',
        timestamp: new Date(),
        content: replyMessage
    } as MessageType;

    await ChatModel.findByIdAndUpdate(chatId, { messages: [...chat.messages, newMessage] });

    return replyMessage;
}

const fetchQuestionById = async (id? : string): Promise<string> => {
    const QUESTION_SERVICE_URL = "http://question-service-container:3000/";
    const api = axios.create({
        baseURL: QUESTION_SERVICE_URL,
    });

    try {
        const response = await api.get('/questions/' + id);
        
        // Check for 200 status and presence of questionId
        if (response.status === 200 && response.data?.description) {
            const description: string = response.data.description;
            console.log("Fetched Question with description", description, "from ID", id);
            return description;
        } else {
            console.error("No valid question found in the response data.");
            return "Could not fetch question";
        }
    } catch (error) {
        // Handle a 500 or any other error status
        if (axios.isAxiosError(error) && error.response?.status === 500) {
            console.error("Internal server error from the question service.");
        } else {
            console.error("Error fetching questions from ID", error);
        }
        return "Could not fetch question";
    }
}
