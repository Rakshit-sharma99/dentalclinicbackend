require("dotenv").config();
const mongoose = require('mongoose');

const url = process.env.MONGO_URI;
console.log("Testing connection to:", url);

mongoose.connect(url)
    .then(() => {
        console.log("✅ SUCCESS: Connected to MongoDB Atlas!");
        process.exit(0);
    })
    .catch((err) => {
        console.error("❌ ERROR: Could not connect.", err);
        process.exit(1);
    });
