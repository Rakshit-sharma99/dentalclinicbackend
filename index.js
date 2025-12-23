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

// ⭐ Support for Render "Secret Files" (uploaded .env)
require("dotenv").config({ path: "/etc/secrets/.env" });

// ⭐ Debug Route (Check if variables are loaded)
app.get("/debug-config", (req, res) => {
  res.json({
    BREVO_USER: process.env.BREVO_USER ? "✅ Defined" : "❌ Missing",
    BREVO_SMTP_KEY: process.env.BREVO_SMTP_KEY ? "✅ Defined" : "❌ Missing",
    EMAIL_FROM: process.env.EMAIL_FROM ? "✅ Defined" : "❌ Missing",
    MONGO_URI: process.env.MONGO_URI ? "✅ Defined" : "❌ Missing",
    CORS_ORIGIN: req.headers.origin
  });
});

// ⭐ Trust proxy is required for cookies (secure: true) to work on Render/Vercel
app.set("trust proxy", 1);

const allowedOrigins = [
  "https://moderndentalclinicphagwara.com",
  "https://www.moderndentalclinicphagwara.com",
  "http://localhost:5173"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    // Check exact match
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Check Vercel preview deployments
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    console.log("❌ CORS blocked origin:", origin);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));



// ⭐ Parse JSON
app.use(express.json());

// ⭐ Parse cookies
app.use(cookieParser());

// Routes
const appointmentRoutes = require('./Routes/Appointment');
const authRoutes = require('./Routes/auth');

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
const reviewsRoute = require('./Routes/Reviews');
app.use("/api/reviews", reviewsRoute);        // public reviews

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
