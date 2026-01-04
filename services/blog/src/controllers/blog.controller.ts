import type { AuthenticatedRequest } from "../middleware/isAuth.js";
import { sql } from "../utils/db.js";
import { redisClient } from "../utils/redis.js";
import TryCatch from "../utils/TryCatch.js";
import axios from "axios";

export const getAllBlogs = TryCatch(async (req, res) => {

  /*
  Pagination params from query

  page = current page number (default 1)
  limit = blogs per page (default 16)
  */

  const page = Number(req.query.page) || 1; 
  const limit = Number(req.query.limit) || 16; 

  // OFFSET formula for SQL pagination 

  const offset = (page - 1) * limit ; 

  // existing filters 
  
  const searchQuery = typeof req.query.searchQuery === "string" ? req.query.searchQuery : ""
  
  const category = typeof req.query.category === "string" ? req.query.category : "" ; 

  const normalizedSearch = searchQuery.trim().toLowerCase() ; 

  const shouldCache = normalizedSearch.length >= 2 || category ; 

  const cacheKey = `blogs:v1:${normalizedSearch || "all"}:${category || "all"}:page:${page}:limit:${limit}`;

  if(shouldCache){
    const cached = await redisClient.get(cacheKey) ; 

    if(cached){
      console.log("Serving from Redis cache") ; 
      return res.json(JSON.parse(cached)) ; 
    }
  }

  let blogs;

  if (searchQuery && category) {
    blogs = await sql`
        SELECT * FROM blogs WHERE (title ILIKE ${
          "%" + searchQuery + "%"
        } OR description ILIKE ${
      "%" + searchQuery + "%"
    }) AND category=${category} ORDER BY create_at DESC
    `;
  } else if (searchQuery) {
    blogs = await sql`
        SELECT * FROM blogs WHERE (title ILIKE ${
          "%" + searchQuery + "%"
        } OR description ILIKE ${
      "%" + searchQuery + "%"
    }) ORDER BY create_at DESC
    `;
  } else if (category) {
    blogs = await sql`
        SELECT * FROM blogs WHERE category=${category} ORDER BY create_at DESC
    `;
  } else {
    blogs = await sql`
        SELECT * FROM blogs ORDER BY create_at DESC
    `;
  }

  console.log("Serving from DB");

  if(shouldCache){
    await redisClient.set(
      cacheKey, 
      JSON.stringify(blogs), 
      {
        EX: 3600
      }
    )
  }

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

  const blog = await sql`
        SELECT * FROM blogs WHERE id=${blogId}
    `;

  if (blog.length === 0) {
    return res.status(404).json({
      message: "No blog with this id",
    });
  }

  // Blog not found - 404

  if (!blog.length) {
    return res.status(404).json({
      message: "Blog not found",
    });
  }

  // Call USER SERVICE to get author info

  const { data } = await axios.get(
    `${process.env.USER_SERVICE}/api/v1/user/${blog[0]?.author}`
  );

  const responseData = {
    blog: blog[0],
    author: data,
  };

  await redisClient.set(cacheKey, JSON.stringify(responseData), {
    EX: 3600,
  });

  // Send combined response

  res.json(responseData);
});

export const addComment = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { id: blogid } = req.params;
  const { comment } = req.body;

  if (!req.user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const {userId, name} = req.user ; 

  await sql`
    INSERT INTO comments (comment, blogid, userid, username)
    VALUES (${comment}, ${blogid}, ${req.user.userId}, ${req.user.name}) RETURNING *
  `;

  res.json({ message: "Comment added" });
});

export const getAllComment = TryCatch(async (req, res) => {
  const { id } = req.params;

  const comments =
    await sql`SELECT * FROM comments WHERE blogid=${id} ORDER BY create_at DESC`;

  res.json(comments);
});

export const deleteComment = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const { commentId } = req.params;

    // what backend received 

    console.log("Deleting comment id: ", commentId) ; 
    console.log("Auth user from JWT: ", req.user)

    const comments = await sql`SELECT * FROM comments WHERE id=${commentId}`;

    // what db returned 

    console.log("comment from db: ", comments)

    if(comments.length === 0){
      return res.status(404).json({
        message: "Comment not found"
      })
    }

    const comment = comments[0] ; 

    console.log("Comment owner userID: ", comment?.userid) ;
    console.log("logged in user: ", req.user?.userId)

    if (comment?.userid !== req.user?.userId) {
      res.status(401).json({
        message: "You are not owner of this comment",
      });
      return;
    }

    await sql`DELETE FROM comments WHERE id = ${commentId}`;

    res.json({
      message: "Comment deleted",
    });
  }
);

export const savedBlog = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { blogid } = req.params;
  const userid = req.user?.userId;

  if (!blogid || !userid) {
    res.status(400).json({
      message: "Missing blog id or user id",
    });
    return;
  }

  const existing =
    await sql`SELECT * FROM savedblogs WHERE userid=${userid} AND blogid=${blogid}`;

  if (existing.length === 0) {
    await sql`INSERT INTO savedblogs (blogid, userid) VALUES (${blogid}, ${userid})`;

    res.json({
      message: "Blog saved",
    });
    return;
  } else {
    await sql`DELETE FROM savedblogs WHERE userid=${userid} AND blogid=${blogid}`;

    res.json({
      message: "Blog Unsaved",
    });
    return;
  }
});

export const getSavedBlog = TryCatch(async (req: AuthenticatedRequest, res) => {
  const blogs =
    await sql`SELECT * FROM savedblogs WHERE userid = ${req.user?.userId}`;

  res.json(blogs);
});
