import chalk from "chalk";
import amqp from "amqplib";

// We store both connection and channel globally
// amqplib has no reliable TS typings → runtime-only usage is intentional

let connection: any = null;
let channel: any = null;

export const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect({
      protocol: "amqp",
      hostname: process.env.Rabbitmq_Host,
      port: Number(process.env.Rabbitmq_Port),
      username: process.env.Rabbitmq_Username,
      password: process.env.Rabbitmq_Password,
      heartbeat: 30,
    });

    connection.on("error", (err: Error) => {
      console.error(chalk.red("❌ RabbitMQ Connection error:", err.message));
    });

    connection.on("close", () => {
      console.warn(
        chalk.yellow("⚠️ RabbitMQ connection closed. Reconnecting...")
      );
      setTimeout(connectRabbitMQ, 5000);
    });

    channel = await connection.createChannel();

    channel.on("error", (err: Error) => {
      console.error(chalk.red("❌ RabbitMQ Channel error:", err.message));
    });

    channel.on("close", () => {
      console.warn(chalk.yellow("⚠️ RabbitMQ channel closed."));
    });

    console.log(chalk.green.bold("✅ Connected to RabbitMQ"));
  } catch (error) {
    console.error(
      chalk.red.bold("❌ Failed to connect to RabbitMQ:", error)
    );
    setTimeout(connectRabbitMQ, 5000);
  }
};

export const publishToQueue = async (queueName: string, message: any) => {
  if (!channel) {
    console.warn(
      chalk.yellow("⚠️ RabbitMQ channel not ready. Message skipped.")
    );
    return;
  }

  await channel.assertQueue(queueName, { durable: true });

  channel.sendToQueue(
    queueName,
    Buffer.from(JSON.stringify(message)),
    { persistent: true }
  );
};

export const invalidateCacheJob = async (cacheKeys: string[]) => {
  try {
    const message = {
      action: "invalidateCache",
      keys: cacheKeys,
    };

    await publishToQueue("cache-invalidation", message);

    console.log("📤 Cache Invalidation Job published to RabbitMQ");
  } catch (error) {
    console.error("❌ Failed to publish cache job:", error);
  }
};
