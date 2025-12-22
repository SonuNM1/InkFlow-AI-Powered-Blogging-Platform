import express from "express";
import { getAllBlogs, getSingleBlog } from "../controllers/blog.controller.js";
const router = express.Router();
router.get("/blog/all", getAllBlogs);
router.get("/blog/:id", getSingleBlog);
export default router;
//# sourceMappingURL=blog.route.js.map