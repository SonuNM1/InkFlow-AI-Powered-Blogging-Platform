import amqp from "amqplib";
import { redisClient } from "./redis.js";
import { sql } from "./db.js";
import chalk from "chalk";

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

    // Connect to RabbitMQ Server 

    const connection = await amqp.connect({
      protocol: "amqp",
      hostname: "localhost",
      port: 5672,
      username: "admin",
      password: "admin123",
    });

    const channel = await connection.createChannel() ; // create a channel (communication pipe)

    const queueName = "cache-invalidation"  // queue name that producer publishes messages to 

    // Ensure queue exists (safe even if already exists)

    await channel.assertQueue(
        queueName, 
        {
            durable: true   // messages survive RabbitMQ restart 
        }
    )

    console.log(chalk.green.bold("📡 Blog Service cache consumer started")) ; 

    // Start consuming messages - RabbitMQ will push messages to this callback 

    channel.consume(queueName, async(msg) => {
            if(!msg) return ; 

            try {
                const content = JSON.parse(msg.content.toString()) as CacheInvalidationMessage ; // Parse message content 

                console.log("📩 Received cache invalidation message: ", content) 

                // Invalidate cache 

                if(content.action === "invalidateCache"){

                    // Loop over cache key patterns (blogs:*)

                    for(const pattern of content.keys){

                        const keys = await redisClient.keys(pattern) ; // Find matching Redis keys 

                        if(keys.length > 0){
                            await redisClient.del(keys) ; // delete old cache 

                            console.log(`🗑️ Blog service invalidated: ${keys.length} cache keys matching: ${pattern}`)

                            // Rebuild cache immediately (warm cache). This avoids first user hitting DB

                            const searchQuery = "" ; 
                            const category = "" ; 

                            const cacheKey = `blogs:${searchQuery}:${category}`

                            // Fetch fresh data from DB 

                            const blogs = await sql `
                                SELECT * FROM blogs ORDER BY create_at DESC
                            ` ; 

                            // Store fresh data in redis 

                            await redisClient.set(cacheKey, JSON.stringify(blogs), {
                                EX: 3600
                            })

                            console.log("🔄️ Cache rebuilt with key: ", cacheKey)
                        }
                    }
                }

                channel.ack(msg) ; // tell RabbitMQ message processed successfully

            } catch (error) {
                console.error(chalk.red.bold("❌ Error processing cache invalidation in blog service: ", error))

                channel.nack(msg, false, true) ; // Requeue message if processing failed 
            }
    })

  } catch (error) {
    console.error(chalk.red.bold("Failed to start RabbitMQ Consumer: ", error))
  }
};

