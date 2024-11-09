import express, { Application, Request, Response } from "express";
import { PORT, QUESTION_SERVICE_MONGODB_URL } from "../config";
import cors from 'cors'
import questionsRoute from "./routes/questionsRoute";
import mongoose from "mongoose";

const app: Application = express();

app.use(express.json());

// enable CORS to allow frontend to access backend, as well as for
// communication between microservices
const corsOptions = {
    // origin: ['http://localhost:5173', 'http://localhost:3002'],
    origin: ['http://35.247.176.23:5173', 'http://35.198.205.238:3002'],
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions))

const port: number = PORT;

app.get("/", (req: Request, res: Response) => {
    console.log("good");
    res.send({
        message: "hello world",
    });
});

app.use("/questions", questionsRoute);

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
