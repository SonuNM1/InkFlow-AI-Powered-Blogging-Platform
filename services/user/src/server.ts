import express from "express";
import dotenv from "dotenv"
import connectDB from "./utils/db.js";
import chalk from "chalk";
import userRoutes from './routes/user.route.js'
import { v2 as cloudinary } from 'cloudinary';
import cors from 'cors'

dotenv.config() ; 

// cloudinary config 

cloudinary.config({ 
        cloud_name: process.env.CLOUD_NAME, 
        api_key: process.env.CLOUD_API_KEY, 
        api_secret: process.env.CLOUD_API_SECRET
    });

const app = express() ; 

app.use(express.json()) ; 
app.use(cors()) ; 

connectDB() ; 

// middleware 

app.use(express.json()) ; 

// routes 

app.use('/api/v1', userRoutes) ; 

const PORT = process.env.PORT || 5000 ; 

app.get("/", (req, res) => {
    res.json({
        message: "running"
    })
})

app.listen(PORT, () => {
    console.log(chalk.blue.bold(`Server running on http://localhost:${PORT}`))
})