import { Router, Request, Response } from "express";
import { User } from "../model/MatchingQueue";
import matchingManagerInstance from "../model/MatchingManager";


const router = Router();

router.post("/start", async (req : Request, rsp : Response) => {
    const data = req.body;
    const user : User = {
        ...data,
        isReady: false,
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

export default router;