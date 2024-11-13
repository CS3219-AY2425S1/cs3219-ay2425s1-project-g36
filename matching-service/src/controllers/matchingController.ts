// External libraries
import { Kafka } from "kafkajs";
import { v4 as uuidv4 } from 'uuid'

// Internal project modules
import { User, hasCommonDifficulties } from "../model/user";
import { Queue } from "../model/queue";
import userStore from "../utils/userStore";
import { findCommonDifficulties, findCommonTopics } from "../model/user";

const kafka = new Kafka({
    clientId: 'matching-service',
    brokers: ['kafka:9092'],    
    retry: {
        retries: 10,            // Increase the number of retries
        initialRetryTime: 300,  // Increase initial retry time
        factor: 2,              // Exponential backoff
    },
});

/**
 * Consumer related functions.
 * Separate consumers for matching and confirmation to run them in parallel.
 */
const matchConsumer = kafka.consumer({ groupId: "matching" });
const confirmationConsumer = kafka.consumer({ groupId: "confirmation" });
const producer = kafka.producer();

const TIMEOUT_DURATION = 30000; // Timeout set for 30 seconds
const CONFIRMATION_DURATION = 11000; // Confirmation timeout set for 11 seconds to prevent backend from being faster than frontend

// Main function to initialize and run the consumer
export async function initializeConsumer() {
    try {
      matchConsumer.connect();
      confirmationConsumer.connect();
      producer.connect();
    } catch (error) {
      console.error("Error connecting to consumer or running messages:", error);
    }
}

/**
 * Find a matching user (among previous users) for a new user based on their topics and difficulties.
 * 
 * @param newUser The new user
 * @param waitingQueue The queue of waiting users
 * @returns The matching user or null if no match is found
 */
const findMatchingUser = (newUser: User, waitingQueue: Queue): User | null => {
    // Start from the back
    for (let i = 0; i < waitingQueue.count(); i++) {
        const user = waitingQueue.peek(i);

        // Avoid matching with itself
        if (newUser.id === user.id) {
            continue;
        }

        if (!hasCommonDifficulties(newUser, user)) {
            continue; 
        }

        if (!newUser.progLangs.some(progLang => user.progLangs.includes(progLang))) {
            continue;
        }

        if (newUser.topics.some(topic => user.topics.includes(topic))) {
            return user; 
        }
    }
    return null;
}

/**
 * Create a confirmation timeout for the user (6 seconds long).
 * 
 * @param user The user
 * @param matchedUser The matched user
 * @returns The confirmation timeout
 */
const createConfirmationTimeout = (user: User, matchedUser: User) => {
    const confirmationTimeout = setTimeout(() => {
        if (!user.isPeerReady || !matchedUser.isPeerReady) {
            if (!matchedUser.isPeerReady) {
                console.log("Match declined for User ", user.email, "due to confirmation timeout for User ", user.email);
            } else {
                console.log("Match declined for User ", user.email, "due to confirmation timeout for User ", matchedUser.email);
            }
            // Remove matched user field 
            user.matchedUser = null;

            // Update status for the user
            user.confirmationStatus = 'timeout';

            console.log("user removed from user store")
            userStore.removeUser(user.id);
        }
    }, CONFIRMATION_DURATION);

    return confirmationTimeout;

}

/**
 * Listens to the queue for new users. If a match is found, the users' status are updated. 
 * (user.matchedUser is set to the matched user object and is no longer null)
 * 
 * Else, adds the new user to the waiting queue. User waits for a match until the timeout 
 * and is notified if no match is found.
 * 
 * The waiting queue is a FIFO queue and the oldest user is matched first.
 * This queue cannot be accessed from the outside.
 */
export const startMatching = async () => {

    await matchConsumer.subscribe({ topic: "user-matching", fromBeginning: true });
    const waitingQueue = new Queue();
    console.log("Queue status: ", waitingQueue.getUserEmails());

    await matchConsumer.run({
        eachMessage: async ({ message } : { message : any }) => {

            const key = message.key ? message.key.toString() : null; // User ID
            const value = message.value ? message.value.toString() : null; // "cancel" | "match"

            // Check if key or value is null or doesn't match expected criteria, then skip
            if (!key || !value || value === "placeholder_value") {
                console.log("Ignoring placeholder message");
                return;
            }

            console.log(`Received queueing message from User: ${key}`);

            // Check if it is a tombstone message
            if (value === 'cancel') {
                // Remove user from waiting queue if inside
                if (waitingQueue.isUserInQueue(key)) {
                    const user = userStore.getUser(key)!;
                    // Clear the user's timeout, remove from the queue and user store
                    clearTimeout(user.timeout!);
                    waitingQueue.removeUser(user);
                    userStore.removeUser(key);
                    console.log(`User ${user.email} has been removed from the queue.`);
                    console.log("Queue status: ", waitingQueue.getUserEmails());
                }
                return;
            }

            // Get user object from the store
            const newUser = userStore.getUser(key);
            if (!newUser) {
                console.log(`User ${key} not found in the user store.`);
                return;
            }
            console.log('User ID: ', newUser.id, '. User Email: ', newUser.email);
            console.log(`User ${newUser.email} is ready to be matched.`);

            const timeout = setTimeout(() => {
                if (newUser.matchedUser === null) {
                    console.log(`User ${newUser.email} has timed out and will be removed from the queue.`);

                    // Remove user from the queue and user store
                    waitingQueue.removeUser(newUser); // Remove user from the queue
                    userStore.removeUser(newUser.id); // Remove user from the store
                    console.log("Queue status: ", waitingQueue.getUserEmails());

                }
            }, TIMEOUT_DURATION);

            // Set timeout for the user to be able to clear it later
            newUser.timeout = timeout;

            // Search for a matching user in the queue, starting from the oldest user
            const matchedUser = findMatchingUser(newUser, waitingQueue); 

            if (matchedUser) {
                console.log(`Matched user ${matchedUser.email} with ${newUser.email}`);

                // Update matched user fields
                matchedUser.matchedUser = newUser;
                newUser.matchedUser = matchedUser;

                // Clear matching timeout for both users
                clearTimeout(newUser.timeout);
                if (matchedUser.timeout) {
                    clearTimeout(matchedUser.timeout);
                }

                // Update confirmation timeout for both users
                newUser.timeout = createConfirmationTimeout(newUser, matchedUser);
                matchedUser.timeout = createConfirmationTimeout(matchedUser, newUser);
                
                // Remove matched user from the queue
                waitingQueue.removeUser(matchedUser); 
                console.log("Remove matched user from queue: User ", matchedUser.email);
                console.log("Queue status: ", waitingQueue.getUserEmails());

            } else { 
                // Add user to the waiting queue
                waitingQueue.push(newUser);
                console.log(`User ${newUser.email} added to waiting list`);
                console.log("Queue status: ", waitingQueue.getUserEmails());
            }
        }
    });
}

/**
 * Listens to the user-confirmation topic for user confirmations.
 * 
 * If the users are not supposed to be matched, the match is declined.
 * If the users are matched, the users' status are updated.
 * If the users are not ready in time, the match is timed out and the users' status are updated.
 * If the other user is not ready, the user waits for the other user to confirm.
 */
export const startConfirmation = async () => {
    confirmationConsumer.subscribe({ topic: 'user-confirmation', fromBeginning: true });

    await confirmationConsumer.run({
        eachMessage: async ({ message } : { message : any }) => {
            const key = message.key ? message.key.toString() : null;
            const value = message.value ? message.value.toString() : null;

            // Check if key or value is null or doesn't match expected criteria, then skip
            if (!key || !value || value === "placeholder_value") {
                console.log("Ignoring placeholder message");
                return;
            }

            console.log(`Received confirmation message from User: ${key}`);

            // Retrieve the user and matched user from the store
            const user = userStore.getUser(key)!;
            const matchedUser = userStore.getUser(value);

            console.log('User ID:', user.id, '. User Email:', user.email);

            // Check if they are each other's matched user
            if (user.matchedUser === matchedUser && matchedUser.matchedUser === user) {

                // Since user is ready
                matchedUser.isPeerReady = true;

                // Check if matched user has confirmed
                if (user.isPeerReady) {
                    console.log(`Both users have confirmed the match between User ${user.email} and User ${matchedUser.email}.`);

                    // Clear the timeout for both users
                    clearTimeout(user.timeout!);
                    clearTimeout(matchedUser.timeout!);

                    // Update the users' status
                    user.confirmationStatus = 'confirmed';
                    matchedUser.confirmationStatus = 'confirmed';

                    const roomId = uuidv4() // give both users a room Id to collaborate 
                    const question_topics = findCommonTopics(user, matchedUser)
                    const question_difficulties = findCommonDifficulties(user, matchedUser)
                    
                    // matching-service sends information to collab-service using kafka 
                    await sendCollaborationMessage(user.id, matchedUser.id, roomId, question_topics, question_difficulties, user.progLangs, matchedUser.progLangs)
                } else {
                    // Keep waiting and update the user's status
                    console.log(`User ${user.email} has confirmed the match, waiting for ${matchedUser.email} to confirm.`);
                    user.confirmationStatus = 'waiting';
                }
            } else {
                // Decline the match if the users are not supposed to be matched. This is not supposed to happen
                console.log(`Match declined between User ${user!.email} and User ${matchedUser!.email}.`);
                user!.confirmationStatus = 'declined';
                matchedUser!.confirmationStatus = 'declined';
            }
        }
    });
}

// Producer related functions

/**
 * Send a user selection message to the user-selection topic.
 * 
 * @param user Topics, difficulties, and user token
 * @param isCancel Whether the user wants to stop matching, set to false by default
 */
export const sendQueueingMessage = async (id: string, isCancel: boolean = false) => {
    if (isCancel) {
        console.log(`Sending User ${id} to the queue to cancel.`);
    } else {
        console.log(`Sending User ${id} to the queue.`);
    }
    await producer.send({
        topic: 'user-matching',
        messages: [
            { key: id, value: isCancel ? "cancel": "match" },
        ],
    });
}

/**
 * Send a user confirmation message to the user-confirmation topic.
 * 
 * @param user The user
 * @param matchedUser The matched user
 */
export const sendConfirmationMessage = async (userId: string, matchedUserId: string) => {
    console.log(`Sending confirmation message from User ${userId} to User ${matchedUserId}`);
    await producer.send({
        topic: 'user-confirmation',
        messages: [
            { key: userId, value: matchedUserId },
        ],
    });
}

/**
 * Send a collaboration message to the collaboration topic.
 * 
 * @param user1_id The first user's ID
 * @param user2_id The second user's ID
 * @param roomId The room ID for the collaboration
 * @param question_topics The common topics between the users
 * @param question_difficulties The common difficulties between the users
 */
export const sendCollaborationMessage = async (
    user1_id: string, 
    user2_id: string, 
    roomId: string, 
    question_topics: string[], 
    question_difficulties: string[], 
    user1_progLangs: string[], 
    user2_progLangs: string[]
) => {
    if (
        user1_id === null || 
        user2_id === null || 
        roomId === null || 
        question_topics.length === 0 || 
        question_difficulties.length === 0 || 
        user1_progLangs.length === 0 || 
        user2_progLangs.length === 0
    ) return
    
    const message = JSON.stringify({
        user1_id,
        user2_id,
        roomId,
        question_topics,
        question_difficulties,
        user1_progLangs,
        user2_progLangs
    })

    await producer.send({
        topic: 'collaboration',
        messages: [
            { key: roomId, value: message },
        ],
    });
}
