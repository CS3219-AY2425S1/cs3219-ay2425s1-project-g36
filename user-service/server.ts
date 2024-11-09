import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import connectMongoDB from './db/connectDB';
import { PORT } from './utils/config';
import authenticationRoute from './src/routes/authenticationRoute';
import userRoute from './src/routes/userRoute';

const app: Application = express();
const port: string | number  = PORT;

// test
app.get('/', (req: Request, res: Response) => {
    res.send({
        message: "Test root"
    })
})

const corsOptions = {
    // origin: 'http://localhost:5173',
    origin: 'http://35.247.176.23:5173',
    credentials: true // allow for sending JWT cookies
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

