import express from "express"
import { addComment, deleteComment, getAllBlogs, getAllComment, getSavedBlog, getSingleBlog, savedBlog } from "../controllers/blog.controller.js";
import { isAuth } from "../middleware/isAuth.js";

const router = express.Router()

router.get("/blog/all", getAllBlogs)
router.get("/blog/:id", getSingleBlog)

router.post("/comment/:id", isAuth, addComment) ; 
router.get("/comments/:id", getAllComment)
router.delete("/comments/:commentid", isAuth, deleteComment)
router.post("/save/:blogid", isAuth, savedBlog)
router.get("/blog/saved/all", isAuth, getSavedBlog)

export default router ; 