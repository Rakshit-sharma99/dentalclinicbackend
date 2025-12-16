const mongoose = require('mongoose');

const connectMongoose = async () => {
  const url = process.env.MONGO_URI || "mongodb://localhost:27017/dental";

  try {
    await mongoose.connect(url);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log("❌ MongoDB connection error:", error);
  }
}

module.exports = connectMongoose;