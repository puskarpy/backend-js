import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";

export const getChannelStats = asyncHandler( async(req, res) => {

    const allStats = await Video.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $facet:{
                videos: [
                    {
                        $sort: {
                            createdAt: -1
                        }
                    },
                    {
                        $lookup:{
                            from: "likes",
                            localField: "_id",
                            foreignField: "video",
                            as: "likes"
                        }
                    },
                    {
                        $addFields: {
                            likesCount: {
                                $size: "$likes"
                            }
                        }
                    },
                    {
                        $lookup: {
                            from:"subscriptions",
                            localField: "owner",
                            foreignField: "channel",
                            as:"subscribers"
                        },
                        $addFields: {
                            subscribersCount: {
                                $size: "$subscribers"
                            }
                        }
                    }
                ],
                totalVideos: [
                    {
                        $count: "total"
                    }
                ]
            }
        }
    ])

    if(!allStats){
        throw new ApiError(500, "Couldn't fetch stats.")
    }

   return res.status(200).json(
    new ApiResponse(
        200,
        allStats,
        "Stats fetched successfully."
    )
   )
} )