// External libraries
import cors from "cors";
import express, { Application, Request, Response } from "express";
import mongoose from "mongoose";

// Internal project modules
import { PORT, QUESTION_SERVICE_MONGODB_URL } from "../config";
import questionsRoute from "./routes/questionsRoute";

const app: Application = express();

/**
 * Enable CORS (Cross-Origin Resource Sharing) to allow requests from specified origins.
 * This is necessary to allow frontend applications and microservices to communicate with this service.
 */
const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:3002'],
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

/**
 * GET /
 * 
 * Root endpoint for testing server availability.
 * Responds with a JSON object containing a welcome message.
 * 
 * @param {Request} req - The incoming request object.
 * @param {Response} res - The response object to send back the welcome message.
 * 
 * @returns {Response} - Returns a JSON response with a message.
 */
app.get("/", (req: Request, res: Response) => {
    console.log("good");
    res.send({
        message: "hello world",
    });
});

// Middlewares
app.use(express.json());

app.use(cors(corsOptions))

// Question service routes
app.use("/questions", questionsRoute);

// Connect to MongoDB and start the server
mongoose
    .connect(QUESTION_SERVICE_MONGODB_URL)
    .then(() => {
        console.log("MongoDB URL: ", QUESTION_SERVICE_MONGODB_URL);
        console.log("App connected to database");
        app.listen(PORT, () => {
            console.log(`App is listening to port: ${PORT}`);
        });
    })
    .catch((error) => {
        console.log(error.message);
    });
