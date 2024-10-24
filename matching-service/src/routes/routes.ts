import { Router, Request, Response } from "express";
import { sendQueueingMessage, } from "../controllers/matchingController";
import userStore from "../utils/userStore";


const router = Router();

/**
 * Start the matching process for the user. 
 * 
 * Request body should contain the following fields:
 * A JSON format contains the user's token, the selected difficulties and the topics.
 * Example request body:
 * ```
 * {
 *     "userToken": "user-token-here",
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
        userToken: req.cookies.jwt,
        difficulties: data.difficulties,
        topics: data.topics,
        isPeerReady: false,
        matchedUser: null,
        timeout: null
    }
    
    try {
        // Send the new user to the Kafka topic
        await sendQueueingMessage(user.userToken);
        userStore.addUser(user.userToken, user);

        // Listen to matching outcome
        // await listenForMatchResult(user.userToken, (result) => {
        //     if (result === 'matched') {
        //         return res.status(200).send({message: "Match found"});

        //     } else if (result === 'timeout') {
        //         userStore.removeUser(user.userToken);
        //         return res.status(408).send({message: "No match found due to timeout"});
        //     }
        // });
        return res.status(200).send({message: "Started Queueing"});

        // By default, no match is found
        userStore.removeUser(user.userToken);
        return res.status(204).send({message: "No match found"});
    }
    catch(error) {
        console.error("Error when trying to match:" + error);
        userStore.removeUser(user.userToken);
        return res.status(500).send({message: "Failed to match user."});
    }
});

router.post("/check_state", async (req : Request, rsp : Response) => {
    console.log("user cookies: " + req.cookies); // Log cookies to check
    console.log("user cookies jwt: " + req.cookies.jwt); // Log cookies to check
    try {
        const userToken = req.cookies.jwt;
        if (!userToken) {
            return rsp.status(400).send({message: "User token is not provided."});
        } else {
            console.log('User Token:', userToken);
            if(!userStore.hasUser(userToken)) {
                return rsp.status(400).send({message: "This user does not exist in the matching service."});
            }
            
            console.log('User Exists:', userStore.hasUser(userToken));
            const user = userStore.getUser(userToken);
            if(user!.matchedUser) {
                return rsp.status(200).send({message: "match found"});
            } else {
                return rsp.status(200).send({message: "matching"});
            }
        }

    }
    catch(error : any) {
        return rsp.status(500).send({message : error.message});
    }
});

// /**
//  * Confirm the match between both users
//  * 
//  * Request body should contain the user's token.
//  * 
//  * Response status:
//  * - 200: Match confirmed
//  * - 204: Confirmation timed out
//  * - 400: User not found
//  * - 400: Match declined
//  * - 500: Error confirming match
//  */
// router.post("/confirm_match", async (req : Request, res : Response) => {
//     const { userToken } = req.cookies.jwt;

//     try {
//         const user = userStore.getUser(userToken);

//         if (!user) {
//             return res.status(400).send({ message: "User not found" });
//         }

//         const matchedUser = user.matchedUser;
//         if (matchedUser) {
//             // Send the confirmation to the Kafka topic
//             await sendConfirmationMessage(user.userToken, matchedUser.userToken);

//             // Listen to the confirmation outcome
//             await listenForConfirmationResult(userToken, (result) => {
//                 // Remove user from userStore regardless of the outcome
//                 userStore.removeUser(userToken);

//                 if (result === 'confirmed') {
//                     return res.status(200).send({message: "Match confirmed"});

//                 } else if (result === 'declined') {
//                     // Not supposed to happen
//                     return res.status(204).send({message: "Match declined"});

//                 } else if (result === 'timeout') {
//                     return res.status(408).send({message: "Confirmation timed out"});
//                 }
//             });

//         }
//         // Time out match by default
//         return res.status(408).send({message: "Confirmation timed out"});

//     } catch (error) {
//         console.error("Error confirming match:", error);
//         return res.status(500).send({ message: "Error confirming match." });
//     }

// });

// /**
//  * Cancel the matching process for the user
//  * 
//  * Request body should contain the user's token.
//  * 
//  * Response status:
//  * - 200: User is removed from queue
//  * - 400: User not found
//  * - 500: Error cancelling matching
//  */
// router.post("/cancel", async (req : Request, res : Response) => {
//     try {
//         const { userToken } = req.cookies.jwt;
//         const user = userStore.getUser(userToken);
        
//         if (user) {
//             // Send tombstone message to the Kafka topic to remove user from the queue
//             await sendQueueingMessage(user.userToken, true);
//             userStore.removeUser(userToken);
//         } else {
//             return res.status(400).send({ message: "User not found" });
//         }

//         return res.status(200).send({message: "User is removed from queue"});
//     }
//     catch(error : any) {
//         return res.status(500).send({message : error.message});
//     }
// });

export default router;