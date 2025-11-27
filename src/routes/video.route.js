import express from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { deleteVideo, getAllVideos, getVideoById, updateThumbnail, updateVideoDetails, uploadVideo } from "../controllers/video.controller.js"
import { upload } from '../middlewares/multer.middleware.js'

const router = express.Router()

router.get("/", getAllVideos)
router.post("/upload", verifyJWT, upload.fields([
    {
        name: "video", maxCount: 1
    },
    {
        name: "thumbnail", maxCount: 1
    }
]) , uploadVideo)

router.get("/:videoId", getVideoById)
router.patch("/update/:videoId", verifyJWT, updateVideoDetails)
router.patch("/update-thumbnail/:videoId", verifyJWT, upload.single("thumbnail") ,updateThumbnail)
router.delete("/delete/:videoId", verifyJWT, deleteVideo)

export default router