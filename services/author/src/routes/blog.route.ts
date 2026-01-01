import express from "express" ; 
import { isAuth } from "../middlewares/isAuth.js";
import uploadFile from "../middlewares/multer.js";
import { AIBlogResponse, AIDescriptionResponse, AITitleResponse, createBlog, deleteBlog, updateBlog } from "../controllers/blog.controller.js";
import { aiRateLimiter } from "../utils/rateLimit.js";

const router = express() ; 

router.post("/blog/new", isAuth, uploadFile, createBlog)
router.post("/blog/:id", isAuth, uploadFile, updateBlog)
router.delete("/blog/:id", isAuth, deleteBlog)

router.post("/ai/title", aiRateLimiter, AITitleResponse)
router.post("/ai/description",  aiRateLimiter, AIDescriptionResponse)
router.post("/ai/blog", aiRateLimiter, AIBlogResponse)

export default router ; 