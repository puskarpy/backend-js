import express from 'express'
import { 
    changeCurrentPassword, 
    getCurrentUser, 
    getUserChannelProfile, 
    getWatchHistory, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    registerUser,
    updateUserAvatar,
    updateUserCoverImage,
    updateUserDetails, 
    } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post("/register", upload.fields([{
    name : "avatar",
    maxCount: 1
},
{
    name: "coverImage",
    maxCount: 1
}
]) ,registerUser)

router.post("/login", loginUser)

// Secure Routes
router.post("/logout", verifyJWT ,logoutUser)
router.post("/refresh-token", refreshAccessToken)
router.post("/change-password", verifyJWT, changeCurrentPassword)
router.get("/me", verifyJWT, getCurrentUser)
router.patch("/update-details", verifyJWT, updateUserDetails)
router.patch("/update-avatar", verifyJWT, upload.single("avatar") ,updateUserAvatar)
router.patch("/update-coverImage", verifyJWT, upload.single("coverImage") ,updateUserCoverImage)
router.get("/channels/:username", verifyJWT, getUserChannelProfile)
router.get("/watch-history", verifyJWT, getWatchHistory)


export default router