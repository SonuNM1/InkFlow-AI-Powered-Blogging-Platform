import TryCatch from "../utils/TryCatch.js";
import getBuffer from "../utils/dataUri.js";
import cloudinary from "cloudinary";
import { sql } from "../utils/db.js";
import { invalidateCacheJob } from "../utils/RabbitMQ.js";
import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAI } from "@google/generative-ai";
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
            ${req.userId}
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
    if (blog[0].author !== req.userId) {
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
export const AITitleResponse = TryCatch(async (req, res) => {
    const { text } = req.body;
    const prompt = `Correct the grammar of the following blog title and return only the corrected title without any additional text, formatting, or symbols: "${text}"`;
    let result;
    const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
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
        await main();
        res.json(result);
    }
});
export const AIDescriptionResponse = TryCatch(async (req, res) => {
    const { title, description } = req.body;
    const prompt = description === ""
        ? `
    Generate only one short blog description based on this title: "${title}". Your response must be only one sentence, strictly under 30 wordds, with no options, no greetings, and no extra text. Do not explain. Do not say 'here is'. Just return the description only.
  `
        : `Fix the grammar in the following blog description andn return only the corrected sentence. Do not add anything else: "${description}"`;
    let result;
    const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
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
        await main();
        res.json(result);
    }
});
export const AIBlogResponse = TryCatch(async (req, res) => {
    const prompt = `You will act as a grammar correction engine. I will provide you with blog content in rich HTML format (from Jodit Editor). Do not generate or rewrite the content with new ideas. Only correct grammatical, punctuation, and spelling errors while preserving all HTML tags and formatting. Maintain inline styles, image tags, line breaks, and structural tags exactly as they are. Return the full corrected HTML string as output.`;
    const { blog } = req.body;
    if (!blog) {
        res.status(400).json({
            message: "Please provide blog",
        });
        return;
    }
    const fullMessage = `${prompt}\n\n${blog}`;
    const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = ai.getGenerativeModel({
        model: "gemini-1.5-pro",
    });
    const result = await model.generateContent({
        contents: [
            {
                role: "user",
                parts: [
                    {
                        text: fullMessage,
                    },
                ],
            },
        ],
    });
    const responseText = await result.response.text();
    const cleanedHtml = responseText
        .replace(/^(html|```html|```)\n?/i, "")
        .replace(/```$/i, "")
        .replace(/\*\*/g, "") // remove **bold**
        .replace(/\*/g, "") // remove *italic*
        .replace(/_/g, "") // remove _underscores_
        .replace(/`/g, "") // remove `code`
        .replace(/~/g, "") // remove ~strike~
        .replace(/\r?\n|\r/g, " ") // replace new lines with space
        .replace(/\s+/g, " ") // collapse multiple spaces
        .trim(); // remove leading/trailing spaces
    res.status(200).json({
        html: cleanedHtml
    });
});
//# sourceMappingURL=blog.controller.js.map