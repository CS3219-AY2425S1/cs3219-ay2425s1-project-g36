import { Router, Request, Response } from "express";
import matchingQueueInstance from "../model/MatchingQueue";

const router = Router();


router.post("/start", async (req : Request, rsp : Response) => {
    const data = req.body;
    try {
        matchingQueueInstance.push(data);
    }
    catch(error : any) {
        return rsp.status(400).send({message: error.message});
    }
    return rsp.status(200).send({message: "matching started"});
});

router.post("/check_status", async (req : Request, rsp : Response) => {
    // TODO
    return rsp.status(200).send("todo");
})

export default router;