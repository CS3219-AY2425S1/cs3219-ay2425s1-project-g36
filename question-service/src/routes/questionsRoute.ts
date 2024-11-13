// External libraries
import { Router, Request, Response } from "express";

// Internal project modules
import { Question } from "../models/questionModel";
import QUESTION_TOPICS from "../models/questionTopics";
import { parseQuestionId } from "../utils/parseQuestionId";

const router: Router = Router();

const DUPLICATE_KEY_ERROR_CODE = 11000;

/**
 * GET: Retrieve all questions.
 * 
 * @route GET /
 * @returns {Response} 200 - An array of questions sorted by ID.
 * @returns {Response} 500 - Internal server error.
 */
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

/**
 * GET: Retrieve all unique topics from the list of questions.
 * 
 * @route GET /topics
 * @returns {Response} 200 - An array of unique topics.
 */
router.get(
    "/topics",
    async (req: Request, res: Response): Promise<Response> => {
        return res.status(200).send(QUESTION_TOPICS)
    }
);

/**
 * GET: Retrieve a specific question by ID.
 * 
 * @route GET /:id
 * @param {string} id - The unique identifier of the question.
 * @returns {Response} 200 - The question object.
 * @returns {Response} 400 - Invalid ID error.
 * @returns {Response} 404 - Question not found.
 * @returns {Response} 500 - Internal server error.
 */
router.get("/:id", async (req: Request, res: Response): Promise<Response> => {
    const id = parseQuestionId(req.params.id);

    if (isNaN(id)) {
        return res.status(400).send({
            message: `Invalid ID: ${req.params.id}. Please provide a valid number.`,
        });
    }

    try {
        const question = await Question.findOne({ _id: id });

        if (question === null) {
            return res.status(404).send({
                message: `Question of ID: ${id} does not exist in the database`,
            });
        }
        return res.status(200).send(question);
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            message: `Error retrieving question of ID: ${id}`,
        });
    }
});

/**
 * POST: Retrieve a random question based on specified difficulty and topic.
 * 
 * @route POST /filter
 * @param {string[]} difficulties - An array of difficulty levels to filter by.
 * @param {string[]} topics - An array of topics to filter by.
 * @returns {Response} 200 - Randomly selected question ID matching criteria.
 * @returns {Response} 404 - No questions found for the criteria.
 * @returns {Response} 500 - Internal server error.
 */
router.post('/filter', async (req: Request, res: Response) => {
    const { difficulties, topics } = req.body;

    // Parse comma-separated query strings into arrays if necessary
    const topicList = typeof topics === 'string' ? topics.split(',') : [];
    const difficultyList = typeof difficulties === 'string' ? difficulties.split(',') : [];
    try {
        // Query questions from MongoDB based on difficulty and topic criteria
        const questions = await Question.find({
            $and: [
                { topics: { $in: topicList } },               // Matches documents with specified topic
                { difficulty: { $in: difficultyList } }    // Matches documents with specified difficulty
            ]
        });

        // Randomly select a question ID from the queried results
        if (questions.length === 0) {
            return res.status(404).json({ message: "No questions found for the given criteria." });
        }

        // Select a random question from the list
        const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
        console.log("question", randomQuestion)
        res.status(200).json({ questionId: randomQuestion._id });
    } catch (error) {
        console.error("Error in route handler:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * POST: Create a new question.
 * 
 * @route POST /
 * @param {Object} question - Question data including title, difficulty, description, and topics.
 * @returns {Response} 200 - Question successfully created.
 * @returns {Response} 400 - Validation error or duplicate question title.
 * @returns {Response} 500 - Internal server error.
 */
router.post("/", async (req: Request, res: Response): Promise<Response> => {
    const question = req.body;
    if (!question.title || !question.difficulty || !question.description) {
        return res.status(400).send({
            message: "Title, difficulty, and description must not be empty",
        });
    }

    if (question.topics) {
        const invalidTopics = question.topics.filter((topic: string) => {
            return !QUESTION_TOPICS.includes(topic)
        })

        if (invalidTopics.length > 0) {
            return res.status(400).send({
                message: `Invalid topics provided: ${invalidTopics.join(", ")}. Allowed topics are: ${QUESTION_TOPICS.join(", ")}`
            })
        }
    }

    try {
        await Question.create(question);
        return res.status(200).send({
            message: "Question successfully created",
        });
    } catch (error: any) {
        console.log(error);
        if (error.code === DUPLICATE_KEY_ERROR_CODE) {
            return res.status(400).send({
                message: `A question with the title '${question.title}' already exists.`,
            });
        }
        return res.status(500).send({
            message: "Error creating question",
        });
    }
});

/**
 * PUT: Update a question identified by ID.
 * 
 * @route PUT /:id
 * @param {string} id - The unique identifier of the question.
 * @param {Object} question - Updated question data.
 * @returns {Response} 200 - Question successfully updated.
 * @returns {Response} 400 - Validation error or invalid ID.
 * @returns {Response} 404 - Question not found.
 * @returns {Response} 500 - Internal server error.
 */
router.put("/:id", async (req: Request, res: Response): Promise<Response> => {
    const id = parseQuestionId(req.params.id);
    const question = req.body;

    if (isNaN(id)) {
        return res.status(400).send({
            message: `Invalid ID: ${req.params.id}. Please provide a valid number.`,
        });
    }

    if (!question.title || !question.difficulty || !question.description) {
        return res.status(400).send({
            message: "Title, difficulty, and description must not be empty",
        });
    }

    if (question.topics) {
        const invalidTopics = question.topics.filter((topic: string) => {
            return !QUESTION_TOPICS.includes(topic)
        })

        if (invalidTopics.length > 0) {
            return res.status(400).send({
                message: `Invalid topics provided: ${invalidTopics.join(", ")}. Allowed topics are: ${QUESTION_TOPICS.join(", ")}`
            })
        }
    }

    try {
        const questionResponse = await Question.findByIdAndUpdate(id, question);

        if (questionResponse === null) {
            return res.status(404).send({
                message: `Question of ID: ${id} does not exist in the database`,
            });
        }

        return res.status(200).send({
            message: "Question successfully updated",
        });
    } catch (error: any) {
        console.log(error);
        if (error.code === DUPLICATE_KEY_ERROR_CODE) {
            return res.status(400).send({
                message: `A question with the title '${question.title}' already exists.`,
            });
        }
        return res.status(500).send({
            message: "Error editing question",
        });
    }
});

/**
 * DELETE: Deletes a specific question by ID.
 * 
 * @route DELETE /:id
 * @param {string} id - The unique identifier of the question.
 * @returns {Response} 200 - Question successfully deleted.
 * @returns {Response} 400 - Invalid ID error.
 * @returns {Response} 404 - Question not found.
 * @returns {Response} 500 - Internal server error.
 */
router.delete("/:id", async (req: Request, res: Response): Promise<Response> => {
    const id = parseQuestionId(req.params.id);

    if (isNaN(id)) {
        return res.status(400).send({
            message: `Invalid ID: ${req.params.id}. Please provide a valid number.`,
        });
    }

    try {
        const question = await Question.findByIdAndDelete(id);

        if (question === null) {
            return res.status(404).send({
                message: `Question of ID: ${id} does not exist in the database`,
            });
        }

        return res.status(200).send({
            message: `Successfully deleted question with ID: ${id}`,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            message: `Error deleting question of id: ${id}`,
        });
    }
});

export default router;
