import express from "express";
import chalk from "chalk";
import dotenv from "dotenv";
import { sql } from "./utils/db.js";
import blogRoutes from './routes/blog.route.js'
import { v2 as cloudinary } from 'cloudinary';
import { connectRabbitMQ } from "./utils/RabbitMQ.js";
import cors from 'cors'

dotenv.config();
const app = express();

app.use(express.json()) ; 
app.use(cors()) ; 

connectRabbitMQ() ; 

const PORT = process.env.PORT || 5001;

cloudinary.config({ 
        cloud_name: process.env.CLOUD_NAME, 
        api_key: process.env.CLOUD_API_KEY, 
        api_secret: process.env.CLOUD_API_SECRET
    });

async function initDB() {
  try {
    await sql`
            CREATE TABLE IF NOT EXISTS blogs(
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL, 
                description VARCHAR(255) NOT NULL, 
                blogContent TEXT NOT NULL, 
                image VARCHAR(255) NOT NULL, 
                category VARCHAR(255) NOT NULL, 
                author VARCHAR(255) NOT NULL, 
                create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
    await sql`
            CREATE TABLE IF NOT EXISTS comments(
                id SERIAL PRIMARY KEY,
                comment VARCHAR(255) NOT NULL, 
                userid VARCHAR(255) NOT NULL,
                username VARCHAR(255) NOT NULL, 
                blogId VARCHAR(255) NOT NULL,  
                create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
    await sql`
            CREATE TABLE IF NOT EXISTS savedBlogs(
                id SERIAL PRIMARY KEY,
                userid VARCHAR(255) NOT NULL,
                blogId VARCHAR(255) NOT NULL,  
                create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
      await sql`
        CREATE TABLE IF NOT EXISTS ai_usage (
          id SERIAL PRIMARY KEY, 
          user_id VARCHAR(255) NOT NULL, 
          feature VARCHAR(50) NOT NULL, 
          status VARCHAR(20) NOT NULL, 
          error_message TEXT, 
          create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
        )
      `

    console.log(chalk.yellow.bold("DB initialised successfully"));
  } catch (error) {
    console.log(chalk.red.bold("DB initialize error: ", error));
  }
}

app.use('/api/v1', blogRoutes)

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(chalk.blue.bold(`Server running on http://localhost:${PORT}`));
  });
});
