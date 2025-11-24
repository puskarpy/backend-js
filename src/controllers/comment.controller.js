import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Comment } from "../models/comment.model.js";

export const addComment = asyncHandler( async(req, res) => {
    const { content } = req.body
    if(!content){
        throw new ApiError(400, "Comments can't be empty.")
    }
    const comment = await Comment.create({
        content
    })
} )