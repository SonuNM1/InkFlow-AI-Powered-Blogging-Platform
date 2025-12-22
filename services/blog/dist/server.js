import express from "express";
import dotenv from "dotenv";
import blogRoutes from './routes/blog.route.js';
import chalk from "chalk";
import "./utils/redis.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT;
app.use("/api/v1", blogRoutes);
app.listen(PORT, () => {
    console.log(chalk.blue.bold(`Blog-Server running on http://localhost:${PORT}`));
});
//# sourceMappingURL=server.js.map