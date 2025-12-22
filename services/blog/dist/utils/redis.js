import { createClient } from "redis";
import chalk from "chalk";
export const redisClient = createClient({
    url: process.env.REDIS_URL
});
redisClient
    .connect()
    .then(() => {
    console.log(chalk.green.bold("Connected to Redis"));
})
    .catch((error) => {
    console.error(chalk.red.bold("Redis connect error: "), error);
});
//# sourceMappingURL=redis.js.map