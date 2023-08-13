import dotenv from "dotenv"
dotenv.config()

export const mongoURL =
    process.env.NODE_ENV == "development"
        ? "mongodb://127.0.0.1:27017/worewolf"
        : (process.env.MONGO_URL as string)
