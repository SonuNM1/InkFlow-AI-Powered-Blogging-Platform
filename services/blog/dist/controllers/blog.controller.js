import { sql } from "../utils/db.js";
import { redisClient } from "../utils/redis.js";
import TryCatch from "../utils/TryCatch.js";
import axios from "axios";
export const getAllBlogs = TryCatch(async (req, res) => {
    const { searchQuery = "", category = "" } = req.query;
    const cacheKey = `blogs:${searchQuery}:${category}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
        console.log("Serving from Redis cache");
        return res.json(JSON.parse(cached));
    }
    let blogs;
    if (searchQuery && category) {
        blogs = await sql `
        SELECT * FROM blogs WHERE (title ILIKE ${"%" + searchQuery + "%"} OR description ILIKE ${"%" + searchQuery + "%"}) AND category=${category} ORDER BY create_at DESC
    `;
    }
    else if (searchQuery) {
        blogs = await sql `
        SELECT * FROM blogs WHERE (title ILIKE ${"%" + searchQuery + "%"} OR description ILIKE ${"%" + searchQuery + "%"}) ORDER BY create_at DESC
    `;
    }
    else if (category) {
        blogs = await sql `
        SELECT * FROM blogs WHERE category=${category} ORDER BY create_at DESC
    `;
    }
    else {
        blogs = await sql `
        SELECT * FROM blogs ORDER BY create_at DESC
    `;
    }
    console.log("Serving from DB");
    await redisClient.set(cacheKey, JSON.stringify(blogs), { EX: 3600 });
    res.json(blogs);
});
export const getSingleBlog = TryCatch(async (req, res) => {
    const blogId = req.params.id;
    const cacheKey = `blog:${blogId}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
        console.log("Serving single blog from Redis cache");
        return res.json(JSON.parse(cached));
    }
    // Fetch blog from PostgreSQL 
    const blog = await sql `
        SELECT * FROM blogs WHERE id=${blogId}
    `;
    if (blog.length === 0) {
        return res.status(404).json({
            message: "No blog with this id"
        });
    }
    // Blog not found - 404 
    if (!blog.length) {
        return res.status(404).json({
            message: "Blog not found"
        });
    }
    // Call USER SERVICE to get author info
    const { data } = await axios.get(`${process.env.USER_SERVICE}/api/v1/user/${blog[0]?.author}`);
    const responseData = {
        blog: blog[0],
        author: data
    };
    await redisClient.set(cacheKey, JSON.stringify(responseData), {
        EX: 3600
    });
    // Send combined response 
    res.json(responseData);
});
// 2.53
//# sourceMappingURL=blog.controller.js.map