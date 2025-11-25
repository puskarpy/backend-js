import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Like } from "../models/like.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

export const toggleVideoLike = asyncHandler( async(req, res) => {
    const { videoId } = req.params

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    })

    if(existingLike){
        const toggleOff = await Like.findByIdAndDelete(existingLike._id)
        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    liked: false
                },
                "Like removed."
            )
        )
    }

    const like = await Like.create( {
        video: videoId,
        likedBy: req.user._id
    } )
    
    return res.status(200).json(
        new ApiResponse(
            200,
            {...like, liked: true },
            "Like added."
        )
    )
} )

export const toggleTweetLike = asyncHandler( async(req, res) => {
    const { tweetId } = req.params

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    })

    if(existingLike){
        const toggleOff = await Like.findByIdAndDelete(existingLike._id)
        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    liked: false
                },
                "Like removed."
            )
        )
    }

    const tweet = await Like.create( {
        tweet: tweetId,
        likedBy: req.user._id
    } )
    
    return res.status(200).json(
        new ApiResponse(
            200,
            {...tweet, liked: true },
            "Like added."
        )
    )
} )

export const toggleCommentLike = asyncHandler( async(req, res) => {
    const { commentId } = req.params

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    })

    if(existingLike){
        const toggleOff = await Like.findByIdAndDelete(existingLike._id)
        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    liked: false
                },
                "Like removed."
            )
        )
    }

    const comment = await Like.create( {
        comment: commentId,
        likedBy: req.user._id
    } )
    
    return res.status(200).json(
        new ApiResponse(
            200,
            {...comment, liked: true },
            "Like added."
        )
    )
} )

export const getLikedVideos = asyncHandler( async(req, res) => {
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user._id),
                video: {$exists: true, $ne: null}
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails",
            }
        },
        {
            $unwind: "$videoDetails"
        }
    ])

    if(!likedVideos){
        throw new ApiError(500, "Couldn't get liked videos.")
    }

    return res.status(200).json(
        200,
        likedVideos,
        "Liked videos fetched successfully."
    )
} )
