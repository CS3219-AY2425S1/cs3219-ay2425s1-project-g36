// External libraries
import cookieParser from 'cookie-parser';
import cors from "cors";
import express from "express";

// Internal project modules
import { FRONTEND_ADDRESS, PORT } from "./config";
import { initializeConsumer, startConfirmation, startMatching } from "./controllers/matchingController";
import MatchingRoute from "./routes/matchingRoute";

const app = express();
const corsOptions = {
    origin: FRONTEND_ADDRESS,
    credentials: true
}

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

// Matching route
app.use("/matching", MatchingRoute);

/**
 * Starts the server and initializes Kafka consumers for matching operations.
 * Listens for incoming connections on the specified PORT.
 */
const startServer = async () => {
    await initializeConsumer();
    startMatching();
    startConfirmation();

    app.listen(PORT, () => {
        console.log(`Server started. Port = ${PORT}`);
    });
};

startServer();
