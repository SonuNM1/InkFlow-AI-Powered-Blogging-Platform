import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import uploadFile from "../middlewares/multer.js";
import { AIBlogResponse, AIDescriptionResponse, AITitleResponse, createBlog, deleteBlog, updateBlog } from "../controllers/blog.controller.js";
const router = express();
router.post("/blog/new", isAuth, uploadFile, createBlog);
router.post("/blog/:id", isAuth, uploadFile, updateBlog);
router.delete("/blog/:id", isAuth, deleteBlog);
router.post("/ai/title", AITitleResponse);
router.post("/ai/description", AIDescriptionResponse);
router.post("/ai/blog", AIBlogResponse);
export default router;
//# sourceMappingURL=blog.route.js.map