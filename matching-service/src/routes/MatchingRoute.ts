import { Router, Request, Response } from "express";
import { User, UserReadyState } from "../model/MatchingQueue";
import matchingManagerInstance from "../model/MatchingManager";

const router = Router();

/**
 * API for the frontend to start matching for a user.
 * 
 * Request body:
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
 * `200` if the start matching request is successful, and other error status code when there is an error when processing the request.
 * Response body:
 * A message in JSON of either `matching started` for a successful request or an error message when there is an error.
 * `{"message": "matching started"}`
 */
router.post("/start", async (req : Request, rsp : Response) => {
    const data = req.body;
    const user : User = {
        ...data,
        readyState: UserReadyState.Waiting,
        matchedUser: null
    }
    try {
        matchingManagerInstance.push(user);
    }
    catch(error : any) {
        return rsp.status(500).send({message: error.message});
    }
    return rsp.status(200).send({message: "matching started"});
});

/**
 * API for the frontend to check the matching state for a user.
 * This API will be requested by the frontend intermittently over certain intervals when the frontend is waiting for a match
 * 
 * Request body:
 * A JSON format contains the user's token
 * Example request body:
 * ```
 * {
 *     "userToken": "user-token-here"
 * }
 * ```
 * 
 * Response status:
 * `200` if the user's current matching status is still matching or have found a match, and other error status code when there is an error when processing the request.
 * Response body:
 * A message in JSON like:
 * `{"message": "matching"}`
 *  - If the user is still matching, the message should be `matching` and the frontend will continue waiting
 *  - If the user is matched to another user, the message should be `match found` and the frontend will automatically navigate to the "Get Ready" page
 *  - If any error happens, the message should be an error message, and the frontend will cancel waiting and automatically navigate to the "Matching Failed" page with the error massage
 */
router.post("/check_state", async (req : Request, rsp : Response) => {
    try {
        const { userToken } = req.body;
        if(!matchingManagerInstance.isUserInMatchingService(userToken)) {
            return rsp.status(400).send({message: "This user does not exist in the matching service."});
        }
        let isUserMatched = matchingManagerInstance.isUserMatched(userToken);
        if(!isUserMatched) {
            isUserMatched = matchingManagerInstance.tryMatchWith(userToken);
        }
        if(isUserMatched) {
            return rsp.status(200).send({message: "match found"});
        }
        return rsp.status(200).send({message: "matching"});
    }
    catch(error : any) {
        return rsp.status(500).send({message : error.message});
    }
});

/**
 * API for the frontend to notify the backend that a matching is cancelled.
 * The cancellation may happen when:
 *   - the user clicks the `Cancel matching` button
 *   - the user navigates away from the waiting page
 *   - the user navigates to the "Matching Failed" page after failed to get ready on time and after requesting `/ready_no`
 *   - a backend error happens and the frontend stops waiting for matching or waiting for the other user to get ready
 * 
 * Request body:
 * A JSON format contains the user's token
 * Example request body:
 * ```
 * {
 *     "userToken": "user-token-here",
 * }
 * ```
 * 
 * Response status:
 * `200` if the cancel matching request is successful, and other error status code when there is an error when processing the request.
 * Response body:
 * A message in JSON of either `success` for a successful request or an error message when there is an error.
 * `{"message": "success"}`
 */
router.post("/cancel", async (req : Request, rsp : Response) => {
    try {
        const { userToken } = req.body;
        matchingManagerInstance.removeUser(userToken);
        return rsp.status(200).send({message: "success"});
    }
    catch(error : any) {
        return rsp.status(500).send({message : error.message});
    }
});

/**
 * API for the frontend to notify the backend when a user is ready
 * 
 * Request body:
 * A JSON format contains the user's token
 * Example request body:
 * ```
 * {
 *     "userToken": "user-token-here",
 * }
 * ```
 * 
 * Response status:
 * `200` if the get ready request is successful, and other error status code when there is an error when processing the request.
 * Response body:
 * A message in JSON of either `success` for a successful request or an error message when there is an error.
 * `{"message": "success"}`
 */
router.post("/ready/yes" , async (req : Request, rsp : Response) => {
    try {
        const { userToken } = req.body;
        if(!matchingManagerInstance.isUserInMatchingService(userToken)) {
            return rsp.status(400).send({message: "This user does not exist in the matching service."});
        }
        matchingManagerInstance.setReadyState(userToken, UserReadyState.Ready);
        return rsp.status(200).send({message: "success"});
    }
    catch(error : any) {
        return rsp.status(500).send({message : error.message});
    }
});

/**
 * API for the frontend to notify the backend that a a user failed to get ready in time (after the countdown timer expires)
 *  
 * Request body:
 * A JSON format contains the user's token
 * Example request body:
 * ```
 * {
 *     "userToken": "user-token-here",
 * }
 * ```
 * 
 * Response status:
 * `200` if the cancel matching request is successful, and other error status code when there is an error when processing the request.
 * Response body:
 * A message in JSON of either "success" for a successful request or an error message when there is an error.
 * `{"message": "success"}`
 */
router.post("/ready/no" , async (req : Request, rsp : Response) => {
    try {
        const { userToken } = req.body;
        if(!matchingManagerInstance.isUserInMatchingService(userToken)) {
            return rsp.status(400).send({message: "This user does not exist in the matching service."});
        }
        matchingManagerInstance.setReadyState(userToken, UserReadyState.NotReady);
        return rsp.status(200).send({message: "success"});
    }
    catch(error : any) {
        return rsp.status(500).send({message : error.message});
    }
});

/**
 * API for the frontend to check whether the other user in the match is ready or not
 * This API will be requested by the frontend intermittently over certain intervals when the frontend is waiting for the other user to get ready
 *  
 * Request body:
 * A JSON format contains the user's token
 * Example request body:
 * ```
 * {
 *     "userToken": "user-token-here",
 * }
 * ```
 * 
 * Response status:
 * `200` if the check ready state request is successful, and other error status code when there is an error when processing the request.
 * Response body:
 * A message in JSON:
 *  - If the other user is not ready and is still waiting for he/she to get ready, the message should be `waiting` and the frontend will continue waiting
 *  - If the other user is ready, the message should be `ready` and the frontend will automatically navigate to the "Collaboration" page
 *  - If the other user failed to get ready in time (after the get ready timer expires), the message should be `not ready` and the frontend will automatically retry matching.
 *  - If any error happens, the message should be an error message, and the frontend will cancel waiting and automatically navigate to the "Matching Failed" page with the error massage
 * `{"message": "success"}`
 */
router.post("/ready/check_state" , async (req : Request, rsp : Response) => {
    const MESSAGE_READY = "ready";
    const MESSAGE_NOT_READY = "not ready";
    const MESSAGE_WAITING = "waiting";
    try {
        const { userToken } = req.body;
        if(!matchingManagerInstance.isUserInMatchingService(userToken)) {
            return rsp.status(400).send({message: "This user does not exist in the matching service."});
        }
        const peerReadyState = matchingManagerInstance.getPeerReadyState(userToken);
        if(peerReadyState === UserReadyState.NotReady) {
            matchingManagerInstance.dismissMatchedUsersAfterNotGettingReady(userToken);
        }
        const message = peerReadyState === UserReadyState.Ready ? MESSAGE_READY : peerReadyState === UserReadyState.NotReady ? MESSAGE_NOT_READY : MESSAGE_WAITING;
        return rsp.status(200).send({message: message});
    }
    catch(error : any) {
        return rsp.status(500).send({message : error.message});
    }
});


export default router;