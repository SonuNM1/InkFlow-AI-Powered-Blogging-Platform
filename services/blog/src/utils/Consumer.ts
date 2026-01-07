import amqp from "amqplib";
import { redisClient } from "./redis.js";
import { sql } from "./db.js";
import chalk from "chalk";
import { start } from "repl";

/*
Shape of message coming from RabbitMQ 
{
    action: "invalidateCache",
    keys: ["blogs:*"]
}
*/

interface CacheInvalidationMessage {
  action: string;
  keys: string[];
}

// Starts a RabbitMQ consumer that listens for cache invalidation events

export const startCacheConsumer = async () => {
  try {

    // Connect to RabbitMQ Server - this connection is a TCP socket underneath

    const connection = await amqp.connect({
      protocol: "amqp",
      hostname: process.env.Rabbitmq_Host,
      port: Number(process.env.Rabbitmq_Port),
      username: process.env.Rabbitmq_Username,
      password: process.env.Rabbitmq_Password,
    });

    // RabbitMQ can emit an 'error' event at any time. If this is unhandled, Node.js will crash 

    connection.on("error", (err) => {
      console.error(chalk.red("❌ RabbitMQ Connection error: ", err.message));
    })

    // Fired when RabbitMQ closes the connection (restart, crash, network issue). We automatically retry after 5 seconds 

    connection.on("close", () => {
      console.warn(
        chalk.yellow.bold("⚠️ RabbitMQ connection closed. Reconnecting in 5s...")
      ) ; 
      setTimeout(startCacheConsumer, 5000);
    })

    // Create a channel - channel is a lightweight "virtual connection" used for publishing/consuming messages 

    const channel = await connection.createChannel(); 

    // Channels also emit error events. These must be handled separately 

    channel.on("error", (err) => {
      console.error(chalk.red.bold("❌ RabbitMQ Channel error: ", err.message));
    })

    channel.on("close", () => {
      console.warn(chalk.yellow.bold("⚠️ RabbitMQ channel closed.")) ;
    })

    const queueName = "cache-invalidation"; // queue name that producer publishes messages to

    // Ensure queue exists (safe even if already exists)

    await channel.assertQueue(queueName, {
      durable: true, // messages survive RabbitMQ restart
    });

    console.log(chalk.green.bold("📡 Blog Service cache consumer started"));

    // Start consuming messages - RabbitMQ will push messages to this callback

    channel.consume(queueName, async (msg) => {
      if (!msg) return;

      try {
        const content = JSON.parse(
          msg.content.toString()
        ) as CacheInvalidationMessage; // Parse message content

        console.log("📩 Received cache invalidation message: ", content);

        // Invalidate cache

        if (content.action === "invalidateCache") {
          // Loop over cache key patterns (blogs:*)

          for (const pattern of content.keys) {
            const keys = await redisClient.keys(pattern); // Find matching Redis keys

            if (keys.length > 0) {
              await redisClient.del(keys); // delete old cache

              console.log(
                `🗑️ Blog service invalidated: ${keys.length} cache keys matching: ${pattern}`
              );

              // Rebuild cache immediately (warm cache). This avoids first user hitting DB

              const searchQuery = "";
              const category = "";

              const cacheKey = `blogs:${searchQuery}:${category}`;

              // Fetch fresh data from DB

              const blogs = await sql`
                                SELECT * FROM blogs ORDER BY create_at DESC
                            `;

              // Store fresh data in redis

              await redisClient.set(cacheKey, JSON.stringify(blogs), {
                EX: 3600,
              });

              console.log("🔄️ Cache rebuilt with key: ", cacheKey);
            }
          }
        }

        channel.ack(msg); // tell RabbitMQ message processed successfully
      } catch (error) {
        console.error(
          chalk.red.bold(
            "❌ Error processing cache invalidation in blog service: ",
            error
          )
        );

        channel.nack(msg, false, true); // Requeue message if processing failed
      }
    });
  } catch (error) {
    console.error(chalk.red.bold("Failed to start RabbitMQ Consumer: ", error));
  }
};


/* 
This file starts a RabbitMQ consumer for the Blog Service. 

Purpose: Listens for cache invalidation events published by other services. Deletes stale Redis cache keys, Optionally rebuilds the cache immediately. 

Keeps cache consistent across microservices 
Prevents serving stale blog data 
Avoid first-user cache miss after writes 
*/