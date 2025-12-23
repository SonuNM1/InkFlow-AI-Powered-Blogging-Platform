import amqp from 'amqplib';
import chalk from 'chalk';
let channel; // this will store the shared channel, needs to be global since more functions use it. 
// Connects to RabbitMQ. Creates a channel. Keeps it ready for publishing messages. 
export const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect({
            protocol: "amqp",
            hostname: "localhost",
            port: 5672,
            username: "admin",
            password: "admin123"
        });
        channel = await connection.createChannel(); // opens a logical pipe. All messages go through this channel. Stored in the 'channel' variable for reuse 
        console.log(chalk.green.bold("Connected to RabbitMQ"));
    }
    catch (error) {
        console.error(chalk.red.bold("Failed to connect to RabbitMQ: ", error));
    }
};
// Sending messages: queueName -> where to send, message -> what to send
export const publishToQueue = async (queueName, message) => {
    if (!channel) {
        console.log("RabbitMQ channel not initialized");
        return;
    }
    // Create the queue if it doesn't exist
    await channel.assertQueue(queueName, {
        durable: true // survives RabbitMQ restart
    });
    // Send message 
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), // messages must be binary 
    {
        persistent: true // message survives broker restart 
    });
};
/*
The real use-case.

This function: doesn't delete cache, It only sends a job, Another service/worker will do deletion
*/
export const invalidateCacheJob = async (cacheKeys) => {
    try {
        // this is job payload 
        const message = {
            action: "invalidateCache",
            keys: cacheKeys
        };
        // send job to queue. Meaning: RabbitMQ, store this job. Someone will process it later. 
        await publishToQueue("cache-invalidation", message);
        console.log("Cache Invalidation Job published to RabbitMQ");
    }
    catch (error) {
        console.error("Failed to publish cache on RabbitMQ: ", error);
    }
};
//# sourceMappingURL=RabbitMQ.js.map