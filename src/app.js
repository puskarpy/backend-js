import express, { urlencoded } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import userRouter from './routes/user.route.js'
import commentRouter from './routes/comment.route.js'

const app = express()

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials: true,
}))

app.use(express.json({ limit: "16kb" }))
app.use(urlencoded({extended:true, limit: "16kb"}))
app.use(express.static("public"))

app.use(cookieParser())

// Router Middleware
app.use("/api/v1/users", userRouter)
app.use("/api/v1/comments", commentRouter)
app.get("/", (req, res) => {
    res.send("Hello World.")
})

export { app }