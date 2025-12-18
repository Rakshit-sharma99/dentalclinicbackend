const mongoose = require('mongoose');

const connectMongoose = async () => {
  let url = process.env.MONGO_URI || "mongodb://localhost:27017/dental";

  try {
    await mongoose.connect(url);
    console.log("Connected to MongoDB (Primary)");
  } catch (error) {
    console.log("❌ Primary MongoDB connection failed:", error.message);

    // Fallback to local
    try {
      console.log("⚠️ Attempting fallback to local MongoDB...");
      url = "mongodb://localhost:27017/dental";
      await mongoose.connect(url);
      console.log("✅ Connected to Local MongoDB");
    } catch (localErr) {
      console.log("❌ Local MongoDB connection also failed:", localErr.message);
    }
  }
}

module.exports = connectMongoose;