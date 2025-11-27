import express, { urlencoded } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import userRouter from './routes/user.route.js'
import commentRouter from './routes/comment.route.js'
import likeRouter from './routes/like.route.js'
import tweetRouter from './routes/tweet.route.js'
import videoRouter from './routes/video.route.js'
import dashboardRouter from './routes/dashboard.route.js'

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
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/dashboard", dashboardRouter)

app.get("/", (req, res) => {
    res.send("Hello World.")
})

export { app }