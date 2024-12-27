import express from 'express'
import { protectRoute } from '../middleware/protectRoute.js';
import { createPost,deletePost,getUserPosts,likeUnlikePost } from '../controllers/postcontroller.js';
import { getAllPosts } from '../controllers/postcontroller.js';
import { getLikedPosts,getFollowingPosts } from '../controllers/postcontroller.js';
const router = express.Router()

router.get("/all",protectRoute,getAllPosts)
router.get("/likes/:id",protectRoute,getLikedPosts)
router.get("/following",protectRoute,getFollowingPosts)
router.get("/user/:username",protectRoute,getUserPosts)
router.post("/create",protectRoute,createPost)
 router.delete("/:id",protectRoute,deletePost)
 router.post("/like/:id",protectRoute,likeUnlikePost)
 //router.post("/comment/:id",protectRoute,commentOnPost)
// router.post("/create",protectRoute,createPost)
export default router;
