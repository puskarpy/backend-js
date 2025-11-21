import { app } from './app.js'
import dotenv from 'dotenv'
import { connectdb } from "./db/db.js"

dotenv.config()

connectdb()
.then( () => {
    app.listen(process.env.PORT || 4000, () => console.log(`Server started at port ${process.env.PORT}`))
} )
.catch((err) => {
    console.log("MongoDB connection failed!!", err)
})
