import dotenv from "dotenv";


dotenv.config({path: "./.env"});

if(!process.env.FRONTEND_ADDRESS) {
    process.env.FRONTEND_ADDRESS = "http://localhost:5173"
    console.warn("FRONTEND_ADDRESS is not defined in .env file. Using the default value " + process.env.FRONTEND_ADDRESS);
}
if(!process.env.PORT) {
    process.env.PORT = "5000"
    console.warn("PORT is not defined in .env file. Using the default value " + process.env.PORT);
}

export const FRONTEND_ADDRESS = process.env.FRONTEND_ADDRESS;
export const PORT = process.env.PORT;
