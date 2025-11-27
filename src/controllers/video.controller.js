import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { Video } from "../models/video.model.js"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"

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

export const getVideoById = asyncHandler( async(req, res) => {

    const {videoId} = req.params

    const video = await Video.findOne({
        _id:videoId
    }).populate("owner", "fullName", "username", "avatar")

    if(!video){
        throw new ApiError(500, "Couldn't find the video.")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            video,
            "Video found."
        )
    )
})

export const updateVideoDetails = asyncHandler( async(req, res) => {
    const {videoId} = req.params
    const {title, description } = req.body

    if(!title || !description){
        throw new ApiError(400, "Atleast one field is required.")
    }

    const updatedVideo = await Video.findByIdAndUpdate(videoId, {
        $set:{
            title, content
        }
    },
    {
        new: true
    })

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedVideo,
            "Video details updated successfully."
        )
    )
} )

export const deleteVideo = asyncHandler( async(req,res) => {
    const {videoId} = req.params

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video not found.")
    }
    
    if(video.videoFile?.public_id){
        await deleteFromCloudinary(video.videoFile.public_id)
    }

    if(video.thumbnail?.public_id){
        await deleteFromCloudinary(video.thumbnail.public_id)
    }

    await Video.findByIdAndDelete(videoId)

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Video deleted."
        )
    )
})

export const updateThumbnail = asyncHandler( async(req, res) =>{
    const newThumbnailPath = req.file?.path
    const {videoId} = req.params

    if(!newThumbnailPath){
        throw new ApiError(400, "Thumbnail image required.")
    }

    const newThumbnail = await uploadOnCloudinary(newThumbnailPath)

    if(!newThumbnail.url){
        throw new ApiError(400, "Thumbnail image required.")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video not found.")
    }

    if(video.thumbnail.public_id){
        await deleteFromCloudinary(video.thumbnail.public_id)
    }

    video.thumbnail = {
        url: newThumbnail.url,
        public_id: newThumbnail.public_id
    }

    const updatedVideo = await video.save()

    if(!updatedVideo){
        throw new ApiError(500, "Couldn't change thumbnail.")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedVideo,
            "Thumbnail updated successfully."
        )
    )

} )