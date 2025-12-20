import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import uploadFile from "../middlewares/multer.js";
import { createBlog, updateBlog } from "../controllers/blog.controller.js";
const router = express();
router.post("/blog/new", isAuth, uploadFile, createBlog);
router.post("/blog/:id", isAuth, uploadFile, updateBlog);
export default router;
//# sourceMappingURL=blog.route.js.map