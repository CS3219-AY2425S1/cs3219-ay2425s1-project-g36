import { User, hasCommonDifficulties } from "../model/user";
import { Kafka } from "kafkajs";
import { Queue } from "../model/queue";

const kafka = new Kafka({
    clientId: 'matching-service',
    brokers: ['localhost:9092'], // TODO: add to env variables
});


// Consumer related functions
const consumer = kafka.consumer({ groupId: "matching-service-group" });

const TIMEOUT_DURATION = 60000; // Timeout set for 1 minute
const CONFIRMATION_DURATION = 5000; // Confirmation timeout set for 10 seconds

/**
 * Checks if two users have common difficulties and topics
 * @param newUser The new user
 * @param user The user in the queue
 * @returns The user if they have common difficulties and topics, else null
 */
const findMatchingUser = (newUser: User, waitingQueue: Queue): User | null => {
    // Start from the back
    for (let i = 0; i < waitingQueue.count(); i++) {
        const user = waitingQueue.peek(i);

        // Avoid matching with itself
        if (newUser.userToken === user.userToken) {
            continue;
        }

        if (!hasCommonDifficulties(newUser, user)) {
            continue; 
        }

        if (newUser.topics.some(topic => user.topics.includes(topic))) {
            return user; 
        }
    }
    return null;
}

/**
 * Listens to the queue for new users. When a match is found, both users are notified.
 * Else, adds the new user to the waiting queue.
 * @param newUser Topics, difficulties, and user token
 * @param onResult Callback function to handle the result of the matching process
 */
export const startMatching = async () => {

    await consumer.connect();
    await consumer.subscribe({ topic: "user-matching", fromBeginning: true });
    const waitingQueue = new Queue();

    await consumer.run({
        eachMessage: async ({ message }) => {
            const newUser: User = JSON.parse(message.value!.toString());

            // Check if it is a tombstone message
            if (!newUser) {
                return;
            }

            const timeout = setTimeout(() => {
                if (newUser.matchedUser === null) {
                    console.log(`User ${newUser.userToken} has timed out and will be removed from the queue.`);
                    waitingQueue.removeUser(newUser); // Remove user from the queue

                    // Send message to notify user that no match was found
                    sendMatchResult(newUser.userToken, 'timeout');
                }
            }, TIMEOUT_DURATION);

            newUser.timeout = timeout;

            // Search for a matching user in the queue, starting from the oldest user
            const matchedUser = findMatchingUser(newUser, waitingQueue); 


            if (matchedUser) {
                console.log(`Matched user ${matchedUser.userToken} with ${newUser.userToken}`);

                matchedUser.matchedUser = newUser;
                newUser.matchedUser = matchedUser;

                // Clear timeout for both users
                clearTimeout(newUser.timeout);
                if (matchedUser.timeout) {
                    clearTimeout(matchedUser.timeout);
                }

                // Add new timeout for confirmation
                const confirmationTimeout = setTimeout(() => {
                    if (!newUser.isPeerReady || !matchedUser.isPeerReady) {
                        console.log("Match declined due to timeout.");
                        
                        // Notify that the confirmation has timed out
                        sendConfirmationResult(newUser.userToken, 'timeout');
                        sendConfirmationResult(matchedUser.userToken, 'timeout');

                        // Remove matched user field from both users
                        newUser.matchedUser = null;
                        matchedUser.matchedUser = null;
                    }
                }, CONFIRMATION_DURATION);
                newUser.timeout = confirmationTimeout;
                matchedUser.timeout = confirmationTimeout;


                // Notify both users that a match has been found
                sendMatchResult(newUser.userToken, 'matched');
                sendMatchResult(matchedUser.userToken, 'matched');
            } else { 
                waitingQueue.push(newUser);
                console.log(`User ${newUser.userToken} added to waiting list`);
            }
        }
    });
    
}


/**
 * Listens to the match-result topic for match outcomes and handles matched and timeout results
 * @param userToken The token of the user
 * @param onResult Callback function to handle the result of the matching process
 */
export const listenForMatchResult = async (
    userToken: string, 
    onResult: (result: 'matched' | 'timeout') 
=> void) => {
    
    await consumer.connect();
    await consumer.subscribe({ topic: 'match-result', fromBeginning: false });

    await consumer.run({
        eachMessage: async ({ message }) => {
            const receivedKey = message.key?.toString();
            const receivedValue = message.value?.toString();

            if (receivedKey === userToken) {
                const result = receivedValue;

                if (result === 'matched') {
                    onResult('matched');
                } else {
                    onResult('timeout');
                }
            }
        }
    });
}

// Check that both users have confirmed the match
export const startConfirmation = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'user-confirmation', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ message }) => {

            const user: User = JSON.parse(message.key!.toString());
            const matchedUser = JSON.parse(message.value!.toString());

            // Check if they are each other's matched user
            if (user.matchedUser === matchedUser && matchedUser.matchedUser === user) {

                // Since user is ready
                matchedUser.isPeerReady = true;

                // Check if matched user has confirmed
                if (user.isPeerReady) {
                    console.log(`Both users have confirmed the match.`);

                    // Clear the timeout for both users
                    clearTimeout(user.timeout!);
                    clearTimeout(matchedUser.timeout!);

                    // Notify both users that the match has been confirmed
                    sendConfirmationResult(user.userToken, 'confirmed');
                    sendConfirmationResult(matchedUser.userToken, 'confirmed');
                } else {
                    // Keep waiting
                    console.log(`User ${user.userToken} has confirmed the match.`);
                }

            } else {
                // Decline the match if the users are not supposed to be matched
                sendConfirmationResult(user.userToken, 'declined');
                sendConfirmationResult(matchedUser.userToken, 'declined');
            }

        }
    });

}


/**
 * Listens to the user-confirmation topic for user confirmations and handles confirmed matches
 * @param userToken1 The token of the first user
 * @param userToken2 The token of the second user
 * @param onResult Callback function to handle the result of the confirmation process
 */
export const listenForConfirmationResult = async (
    userToken: string, 
    onResult: (result: 'confirmed' | 'declined' | 'timeout') => void
) => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'confirmation-result', fromBeginning: false });

    await consumer.run({
        eachMessage: async ({ message }) => {
            const receivedKey = message.key?.toString();
            const receivedValue = message.value?.toString();

            if (receivedKey === userToken) {
                const result = receivedValue;

                if (result === 'confirmed') {
                    onResult('confirmed');
                } else if (result === 'declined') {
                    onResult('declined');
                } else {
                    onResult('timeout');
                }
            }
        }
    });
}




// Producer related functions
const producer = kafka.producer();

/**
 * Send a user selection message to the user-selection topic
 * @param user Topics, difficulties, and user token
 */
export const sendQueueingMessage = async (user: User, isCancel: boolean = false) => {
    await producer.connect();
    await producer.send({
        topic: 'user-matching',
        messages: [
            { key: user.userToken, value: isCancel ? null : JSON.stringify(user) },
        ],
    });
    await producer.disconnect();
}

/**
 * Send a match outcome to the match-result topic
 * @param userToken The token of the user
 * @param result The result of the match
 */
const sendMatchResult = async (userToken: string, result: string) => {
    await producer.connect();
    await producer.send({
        topic: 'match-result',
        messages: [
            { key: userToken, value: result },
        ],
    });
    await producer.disconnect();
}


/**
 * Send a user confirmation message to the user-confirmation topic
 * @param userToken1 The token of the first user
 * @param userToken2 The token of the second user
 */
export const sendConfirmationMessage = async (userToken: string, matchedUserToken: string) => {
    await producer.connect();
    await producer.send({
        topic: 'user-confirmation',
        messages: [
            { key: userToken, value: matchedUserToken },
        ],
    });
    await producer.disconnect();
}

/**
 * Send final match result to both users
 * @param userToken1 
 * @param userToken2 
 * @param result 
 */
export const sendConfirmationResult = async (userToken: string, result: string) => {
    await producer.connect();
    await producer.send({
        topic: 'confirmation-result',
        messages: [
            { key: userToken, value: result },
        ],
    });
    await producer.disconnect(); 
}