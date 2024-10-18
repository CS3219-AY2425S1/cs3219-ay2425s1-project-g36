import express from "express";
import cors from "cors";
import { FRONTEND_ADDRESS, PORT } from "./config";
import MatchingRoute from "./routes/MatchingRoute";

const app = express();

app.use(express.json());

const corsOptions = {
    origin: FRONTEND_ADDRESS
}
app.use(cors(corsOptions));

app.use("/matching", MatchingRoute);

app.listen(PORT, () => {
    console.log(`Server started. Port = ${PORT}`);
})

