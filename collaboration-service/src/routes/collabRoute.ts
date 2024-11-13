// External libraries
import axios from "axios";
import { Router, Request, Response } from "express";

// Internal project modules
import collabStore from '../utils/collabStore'
import { JDOODLE_CLIENT_ID, JDOODLE_CLIENT_SECRET_KEY } from "../../config";

const router = Router()

/**
 * Retrieves collaboration information for a specific user.
 * 
 * @route GET /:id
 * @param {string} id - User ID to retrieve collaboration details.
 * @returns {Response} 200 - Collaboration data found for user.
 * @returns {Response} 400 - Missing user ID in URL.
 * @returns {Response} 404 - User not found in collabStore.
 */
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

/**
 * Removes a user from the collabStore.
 * 
 * @route POST /remove/:id
 * @param {string} id - User ID to remove from collabStore.
 * @returns {Response} 200 - User removed successfully.
 * @returns {Response} 400 - Missing user ID in URL.
 * @returns {Response} 404 - User not found in collabStore.
 */
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

/**
 * Checks if a user is in the collabStore.
 * 
 * @route GET /in-store/:id
 * @param {string} id - User ID to check in collabStore.
 * @returns {Response} 200 - User is in collabStore.
 * @returns {Response} 400 - Missing user ID in URL.
 * @returns {Response} 404 - User not found in collabStore.
 */
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

/**
 * Updates the programming language for a user in the collabStore.
 * 
 * @route PUT /:id
 * @param {string} id - User ID to update.
 * @param {string} progLang - New programming language.
 * @returns {Response} 200 - User's programming language updated.
 * @returns {Response} 400 - Missing user ID in URL.
 * @returns {Response} 404 - User not found in collabStore.
 */
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

/**
 * Sends an API request to JDoodle to execute code in a sandboxed environment.
 * 
 * @route POST /run-code
 * @param {string} script - Code script to execute.
 * @param {string} stdin - Input for the code.
 * @param {string} language - Programming language.
 * @param {string} versionIndex - Version index of the language.
 * @returns {Response} 200 - Execution result from JDoodle.
 * @returns {Response} 500 - Internal server error or JDoodle error.
 */
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

/**
 * Checks the number of API calls made to JDoodle today.
 * JDoodle allows a maximum of 20 calls per day, reset at Singapore time 0800.
 * 
 * @route POST /check-credits-spent
 * @returns {Response} 200 - JDoodle credit usage data.
 * @returns {Response} 500 - Internal server error or JDoodle error.
 */
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