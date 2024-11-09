import { Router, Request, Response } from "express";
import collabStore from '../utils/collabStore'
import axios from "axios";
import { JDOODLE_CLIENT_ID, JDOODLE_CLIENT_SECRET_KEY } from "../../config";

const router = Router()

// Retrieves the information of the collaboration
router.get("/:id", (req: Request, res: Response): any => {
    const id = req.params.id;
    if (id === null) {
        return res.status(400).send({
            message: "You need to put a user ID in the URL"
        })
    }

    const present = collabStore.hasUser(id)

    if (present) {
        const data = collabStore.getUser(id)
        return res.status(200).send({
            data: data,
            message: "The information of the collaboration is obtained"
        })
    }
    return res.status(404).send({
        message: "The user is not in the user store"
    })
}); 

// Removes user from collabStore
router.post("/remove/:id", (req: Request, res, Response): any => {
    const id = req.params.id;
    if (id === null) {
        return res.status(400).send({
            message: "You need to put a user ID in the URL"
        })
    }

    const present = collabStore.hasUser(id)

    if (present) {
        collabStore.removeUser(id)
        console.log('after removing user, the collabStore is:')
        collabStore.printContents()
        return res.status(200).send({
            message: `User ${id} is removed from collabStore`
        })
    }
    return res.status(404).send({
        message: `This user ${id} is not in the user store`
    })
})

// Checks if user is in collabStore
router.get("/in-store/:id", (req: Request, res: Response): any => {
    const id = req.params.id;

    if (id === null) {
        return res.status(400).send({
            message: "You need to put a user ID in the URL"
        })
    }

    const present = collabStore.hasUser(id)

    if (present) {
        return res.status(200).send({
            message: "User is in collab store"
        })
    }
    return res.status(404).send({
        message: "The user is not in the collab store"
    })
}); 

// update prog lang in collab store
router.put("/:id", (req: Request, res: Response): any => {
    const id = req.params.id;
    const { progLang } = req.body

    if (id === null) {
        return res.status(400).send({
            message: "You need to put a user ID in the URL"
        })
    }

    const present = collabStore.hasUser(id)

    if (!present) {
        return res.status(404).send({
            message: "The user is not in the collab store"
        })
    }

    collabStore.updateUserProgLang(id, progLang)

    console.log('after updating the user prog lang, the collab store is:')
    collabStore.printContents()

    return res.status(200).send({
        message: "Updated user's prog lang"
    })
}); 

// Sends API request to JDoodle to execute code in a sandboxed environment
router.post("/run-code", async (req: Request, res: Response): Promise<void> => {
    try {
        const { script, stdin, language, versionIndex } = req.body;

        console.log("sending API request to JDoodle");
        
        const response = await axios.post("https://api.jdoodle.com/v1/execute", {
            clientId: JDOODLE_CLIENT_ID,  
            clientSecret: JDOODLE_CLIENT_SECRET_KEY,
            script: script,             
            stdin: stdin,               
            language: language,         
            versionIndex: versionIndex
        }, {
            headers: { "Content-Type": "application/json" }
        });
        
        console.log("api request to JDoodle is successful")
        res.status(200).send(response.data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
})

// Checks how many API calls to JDoodle you have made today
// Note that in one day, you can make max 20 calls. Resets at Singapore time 0800
router.post('/check-credits-spent', async (req: Request, res: Response) => {
    const requestBody = {
        clientId: JDOODLE_CLIENT_ID,
        clientSecret: JDOODLE_CLIENT_SECRET_KEY
    }

    try {
        const response = await axios.post("https://api.jdoodle.com/v1/credit-spent", requestBody)
        res.status(200).send(response.data)
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
})

export default router