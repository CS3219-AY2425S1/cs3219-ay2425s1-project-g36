import { Router, Request, Response } from "express";
import { Question } from "../models/questionModel";

const router: Router = Router();

// retrieves entire list of questions
router.get("/", async (req: Request, res: Response): Promise<Response> => {
    try {
        const questions = await Question.find({}).sort({ _id: 1 });

        return res.status(200).send({
            length: questions.length,
            data: questions,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            message: "Error retrieving list of questions",
        });
    }
});

// retrieves a specific question by id
router.get("/:id", async (req: Request, res: Response): Promise<Response> => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).send({
            message: `Invalid id: ${req.params.id}. Please provide a valid number.`,
        });
    }

    try {
        const question = await Question.findOne({ _id: id });

        if (question === null) {
            return res.status(404).send({
                message: `Question of id: ${id} does not exist in the database`,
            });
        }
        return res.status(200).send(question);
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            message: `Error retrieving question of id: ${id}`,
        });
    }
});

// create a question
router.post("/", async (req: Request, res: Response): Promise<Response> => {
    const question = req.body;
    if (!question.title || !question.difficulty || !question.description) {
        return res.status(400).send({
            message: "Title, difficulty, and description must not be empty",
        });
    }

    try {
        await Question.create(question);
        return res.status(200).send({
            message: "Question successfully created",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            message: "Error creating question",
        });
    }
});

// updates a question, identifed by id
router.put("/:id", async (req: Request, res: Response): Promise<Response> => {
    const id = req.params.id;
    const question = req.body;
    if (!question.title || !question.difficulty || !question.description) {
        return res.status(400).send({
            message: "Title, difficulty, and description must not be empty",
        });
    }

    try {
        const questionResponse = await Question.findByIdAndUpdate(id, question);

        if (questionResponse === null) {
            return res.status(404).send({
                message: `Question of id: ${id} does not exist in the database`,
            });
        }

        return res.status(200).send({
            message: "Question successfully updated",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            message: "Error editting question",
        });
    }
});

// deletes a specific question by id
router.delete(
    "/:id",
    async (req: Request, res: Response): Promise<Response> => {
        const id = req.params.id;

        try {
            const question = await Question.findByIdAndDelete(id);

            if (question === null) {
                return res.status(404).send({
                    message: `Question of id: ${id} does not exist in the database`,
                });
            }

            return res.status(200).send({
                message: `Successfully delete question with id: ${id}`,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send({
                message: `Error deleting question of id: ${id}`,
            });
        }
    }
);

export default router;