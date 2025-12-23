import amqp from 'amqplib';
import chalk from 'chalk';
let channel;
export const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect({
            protocol: "amqp",
            hostname: "localhost",
            port: 5672,
            username: "admin",
            password: "admin123"
        });
        channel = await connection.createChannel();
        console.log(chalk.green.bold("Connected to RabbitMQ"));
    }
    catch (error) {
        console.log(chalk.red.bold("Failed to connect to RabbitMQ: ", error));
    }
};
//# sourceMappingURL=RabbitMQ.js.map