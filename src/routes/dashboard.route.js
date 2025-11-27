import express from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { getChannelStats } from '../controllers/dashboard.controller.js'

const router = express.Router()

router.get("/", verifyJWT, getChannelStats)

export default router