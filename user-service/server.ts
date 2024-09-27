import express, { Application, Request, Response } from 'express'
import connectMongoDB from './db/connectDB';
import { PORT } from './utils/config'

const app: Application = express();
const port: string | number  = PORT;

app.get('/', (req: Request, res: Response) => {
    res.send({
        message: "hello world"
    })
})

app.listen(port, () => {
	console.log(`Server is running on port ${PORT}`);
    connectMongoDB();
});