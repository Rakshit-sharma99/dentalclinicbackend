const express = require("express");
const User = require("../Model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();

// ---------------- CHECK LOGIN STATUS ----------------
router.get("/check", (req, res) => {
  console.log("🔍 Check Auth Request - Cookies:", req.cookies); // DEBUG LOG
  const token = req.cookies.token;
  if (!token) {
    console.log("❌ No token found in cookies");
    return res.json({ loggedIn: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token verified for user:", decoded.email);
    res.json({ loggedIn: true, user: decoded });
  } catch (err) {
    console.log("❌ Token verification failed:", err.message);
    return res.json({ loggedIn: false });
  }
});


// Helper for cookie options
const isProduction = process.env.NODE_ENV === "production";
const cookieOptions = {
  httpOnly: true,
  secure: isProduction, // true in production (HTTPS)
  sameSite: isProduction ? "None" : "Lax", // None for cross-site (Vercel->Render), Lax for local
  maxAge: 24 * 60 * 60 * 1000 // 1 day
};

// ---------------- SIGNUP ----------------
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ msg: "User already exists" });

    const hashedPass = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPass,
      role: "user" // default user
    });

    // Create JWT
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Set cookie
    res.cookie("token", token, cookieOptions);

    // Safe user object (NO PASSWORD)
    res.json({
      msg: "Signup successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
});


// ---------------- LOGIN ----------------
router.post("/login", async (req, res) => {
  console.log("👉 Login Request Received:", req.body);
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    console.log("👤 User Found:", user ? "Yes" : "No");

    if (!user) {
      console.log("❌ User not found");
      return res.status(400).json({ msg: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    console.log("🔐 Password Match:", match);

    if (!match) {
      console.log("❌ Password mismatch");
      return res.status(400).json({ msg: "Wrong password" });
    }

    // Create JWT
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    console.log("✅ Token generated, sending cookie");

    // Set cookie
    res.cookie("token", token, cookieOptions);
    console.log("🍪 Cookie set with options:", cookieOptions); // DEBUG LOG

    // Return safe user object
    res.json({
      msg: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error("🔥 Login Error:", err);
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
});



// ---------------- LOGOUT ----------------
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    ...cookieOptions,
    maxAge: 0
  });

  res.json({ msg: "Logged out successfully" });
});

// ---------------- FORGOT PASSWORD ----------------
const crypto = require("crypto");
const { sendEmail } = require("../services/emailService");

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Security: Always return success to prevent email enumeration
      return res.json({ msg: "If an account exists, a reset link has been sent to your email." });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token for storage
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // Create Link (Frontend URL)
    // NOTE: In production, use process.env.FRONTEND_URL. For now, hardcoding as per plan or assuming local/vercel.
    // User asked for: https://your-frontend-domain.com/reset-password/{RAW_TOKEN}
    // I will use a placeholder that the user can likely configure or I'll detect. 
    // Given previous context, it's localhost or vercel. Let's use a dynamic approach or hardcode for now based on what User asked in plan?
    // Plan said: `https://dentalfrontend.vercel.app/reset-password/{RAW_TOKEN}` (localized for dev).
    // I'll stick to a safe default or checking origin, but let's use the Vercel one as primary if production, else localhost.

    // Generate Reset Link
    // Use FRONTEND_URL from env, or default to Vercel/Localhost if not set
    const frontendUrl = process.env.FRONTEND_URL || "https://dentalfrontend.vercel.app";
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const message = `
Hello,

We received a request to reset the password for your Dental Clinic account.

Click the link below to set a new password:
${resetUrl}

This link will expire in 1 hour for security reasons.

⚠️ Do not share this link with anyone. Our team will never ask for your password.

If you did not request this password reset, please ignore this email.
Your account will remain secure.

Regards,
Dental Clinic Support Team
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: "🔐 Reset Your Password – Dental Clinic Account",
        text: message
      });
      res.json({ msg: "If an account exists, a reset link has been sent to your email." });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return res.status(500).json({ msg: "Email could not be sent" });
    }

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ---------------- RESET PASSWORD ----------------
router.post("/reset-password/:token", async (req, res) => {
  try {
    // Hash incoming token to compare with DB
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired token" });
    }

    // Hash new password
    const hashedPass = await bcrypt.hash(req.body.password, 10);

    user.password = hashedPass;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ msg: "Password updated successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ---------------- UPDATE PROFILE ----------------
const auth = require("../middleware/auth");

router.put("/update-profile", auth, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ msg: "Name is required" });
    }

    // Find and update
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name },
      { new: true } // Return updated doc
    ).select("-password -resetPasswordToken -resetPasswordExpires");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({ msg: "Profile updated successfully", user });

  } catch (err) {
    console.error("Profile Update Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ---------------- CREATE DEFAULT ADMIN ----------------


module.exports = router;
