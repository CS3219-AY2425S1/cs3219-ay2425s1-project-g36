import { Kafka } from "kafkajs"
import axios from 'axios'; 

import collabStore from '../utils/collabStore'

const DEFAULT_QUESTION_ID = 75;
const kafka = new Kafka({
    clientId: 'collaboration-service',
    brokers: ['kafka:9092'], 
    retry: {
        retries: 10,           
        initialRetryTime: 300,  
        factor: 2,             
    },
});

const consumer = kafka.consumer({ groupId: "collaboration-service-group" });

// This function runs whenever collaboration-service runs.
// Listens to a '2 users have matched' event. Update collabStore.
// collabStore is a single source of truth to give all the information regarding a user's collaboration details.
export const listenToMatchingService = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: "collaboration", fromBeginning: true });
    console.log('collab-service has subscribed to collaboration topic')

    await consumer.run({
        eachMessage: async ({ message } : { message : any }) => {
            const _ = message.key.toString() // key is not really needed
            const body = JSON.parse(message.value.toString())

            const user1_id = body.user1_id
            const user2_id = body.user2_id
            const roomId = body.roomId

            // Selects a random common programming language
            // matchingController guarantees that the 2 users will have at least 1 common progLang
            const selectedProgLang: string = selectCommonProgLang(body.user1_progLangs, body.user2_progLangs)

            // Based on the topics and difficulties, query database and retrieve a question
            const question_topics: string[] = body.question_topics
            const question_difficulties: string[] = body.question_difficulties
            
            let selectedQuestionId: number | null = await getQuestionId(question_topics, question_difficulties);

            if (selectedQuestionId === null) {
                selectedQuestionId = DEFAULT_QUESTION_ID;
            } 

            // at this point, update the collab store, which is a local data structure
            collabStore.addUser(user1_id, {
                userId : user1_id,
                matchedUserId: user2_id,
                roomId: roomId,
                questionId: selectedQuestionId,
                progLang: selectedProgLang
            })
            collabStore.addUser(user2_id, {
                userId : user2_id,
                matchedUserId: user1_id,
                roomId: roomId,
                questionId: selectedQuestionId,
                progLang: selectedProgLang
            })
            
            // nice way to view the contents of collab store
            console.log("printing contents of collab store")
            collabStore.printContents()
        }
    })
}

const selectCommonProgLang = (user1_progLang: string[], user2_progLang: string[]) => {
    const commonProgLangs = user1_progLang.filter(lang => user2_progLang.includes(lang))
    const selectedProgLang = commonProgLangs[Math.floor(Math.random() * commonProgLangs.length)] 
    return selectedProgLang
}

const getQuestionId = async (question_topics: string[], question_difficulties: string[]): Promise<number | null> => {
    const QUESTION_SERVICE_URL = "http://question-service-container:3000/";
    const api = axios.create({
        baseURL: QUESTION_SERVICE_URL,
    });

    const joined_topics: string = question_topics.join(",");
    const joined_difficulties: string = question_difficulties.join(",");

    try {
        const response = await api.post('/questions/filter', 
            {
                topics: joined_topics,
                difficulties: joined_difficulties
            }
        );
        
        // Check for 200 status and presence of questionId
        if (response.status === 200 && response.data?.questionId) {
            const questionId: number = response.data.questionId;
            console.log("Fetched Question ID:", questionId);
            return questionId;
        } else {
            console.error("No question ID found in the response data.");
            return null;
        }
    } catch (error) {
        // Handle a 500 or any other error status
        if (axios.isAxiosError(error) && error.response?.status === 500) {
            console.error("Internal server error from the question service.");
        } else {
            console.error("Error fetching questions:", error);
        }
        return null;
    }
}

