import express from "express";
import cors from "cors";
import { FRONTEND_ADDRESS, PORT } from "./config";
import MatchingRoute from "./routes/routes";
import { initializeConsumer, startConfirmation, startMatching } from "./controllers/matchingController";
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());
app.use(cookieParser());

const corsOptions = {
    origin: FRONTEND_ADDRESS,
    credentials: true
}
app.use(cors(corsOptions));

app.use("/matching", MatchingRoute);

const startServer = async () => {
    await initializeConsumer();
    startMatching();
    startConfirmation();

    app.listen(PORT, () => {
        console.log(`Server started. Port = ${PORT}`);
    });
};

startServer();

startServer();
