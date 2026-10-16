import mongoose from "mongoose";
import Order from "../models/order.model.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
    
    // Fix stripeSessionId index - drop old unique index if it exists
    // Mongoose will recreate it as sparse based on the schema
    try {
      const indexes = await Order.collection.getIndexes();
      if (indexes.stripeSessionId_1) {
        console.log("Dropping old stripeSessionId index to recreate as sparse...");
        await Order.collection.dropIndex("stripeSessionId_1").catch(() => {
          // Index might already be dropped, ignore error
        });
        // Recreate index with sparse option
        await Order.collection.createIndex({ stripeSessionId: 1 }, { unique: true, sparse: true });
        console.log("✅ stripeSessionId index recreated as sparse");
      }
    } catch (indexError) {
      // Index might not exist or already be correct, continue
      console.log("Index migration:", indexError.message);
    }
  } catch (error) {
    console.error("Error connecting to MONGODB:", error.message);
    process.exit(1);
  }
};
