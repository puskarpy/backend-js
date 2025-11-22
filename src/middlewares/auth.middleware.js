import { ApiError } from "../utils/apiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from 'jsonwebtoken'
import { User } from "../models/user.models.js"

export const verifyJWT = asyncHandler( async(req, res, next ) => {
   try {
     const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
     if(!token){
     throw new ApiError(400, "Not Authorized")        
     }
 
     const decodedData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
 
     const user = await User.findById(decodedData._id).select("-password -refreshToken")
 
     if(!user) {
         throw new ApiError(400, "Invalid access token.")
     }
 
     req.user = user
     next()
   } catch (error) {
    throw new ApiError(400, "Access token error.")
   }
} )