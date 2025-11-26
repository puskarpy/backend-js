import express from "express";
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { createTweet, deleteTweet, getUserTweet, updateTweet } from "../controllers/tweet.controller.js";

const router = express.Router()

router.post("/create",verifyJWT, createTweet )
router.patch("/update/:tweetId", verifyJWT, updateTweet)
router.delete("/delete/:tweetId", verifyJWT, deleteTweet)
router.get("/:userId", verifyJWT, getUserTweet)

export default router