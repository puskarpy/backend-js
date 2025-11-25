import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Comment } from "../models/comment.model.js";
import mongoose from "mongoose";

export const addComment = asyncHandler( async(req, res) => {
    const { content } = req.body
    if(!content){
        throw new ApiError(400, "Comments can't be empty.")
    }
    const comment = await Comment.create({
        content
    })

    if(!comment){
        throw new ApiError(500, "Couldn't create a comment.")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            comment,
            "Comment created successfully."
        )
    )
} )

export const getCommentByVideoId = asyncHandler( async(req, res) => {

    const { videoId } = req.params

    const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
    }

    const pipeline = Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline:[
                    {
                        $project:{
                            "fullName": 1,
                            "avatar": 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$owner",
        },
        {
            $sort: {createdAt : -1}
        }
    ])

    const comments = await Comment.aggregatePaginate(pipeline, options)

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                comments: comments.docs,
                totalComments: comments.totalDocs,
                totalPages: comments.totalPages,
                currentPage: comments.page
            },
            "Comment fetched successfully"
        )
    )

} )

export const updateComment = asyncHandler( async(req, res) => {
    const {content} = req.body
    const {commentId} = req.params

    if(!content){
        throw new ApiError(400, "Content required.")
    }

    const updatedComment = await Comment.findByIdAndUpdate(commentId, 
        {
            $set:{
            content
        }},
        {
            new: true
        }
    )

    return res.status(200).json(
        new ApiResponse(
        200,
        updatedComment,
        "Comment updated."
    )
    )
} )

export const deleteComment = asyncHandler( async(req, res) => {
    const {commentId} = req.params

    const deletedComment = await Comment.findByIdAndDelete(commentId)

    if(!deletedComment){
        throw new ApiError(400, "Couldn't find error.")
    }

    return res.status(200, 
        new ApiResponse(
            200,
            deletedComment,
            "Comment deleted."
        )
    )
} )