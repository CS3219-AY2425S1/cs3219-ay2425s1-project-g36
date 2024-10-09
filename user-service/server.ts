import express, { Application, Request, Response } from 'express'
import connectMongoDB from './db/connectDB';
import { PORT } from './utils/config'
import authenticationRoute from './src/routes/authenticationRoute'
import userRoute from './src/routes/userRoute';
import cors from 'cors'
import cookieParser from "cookie-parser";

const app: Application = express();
const port: string | number  = PORT;

// test
app.get('/', (req: Request, res: Response) => {
    res.send({
        message: "hello world"
    })
})

const corsOptions = {
    origin: 'http://localhost:5173'
}

// middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions))
app.use(cookieParser());

// routes
app.use('/authentication', authenticationRoute)
app.use('/users', userRoute);

app.listen(port, () => {
    console.log(`Server is running on port ${PORT}`);
    connectMongoDB();
});

