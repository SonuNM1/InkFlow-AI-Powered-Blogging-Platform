import chalk from "chalk";
const TryCatch = (handler) => {
    return async (req, res, next) => {
        try {
            await handler(req, res, next);
        }
        catch (error) {
            console.log(chalk.red.bold("Error: ", error || error.message));
            res.status(500).json({
                message: error.message
            });
        }
    };
};
export default TryCatch;
/*
Since, we were repeating try-catch in every controller. So, we created one reusable wrapper

This TryCatch is a higher-order functioon. It takes a function and returns a new function.

Takes our controller (handler), Wraps it in try/catch and Automatically handles async errors. So, we write less code in controllers.

*/ 
//# sourceMappingURL=TryCatch.js.map