import express from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { addComment, deleteComment, getCommentByVideoId, updateComment } from '../controllers/comment.controller.js'

const router = express.Router()

router.post("/add-comment", verifyJWT, addComment)
router.patch("/:commentId", verifyJWT, updateComment )
router.delete("/:commentId", verifyJWT, deleteComment )
router.get("/video/:videoId", getCommentByVideoId)

export default router