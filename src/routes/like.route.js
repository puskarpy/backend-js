import express from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { toggleVideoLike, toggleTweetLike, toggleCommentLike, getLikedVideos } from '../controllers/like.controller.js'

const router = express.Router()

router.post("toggle/video/:videoId", verifyJWT, toggleVideoLike)
router.post("toggle/tweet/:tweetId", verifyJWT, toggleTweetLike)
router.post("toggle/comment/:commentId", verifyJWT, toggleCommentLike)
router.get("/likedVideos", verifyJWT, getLikedVideos)

export default router