import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { Video } from "../models/video.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

export const getAllVideos = asyncHandler( async(req, res) => {

    const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10
    }

    const pipeline = Video.aggregate([
        {
            $match:{}
        },
        {
            $sort:{
                createdAt : -1
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as:"owner"
            }
        },
        {
            $unwind: {
                path: "$owner", 
                preserveNullAndEmptyArrays: true
            }
        }
    ])

    const videos = await Video.aggregatePaginate( pipeline, options )

    return res.status(200).json(
        new ApiResponse(
            200,
            videos,
            "Videos fetched successfully."
        )
    )
} )

export const uploadVideo = asyncHandler( async(req, res) => {
    const {title, description} = req.body

    if(!title || !description){
        throw new ApiError(400, "All fields required.")
    }

    const videoLocalPath = req.files?.video[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if(!videoLocalPath || !thumbnailLocalPath){
        throw new ApiError(400, "All fields required.")
    }

    const video = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!video || !thumbnail){
        throw new ApiError(400, "All fields required.")
    }

    const newVideo = await Video.create({
        title,
        description,
        videoFile : {
            url: video,
            public_id: video.public_id
        },
        thumbnail: {
            url: thumbnail,
            public_id: thumbnail.public_id
        },
        duration: video.duration
    }) 

    if(!newVideo){
        throw new ApiError(500,"Couldn't upload video.")
    }

    return res.status(200).json(
        200,
        newVideo,
        "Video created successfully."
    )
} )

const getVideoById = asyncHandler( async(req, res) => {
    const video = await Video.findByIdAndUpdate(req.params.videoId).populate("owner", "fullName", "username", "avatar")
})