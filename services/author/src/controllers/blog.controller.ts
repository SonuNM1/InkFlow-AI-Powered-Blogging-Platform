import TryCatch from "../utils/TryCatch.js";
import type { AutheticatedRequest } from "../middlewares/isAuth.js";
import getBuffer from "../utils/dataUri.js";
import cloudinary from "cloudinary";
import { sql } from "../utils/db.js";
import { invalidateCacheJob } from "../utils/RabbitMQ.js";

export const createBlog = TryCatch(async (req: AutheticatedRequest, res) => {
  const { title, description, blogcontent, category } = req.body;

  const file = req.file;

  if (!file) {
    return res.status(400).json({
      message: "No file to upload",
    });
  }

  const fileBuffer = getBuffer(file); // convert buffer -> base64

  if (!fileBuffer || !fileBuffer.content) {
    return res.status(400).json({
      message: "Failed to generate buffer",
    });
  }

  // upload to cloudinary

  const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
    folder: "blogs",
  });

  // Insert blog into PostgreSQL

  const result = await sql`
        INSERT INTO blogs (
            title, 
            description, 
            image, 
            blogcontent, 
            category, 
            author
        ) VALUES (
            ${title}, 
            ${description}, 
            ${cloud.secure_url}, 
            ${blogcontent}, 
            ${category}, 
            ${req.userId}
        ) RETURNING *
        `;

      await invalidateCacheJob(["blogs:*"]) ; // invalidate 

  res.json({
    message: "Blog created",
    blog: result[0],
  });
});

export const updateBlog = TryCatch(async (req: AutheticatedRequest, res) => {
  const { id } = req.params;
  const { title, description, blogcontent, author, category } = req.body;

  const file = req.file;

  const blog = await sql`
        SELECT * FROM blogs WHERE id = ${id}
    `;

  if (!blog.length) {
    return res.status(404).json({
      message: "No blog with this id",
    });
  }

  if (blog[0].author !== req.userId) {
    return res.status(404).json({
      message: "You are not author of this blog",
    });
  }

  let imageUrl = blog[0].image;

  if (file) {
    const fileBuffer = getBuffer(file);

    if (!fileBuffer || !fileBuffer.content) {
      return res.status(400).json({
        message: "Failed to generate buffer",
      });
    }

    const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
      folder: "blogs",
    });

    imageUrl = cloud.secure_url;
  }

  const updatedBlog = await sql`
    UPDATE blogs SET 
        title=${title || blog[0].title},
        description=${description || blog[0].description},
        image=${imageUrl},
        blogcontent=${blogcontent || blog[0].blogcontent},
        category=${category || blog[0].category}

        WHERE id=${id}
        RETURNING *
  `;

  await invalidateCacheJob(["blogs:*", `blog:${id}`]) ; // invalidate 

  res.json({
    message: "Blog updated",
    blog: updatedBlog[0],
  });
});

export const deleteBlog = TryCatch(async (req: AutheticatedRequest, res) => {
  const blog = await sql`
    SELECT * FROM blogs WHERE id=${req.params.id}
  `;

  if (!blog.length) {
    return res.status(404).json({
      message: "No blog with this id",
    });
  }

  if (blog[0].author !== req.userId) {
    return res.status(404).json({
      message: "You are not author of this blog",
    });
  }

  await sql`
    DELETE FROM savedblogs WHERE blogid=${req.params.id}
  `

  await sql`
    DELETE FROM comments WHERE blogid=${req.params.id}
  `

  await sql`
    DELETE FROM blogs WHERE id=${req.params.id}
  `

  await invalidateCacheJob(["blogs:*", `blog:${req.params.id}`]) ; // invalidate 

  res.json({
    message: "Blog deleted"
  })

});
