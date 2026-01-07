import amqp from "amqplib";
import chalk from "chalk";

// We store both connection and channel globally because: multiple functions need them, we must recreate them on reconnect

let connection: amqp.Connection | null = null;
let channel: amqp.Channel | null = null; // this will store the shared channel, needs to be global since more functions use it.

// Connects to RabbitMQ. Creates a channel. Keeps it ready for publishing messages.

export const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect({
      protocol: "amqp",
      hostname: process.env.Rabbitmq_Host,
      port: Number(process.env.Rabbitmq_Port),
      username: process.env.Rabbitmq_Username,
      password: process.env.Rabbitmq_Password,
      heartbeat: 30, // keeps connection alive (prevents idle disconnects)
    });

    // need to listen error events, otherwise node.js will crash on network errors

    connection?.on("error", (err) => {
      console.error(chalk.red("❌ RabbitMQ Connection error: ", err.message));
    });

    // if RabbitMQ cLoses the connection (restart / network / idle timeout), we reconnect automatically

    connection?.on("close", () => {
      console.warn(
        chalk.yellow("⚠️ RabbitMQ connection closed. Reconnecting...")
      );
      setTimeout(connectRabbitMQ, 5000); // try to reconnect after 5 seconds
    });

    // Create a channel - they are lightweight, used to publish and consume messages

    channel = await connection.createChannel();

    // Channel level error handling - channel errors are separate from connection errors

    channel?.on("error", (err) => {
      console.error(chalk.red("❌ RabbitMQ Channel error: ", err.message));
    });

    channel?.on("close", () => {
      console.warn(chalk.yellow("⚠️ RabbitMQ channel closed."));
    });

    console.log(chalk.green.bold("✅ Connected to RabbitMQ"));
  } catch (error) {
    console.error(chalk.red.bold("❌ Failed to connect to RabbitMQ: ", error));

    setTimeout(connectRabbitMQ, 5000);
  }
};

// PUBLISH MESSAGE TO QUEUE: queueName -> where messsage goes, message -> payload

export const publishToQueue = async (queueName: string, message: any) => {
  // if channel is not ready, Do not crash the app

  if (!channel) {
    console.warn(
      chalk.yellow("⚠️ RabbitMQ channel not ready. Message skipped.")
    );
    return;
  }

  // Create the queue if it doesn't exist

  await channel.assertQueue(queueName, {
    durable: true, // survives RabbitMQ restart
  });

  // Send message to queue - buffer required (RabbitMQ is binary), persistent (message saved to disk)

  channel.sendToQueue(
    queueName,
    Buffer.from(JSON.stringify(message)), // messages must be binary
    {
      persistent: true, // message survives broker restart
    }
  );
};

/* BUSINESS FUNCTION - The real use-case. 

This function: doesn't delete cache, doesn't invalidate cache directly. It only sends a job to RabbitMQ. 

Another service (consumer) will: read this job, delete cache and rebuild cache. 
*/

export const invalidateCacheJob = async (cacheKeys: string[]) => {
  try {

    // this is job payload

    const message = {
      action: "invalidateCache",
      keys: cacheKeys,
    };

    // send job to queue. Meaning: RabbitMQ, store this job. Someone will process it later.

    await publishToQueue("cache-invalidation", message);

    console.log("📤 Cache Invalidation Job published to RabbitMQ");
  } catch (error) {
    console.error("❌ Failed to publish cache on RabbitMQ: ", error);
  }
};
