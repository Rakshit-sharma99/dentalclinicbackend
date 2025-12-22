const mongoose = require('mongoose');

const connectMongoose = async () => {
  const url = process.env.MONGO_URI || "mongodb://localhost:27017/dental";

  // Masked URL for logging (hide password)
  const maskedUrl = url.replace(/:([^:@]+)@/, ":****@");

  console.log(`📡 Connecting to MongoDB at: ${maskedUrl}`);

  try {
    await mongoose.connect(url, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s
    });
    console.log("✅ Connected to MongoDB (Primary)");
  } catch (error) {
    console.error("❌ Primary MongoDB connection failed:");
    console.error(`   Message: ${error.message}`);
    console.error(`   Code: ${error.code}`);
    console.error(`   Name: ${error.name}`);

    // Only fallback if NOT in production (Env check)
    if (process.env.NODE_ENV !== 'production') {
      // Fallback to local
      try {
        console.log("⚠️ Attempting fallback to local MongoDB...");
        await mongoose.connect("mongodb://localhost:27017/dental");
        console.log("✅ Connected to Local MongoDB");
      } catch (localErr) {
        console.log("❌ Local MongoDB connection also failed:", localErr.message);
      }
    } else {
      console.log("❌ Production environment: Skipping local fallback.");
    }
  }
}

module.exports = connectMongoose;