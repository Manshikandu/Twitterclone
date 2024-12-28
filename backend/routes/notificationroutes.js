import express from "express";
import { protectRoute } from "../middleware/protectRoute.js"
import { getNotification } from "../controllers/notificationcontroller.js";
import { deleteNotifications } from "../controllers/notificationcontroller.js";

const router = express.Router()

router.get("/",protectRoute,getNotification)
router.delete("/",protectRoute,deleteNotifications)
export default router


