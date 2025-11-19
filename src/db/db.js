import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


export async function connectdb() {
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log("MONGODB CONNECTED.")
    } catch (error) {
        console.error("MongoDB connection failed : \n", error)
    }
}