import TryCatch from "../utils/TryCatch.js";
import type { AutheticatedRequest } from "../middlewares/isAuth.js";
import getBuffer from "../utils/dataUri.js";
import cloudinary from "cloudinary";
import { sql } from "../utils/db.js";
import { invalidateCacheJob } from "../utils/RabbitMQ.js";
import { GoogleGenAI } from "@google/genai";

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

  await invalidateCacheJob(["blogs:*"]); // invalidate

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

  await invalidateCacheJob(["blogs:*", `blog:${id}`]); // invalidate

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
  `;

  await sql`
    DELETE FROM comments WHERE blogid=${req.params.id}
  `;

  await sql`
    DELETE FROM blogs WHERE id=${req.params.id}
  `;

  await invalidateCacheJob(["blogs:*", `blog:${req.params.id}`]); // invalidate

  res.json({
    message: "Blog deleted",
  });
});

export const AITitleResponse = TryCatch(async (req, res) => {
  const { text } = req.body;

  const prompt = `Correct the grammar of the following blog title and return only the corrected title without any additional text, formatting, or symbols: "${text}"`;

  let result;

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
  });

  async function main() {
    // Call Gemini-AI model

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    let rawtext = response.text; // safety extract text

    // Guard clause: AI returned nothing

    if (!rawtext) {
      res.status(400).json({
        message: "Something went wrong",
      });
      return;
    }

    // Cleaning AI response: AI often returns markdown like: **bold**, *italic*, `code`, ~strike~, newlines, etc. We want clean plain text for DB/UI usage

    const cleanedText = rawText
      .replace(/\*\*/g, "") // remove **bold**
      .replace(/\*/g, "") // remove *italic*
      .replace(/_/g, "") // remove _underscores_
      .replace(/`/g, "") // remove `code`
      .replace(/~/g, "") // remove ~strike~
      .replace(/\r?\n|\r/g, " ") // replace new lines with space
      .replace(/\s+/g, " ") // collapse multiple spaces
      .trim(); // remove leading/trailing spaces

      await main() ; 

      res.json(result) ; 
  }
});
