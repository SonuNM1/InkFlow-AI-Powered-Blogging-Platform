import express from "express" ; 
import { isAuth } from "../middlewares/isAuth.js";
import uploadFile from "../middlewares/multer.js";
import { AIBlogResponse, AIDescriptionResponse, AITitleResponse, createBlog, deleteBlog, getMyBlogs, updateBlog } from "../controllers/blog.controller.js";
import { aiRateLimiter } from "../utils/rateLimit.js";

const router = express() ; 

router.post("/blog/new", isAuth, uploadFile, createBlog)
router.post("/blog/:id", isAuth, uploadFile, updateBlog)
router.delete("/blog/:id", isAuth, deleteBlog)
router.get("/my", isAuth, getMyBlogs)

router.post("/ai/title", isAuth, aiRateLimiter, AITitleResponse)
router.post("/ai/description", isAuth,  aiRateLimiter, AIDescriptionResponse)
router.post("/ai/blog", isAuth, aiRateLimiter, AIBlogResponse)

export default router ; 