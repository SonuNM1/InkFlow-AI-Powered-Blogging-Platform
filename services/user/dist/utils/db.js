import mongoose from "mongoose";
import chalk from "chalk";
const connectDB = async () => {
    try {
        mongoose.connect(process.env.MONGO_URI, {
            dbName: "blog"
        });
        console.log(chalk.green.bold("DB Connected"));
    }
    catch (error) {
        console.log(chalk.red.bold("DB Connect error: ", error));
    }
};
export default connectDB;
//# sourceMappingURL=db.js.map