import express from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { uploadVideo } from "../controllers/video.controller.js"

const router = express.Router()

router.post("/upload", verifyJWT, uploadVideo)

export default router