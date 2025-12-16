import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connect(process.env.MONGO_URI as string) ; 
        
        console.log("DB Connected")
    } catch (error) {
        console.log("DB Connect error: ", error)
    }
}

export default connectDB ; 