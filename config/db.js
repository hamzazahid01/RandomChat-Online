import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("Database connection error:", error);
    process.exit(1); // app band ho jaye agar DB connect na ho
  }
};

export default connectDB;