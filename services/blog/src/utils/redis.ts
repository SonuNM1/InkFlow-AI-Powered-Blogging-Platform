import { createClient } from "redis";
import chalk from "chalk";

export const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      console.log(chalk.yellow(`Redis reconnect attempt: ${retries}`));
      return Math.min(retries * 100, 3000); // retry delay
    },
  },
});

/**
 * VERY IMPORTANT:
 * Redis emits errors asynchronously.
 * If we don't listen to them, Node will crash.
 */
redisClient.on("error", (err) => {
  console.error(chalk.red("Redis Client Error:"), err.message);
});

redisClient.on("connect", () => {
  console.log(chalk.green.bold("Redis connected"));
});

redisClient.on("reconnecting", () => {
  console.log(chalk.yellow("Redis reconnecting..."));
});

await redisClient.connect();
