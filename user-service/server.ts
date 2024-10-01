import express, { Application, Request, Response } from 'express'
import connectMongoDB from './db/connectDB';
import { PORT } from './utils/config'
import authenticationRoute from './src/routes/authenticationRoute'
import cors from 'cors'

const app: Application = express();
const port: string | number  = PORT;

app.get('/', (req: Request, res: Response) => {
    res.send({
        message: "hello world"
    })
})

const corsOptions = {
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions))
app.use('/authentication', authenticationRoute)

app.listen(port, () => {
    console.log(`Server is running on port ${PORT}`);
    connectMongoDB();
});

