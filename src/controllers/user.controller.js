import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";

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