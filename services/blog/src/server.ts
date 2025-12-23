import express from "express"
import dotenv from "dotenv"
import blogRoutes from './routes/blog.route.js'
import chalk from "chalk";
import "./utils/redis.js"
import { startCacheConsumer } from "./utils/Consumer.js";
import cors from 'cors'

dotenv.config() ; 

const app = express() ; 

app.use(express.json()) ; 
app.use(cors()) ; 

const PORT = process.env.PORT ; 

startCacheConsumer() ; 

app.use("/api/v1", blogRoutes)

app.listen(PORT, () => {
    console.log(chalk.blue.bold(`Blog-Server running on http://localhost:${PORT}`))
})