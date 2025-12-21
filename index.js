const connectMongoose = require('./db.js');
const express = require('express');
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

// ⭐ Correct User Model path AND bcrypt version
const User = require("./Model/User.js");
const bcrypt = require("bcrypt");

connectMongoose();

const app = express();
const port = process.env.PORT || 3000;

// ⭐ Trust proxy is required for cookies (secure: true) to work on Render/Vercel
app.set("trust proxy", 1);


// ⭐ MUST for cookie-based auth
app.use(cors({
  origin: process.env.FRONTEND_URL || true, // Trust the specific origin if set, else reflect request origin
  credentials: true
}));



// ⭐ Parse JSON
app.use(express.json());

// ⭐ Parse cookies
app.use(cookieParser());

// Routes
const appointmentRoutes = require('./Routes/Appointment');
const authRoutes = require('./Routes/auth');
const adminRoute = require("./Routes/admin");

// ⭐ AUTO CREATE DEFAULT ADMIN IF NOT EXISTS
async function createDefaultAdmin() {
  try {
    const adminEmail = "admin@dental.com";
    const adminPassword = "Admin123";

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      const admin = new User({
        name: "Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      });

      await admin.save();
      console.log("⭐ Default admin created:");
      console.log("Email:", adminEmail);
      console.log("Password:", adminPassword);
    } else {
      console.log("⭐ Admin already exists:", adminEmail);
    }
  } catch (err) {
    console.error("Error creating admin:", err);
  }
}

// ⭐ Call admin creator AFTER DB connects
createDefaultAdmin();

// Route middlewares
app.use("/user", authRoutes);                 // signup/login/logout
app.use("/appointment", appointmentRoutes);   // booking
app.use("/admin", adminRoute);                // admin-only routes
const reviewsRoute = require('./Routes/Reviews');
app.use("/api/reviews", reviewsRoute);        // public reviews

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
