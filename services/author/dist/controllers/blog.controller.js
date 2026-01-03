import { TryCatch } from "../utils/TryCatch.js";
import getBuffer from "../utils/dataUri.js";
import cloudinary from "cloudinary";
import { sql } from "../utils/db.js";
import { invalidateCacheJob } from "../utils/RabbitMQ.js";
import openai from "../utils/openAi.js";
export const createBlog = TryCatch(async (req, res) => {
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
    const result = await sql `
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
            ${req.user?.userId}
        ) RETURNING *
        `;
    await invalidateCacheJob(["blogs:*"]); // invalidate
    res.json({
        message: "Blog created",
        blog: result[0],
    });
});
export const updateBlog = TryCatch(async (req, res) => {
    const { id } = req.params;
    const { title, description, blogcontent, author, category } = req.body;
    const file = req.file;
    const blog = await sql `
        SELECT * FROM blogs WHERE id = ${id}
    `;
    if (!blog.length) {
        return res.status(404).json({
            message: "No blog with this id",
        });
    }
    if (blog[0].author !== req.user?.userId) {
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
    const updatedBlog = await sql `
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
export const deleteBlog = TryCatch(async (req, res) => {
    const blog = await sql `
    SELECT * FROM blogs WHERE id=${req.params.id}
  `;
    if (!blog.length) {
        return res.status(404).json({
            message: "No blog with this id",
        });
    }
    if (blog[0].author !== req.user?.userId) {
        return res.status(404).json({
            message: "You are not author of this blog",
        });
    }
    await sql `
    DELETE FROM savedblogs WHERE blogid=${req.params.id}
  `;
    await sql `
    DELETE FROM comments WHERE blogid=${req.params.id}
  `;
    await sql `
    DELETE FROM blogs WHERE id=${req.params.id}
  `;
    await invalidateCacheJob(["blogs:*", `blog:${req.params.id}`]); // invalidate
    res.json({
        message: "Blog deleted",
    });
});
export const getMyBlogs = TryCatch(async (req, res) => {
    // Safety check - auth middleware should already set this 
    if (!req.user?.userId) {
        return res.status(401).json({
            message: "Unauthorized. Kindly login to proceed!"
        });
    }
    // Query only essential fields (fast + optimized for profile page)
    const blogs = await sql `
      SELECT id, title, description, image, category, create_at FROM blogs WHERE author = ${req.user.userId} ORDER BY create_at DESC
    `;
    res.json({
        count: blogs.length,
        blogs,
    });
});
export const AITitleResponse = TryCatch(async (req, res) => {
    // Extract input sent from frontend. Example: "this is my title"
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({
            message: "Title is required",
        });
    }
    // Feature flag (production safety)
    if (process.env.AI_ENABLED === "false") {
        return res.status(503).json({
            message: "AI feature is currently disabled for cost saving.",
        });
    }
    // OpenAI request
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.2,
        messages: [
            {
                role: "system",
                content: "You are a grammar correction engine. Return only the corrected title.",
            },
            {
                role: "user",
                content: text,
            },
        ],
    });
    const result = completion.choices[0]?.message?.content;
    if (!result) {
        throw new Error("AI did not return any text");
    }
    // light cleanup
    const cleaned = result.replace(/\s+/g, " ").trim();
    // Log succcess
    await sql `
    INSERT INTO ai_usage (user_id, feature, status) VALUES (${req.user.userId}, 'TITLE', 'SUCCESS')
  `;
    res.status(200).json({
        title: cleaned,
    });
});
export const AIDescriptionResponse = TryCatch(async (req, res) => {
    const { title, description } = req.body; // extracting title and desc from req body
    if (!title && !description) {
        return res.status(400).json({
            message: "Title or description required",
        });
    }
    // Build prompt conditionally. If description is empty -> generate a new one, else -> fix grammar only
    const prompt = description === ""
        ? `
    Generate only one short blog description based on this title: "${title}". Your response must be only one sentence, strictly under 30 wordds, with no options, no greetings, and no extra text. Do not explain. Do not say 'here is'. Just return the description only.
  `
        : `Fix the grammar in the following blog description andn return only the corrected sentence. Do not add anything else: "${description}"`;
    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        temperature: 0.3,
        messages: [
            {
                role: "user",
                content: prompt,
            },
        ],
    });
    const result = completion.choices[0]?.message?.content;
    if (!result) {
        throw new Error("AI did not return any text");
    }
    await sql `
  INSERT INTO ai_usage (user_id, feature, status)
  VALUES (${req.user.userId}, 'DESCRIPTION', 'SUCCESS')
`;
    res.status(200).json({
        description: result.trim(),
    });
});
export const AIBlogResponse = TryCatch(async (req, res) => {
    const { blog } = req.body;
    if (!blog) {
        return res.status(400).json({
            message: "Blog content is required",
        });
    }
    // Instruction for AI: do not change HTML, only fix grammar, preserve tags and styles
    const prompt = `You will act as a grammar correction engine. I will provide you with blog content in rich HTML format (from Jodit Editor). Do not generate or rewrite the content with new ideas. Only correct grammatical, punctuation, and spelling errors while preserving all HTML tags and formatting. Maintain inline styles, image tags, line breaks, and structural tags exactly as they are. Return the full corrected HTML string as output.`;
    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        temperature: 0,
        messages: [
            {
                role: "system",
                content: prompt,
            },
            {
                role: "user",
                content: blog,
            },
        ],
    });
    const result = completion.choices[0]?.message?.content;
    if (!result) {
        throw new Error("AI did not return any response");
    }
    await sql `
  INSERT INTO ai_usage (user_id, feature, status)
  VALUES (${req.user.userId}, 'BLOG', 'SUCCESS')
`;
    res.status(200).json({
        html: result.trim(),
    });
});
/*
AI Feature:

Request comes in -> Build prompt -> Call Gemini API -> Clean response -> Send response -> END
*/
//# sourceMappingURL=blog.controller.js.map