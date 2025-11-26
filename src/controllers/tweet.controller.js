import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Tweet } from "../models/tweet.model.js";
import mongoose from "mongoose";

export const createTweet = asyncHandler( async(req, res) => {
    const {content}= req.body
    if(!content){
        throw new ApiError(400,"Content is required.")
    }

    const tweet = await Tweet.create({
        content
    })

    if(!tweet){
        throw new ApiError(500, "Couldn't create a tweet.")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            tweet,
            "Tweet created successfully."
        )
    )
} )

export const updateTweet = asyncHandler( async(req, res) => {
    const {content} = req.body
    const {tweetId} = req.params

    if(!content){
        throw new ApiError(400, "Content is required.")
    }

    const updatedTweet = await Tweet.findOneAndUpdate({
        _id: tweetId,
        owner: req.user._id
    }, 
        {
        $set:{
            content: content,
        },
    },{
        new: true
    })

    if(!updatedTweet){
        throw new ApiError(500,"Couldn't update tweet.")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            updateTweet,
            "Tweet updated successfully."
        )
    )

} )

export const deleteTweet = asyncHandler( async(req, res) => {
    const {tweetId} = req.params

    const response = await Tweet.findOneAndDelete({
        _id: tweetId,
        owner: req.user._id
    })

    if(!response){
        throw new ApiError(500, "Couldn't delete tweet.")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            response,
            "Tweet deleted successfully."
        )
    )

} )

export const getUserTweet = asyncHandler( async(req, res) => {
    const { userId } = req.params

    const options = {
        page: Number(req.params.page) || 1,
        limit: Number(req.params.limit) || 10
    }

    const pipeline = Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project:{
                            fullName: 1,
                            avatar: 1,
                            username: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$owner"
        }
    ])

    const tweets = await Tweet.aggregatePaginate(pipeline, options)

    if(!tweets){
        throw new ApiError(500, "Couldn't fetch tweets")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            tweets,
            "Tweets fetched successfully."
        )
    )
} )