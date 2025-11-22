import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"

export const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false})

        return { accessToken, refreshToken}
        
    } catch (error) {
        throw new ApiError(400, "Error generating Access and refresh token.")
    }
}

export const registerUser = asyncHandler( async(req, res) => {
    // Getting data from body
    const { fullName, email, username, password } = req.body


    // Data Validaition
    if(!fullName || !email || !username|| !password){
        throw new ApiError(400, "All Fields required.")
    }

    // Checking if user already exists
    const existingUser = await User.findOne({
        $or: [{username}, {email}]
    })
    if(existingUser){
        throw new ApiError(409, "User already exists.")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage && req.files.coverImage.length > 0)){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required.")
    }

    // Upload to cloudinary
   const avatarImage = await uploadOnCloudinary(avatarLocalPath)
   console.log(avatarImage)
   const coverImage = await uploadOnCloudinary(coverImageLocalPath)


   if(!avatarImage) {
    throw new ApiError(400, "Avatar Image is required")
   }

   // Create user
   const user = await User.create({
    fullName,
    email,
    password,
    username: username.toLowerCase(),
    avatar: avatarImage.url,
    coverImage: coverImage?.url || ""
   })

   const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
   )

   if(!createdUser){
    throw new ApiError(500, "Internal Server user.")
   }

   return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
   )

} )

export const loginUser = asyncHandler( async(req, res) => {

    const { username, email, password } = req.body;

    if(!(username || email || password)){
        throw new ApiError(400, "All fields required.")
    }

    const user = await User.findOne({
        $or:[{email}, {username}]
    })

    if(!user){
        throw new ApiError(404, "User not found.")
    }

    const passwordMatch = await user.isPasswordCorrect(password)
    if(!passwordMatch){
        throw new ApiError(404, "Invalid Credentials.")
    }

    const {accessToken, refreshToken} =await generateAccessAndRefreshToken(user._id)

    const loggedInuser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
            user : loggedInuser, accessToken, refreshToken,
            },
            "User logged in successfully."
        )
    )

} )

export const logoutUser = asyncHandler( async(req, res) => {
    const id = req.user._id
    await User.findByIdAndUpdate(id, {
        $set:{
            refreshToken: undefined
        }
    },
        {
            new: true
        })
            
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options)
    .json(
        new ApiResponse(
            200, {}, "User logged out."
        )
    )
})

export const refreshAccessToken = asyncHandler( async(req, res) => {
   try {
     const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken
 
     if(!incomingRefreshToken){
         throw new ApiError(400, "Unauthorized request.")
     }
 
     const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
     const user = await User.findById(decodedToken._id)
     if(!user){
         throw new ApiError(401, "Invalid Refresh Token.")
     }
 
     if(incomingRefreshToken !== user?.refreshToken){
         throw new ApiError(401, "Invalid or used Refresh Token.")
 
     }
 
     const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
 
     const options = {
         httpOnly: true,
         secure: true
     }
     return res.status(200)
     .cookie("accessToken", accessToken, options)
     .cookie("refreshToken", newRefreshToken, options)
     .json(
         new ApiResponse(
             200,
             {
                 accessToken,
                 refreshToken: newRefreshToken
             },
             "Access token refreshed"
         )
     )
   } catch (error) {
        throw new ApiError(400, error.message|| "Unauthorized.")
   }
} )