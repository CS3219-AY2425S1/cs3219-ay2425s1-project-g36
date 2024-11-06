import { Router, Request, Response } from "express";
import { sendQueueingMessage, sendConfirmationMessage } from "../controllers/matchingController";
import userStore from "../utils/userStore";


const router = Router();

/**
 * Dummy API to test if matching-service is running
 */
router.get("/", async (req : Request, res : Response) => {
    return res.status(200).send({message: "Matching service is running"});
});

/**
 * Start the matching process for the user. 
 * 
 * Request body should contain the following fields:
 * A JSON format contains the user's id, the selected difficulties and the topics.
 * Example request body:
 * ```
 * {
 *     "id": "id",
 *     "difficulties": {
 *         "easy": true,
 *         "medium": true,
 *         "hard": false
 *     },
 *     "topics": ["DP", "Sorting"]
 * }
 * ```
 *
 * Response status:
 * - 200: Match found
 * - 408: No match found due to timeout
 * - 204: No match found
 * - 500: Failed to match user
 */
router.post("/start_matching", async (req : Request, res : Response) => {
    const data = req.body;
    const user = {
        id: data.id,
        email: data.email,
        difficulties: data.difficulties,
        topics: data.topics,
        progLangs: data.progLangs,
        isPeerReady: false,
        matchedUser: null,
        timeout: null,
        confirmationStatus: null,
        roomId: null
    }
    
    try {

        // Check if the user is already matching or matched
        if (userStore.hasUser(user.id)) {
            return res.status(409).send({message: "This user is already in matching queue."});
        }
        // Send the new user to the Kafka topic
        userStore.addUser(user.id, user);
        await sendQueueingMessage(user.id);
        
        return res.status(200).send({message: "Started Queueing User: " + user.email});

    }
    catch(error) {
        console.error("Error when trying to match:" + error);
        userStore.removeUser(user.id);
        return res.status(500).send({message: "Failed to match user."});
    }
});

/**
 * Check the matching state for the user
 * 
 * Request body should contain the user's id.
 * 
 * Response status:
 * - 200: Match found
 * - 202: Matching
 * - 400: User ID not found
 * - 400: User not found in the queue
 * - 500: Error checking match status
 */
router.post("/check_matching_state", async (req : Request, res : Response) => {
    try {
        const id = req.body.id;
        if (!id) {
            return res.status(400).send({message: "ID is not provided for checking matching status."});
        } 
        
        if (!userStore.hasUser(id)) {
            return res.status(400).send({message: "This user does not exist in the matching queue anymore. Please try matching again."});
        }
            
        const user = userStore.getUser(id);
        if(user!.matchedUser) {
            console.log('Status: Match found for user:', user?.email);
            return res.status(200).send({message: "match found"});
        } else {
            return res.status(202).send({message: "matching"});
        }

    }
    catch(error : any) {
        return res.status(500).send({message : error.message});
    }
});

/**
 * Cancel the matching process for the user
 * 
 * Request body should contain the user's token.
 * 
 * Response status:
 * - 200: User is removed from queue
 * - 400: User not found
 * - 500: Error cancelling matching
 */
router.post("/cancel", async (req : Request, res : Response) => {
    try {
        const userId = req.body.id;
        const user = userStore.getUser(userId);
        
        if (user) {
            // Send tombstone message to the Kafka topic to remove user from the queue
            await sendQueueingMessage(userId, true);
        } else {
            return res.status(400).send({ message: "User not found" });
        }

        return res.status(200).send({message: "Request to cancel matching is sent for User: " + user.email});
    }
    catch(error : any) {
        return res.status(500).send({message : error.message});
    }
});

/**
 * Confirm the match between both users
 * 
 * Request body should contain the user's token.
 * 
 * Response status:
 * - 200: Match confirmed
 * - 409: User not found
 * - 500: Error confirming match
*/
router.post("/confirm_match", async (req : Request, res : Response) => {
    
    const id = req.body.id;
    console.log("Confirming match for user:", id);

    try {
        const user = userStore.getUser(id);

        if (!user) {
            return res.status(409).send({ message: "User not found to confirm the match" });
        }

        const matchedUser = user.matchedUser;
        if (matchedUser) {
            // Check if the matched user is in the user store
            if (!userStore.hasUser(matchedUser.id)) {
                return res.status(409).send({ message: "No matched user found to confirm the match" });
            }
            // Send the confirmation to the Kafka topic
            await sendConfirmationMessage(user.id, matchedUser.id);
            return res.status(200).send({message: "Confirmation for user: " + user.email + " is sent."});
        } else {
            // User is not matched with anyone
            return res.status(409).send({message: "No matched user found to confirm the match"});
        }
        

    } catch (error) {
        console.error("Error confirming match:", error);
        return res.status(500).send({ message: "Error confirming match." });
    }
});

/**
 * Check the confirmation result for the user
 * 
 * Request body should contain the user's token.
 * 
 * Response status:
 * - 200: Match confirmed
 * - 202: Waiting for confirmation
 * - 400: User not found
 * - 400: Match declined
 * - 500: Error confirming match
*/
router.post("/check_confirmation_state", async (req : Request, res : Response) => {
    try {
        const id = req.body.id;
        if (!id) {
            return res.status(400).send({message: "ID is not provided for checking confirmation status."});
        } else {
            if(!userStore.hasUser(id)) {
                return res.status(400).send({message: "This user does not exist in the confirmation queue anymore. Please try matching again."});
            }
            
            const user = userStore.getUser(id);
            if (user!.confirmationStatus === "confirmed") {
                console.log('Status: Both users have confirmed, updating ', user?.email);
                userStore.removeUser(user!.id);
                return res.status(200).send({message: "Confirmed", roomId: user?.roomId});
            } else if (user!.confirmationStatus === "timeout") {
                // Do nothing.. ? user is already removed from user store in the timeout function
            } else if (user!.confirmationStatus === "declined") {
                // This should not happen, but just in case
                return res.status(400).send({message: "Confirmation declined " + user!.email});
            } else {
                return res.status(202).send({message: "Waiting for confirmation"});
            }
        }

    }
    catch(error : any) {
        return res.status(500).send({message : error.message});
    }
});


export default router;
