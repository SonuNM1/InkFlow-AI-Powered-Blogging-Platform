import { sql } from "../utils/db.ts";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
// Resolving __dirname in ESM 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Read blogs.json manually (ESM-safe)
const blogsPath = path.join(__dirname, "blogs.json");
const blogs = JSON.parse(fs.readFileSync(blogsPath, "utf-8"));
async function seedBlogs() {
    for (const blog of blogs) {
        await sql `
            INSERT INTO blogs (
                title, 
                description, 
                blogcontent, 
                image, 
                category, 
                author
            ) VALUES (
                ${blog.title},
                ${blog.description},
                ${blog.blogcontent},
                ${blog.image},
                ${blog.category},
                ${blog.author}
            )
        `;
    }
    console.log("Blogs seeded successfully");
    process.exit(0);
}
seedBlogs();
//# sourceMappingURL=seedBlogs.js.map