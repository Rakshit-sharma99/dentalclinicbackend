const express = require("express");
const User = require("../Model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const router = express.Router();

const auth = require("../middleware/auth");
const { sendEmail } = require("../services/emailService");

// ---------------- COOKIE OPTIONS ----------------
// Production-ready cookie settings for cross-site auth (Vercel frontend <-> Render backend)
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production" || true,  // Always true for cross-site
  sameSite: "None",    // Required for cross-site cookies
  path: "/",           // Explicit path for all routes
  maxAge: 24 * 60 * 60 * 1000 // 1 day
};

// ---------------- CHECK LOGIN STATUS ----------------
router.get("/check", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.json({ loggedIn: false });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ loggedIn: true, user: decoded });
  } catch {
    res.json({ loggedIn: false });
  }
});

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
      role: "user"
    });

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, cookieOptions);

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
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ---------------- LOGIN ----------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Wrong password" });

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, cookieOptions);

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
    console.error(err);
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
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    console.log("🚀 Password reset requested for:", email);

    const user = await User.findOne({ email });

    // Always return same response (security)
    if (!user) {
      return res.json({
        msg: "If an account exists, a reset link has been sent to your email."
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // Production frontend URL (no localhost fallback)
    const frontendUrl = process.env.FRONTEND_URL.replace(/\/$/, "");

    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    console.log("🔗 Generated Reset Link:", resetUrl);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .container {
            font-family: 'Arial', sans-serif;
            max-width: 600px;
            margin: 0 auto;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
          }
          .header {
            background-color: #007bff;
            color: white;
            padding: 20px;
            text-align: center;
          }
          .content {
            padding: 30px;
            color: #000000ff;
            line-height: 1.6;
          }
          .button {
            display: inline-block;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 15px;
            text-align: center;
            font-size: 12px;
            color: #888888;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Modern Dental Clinic</h1>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hello,</p>
            <p>We received a request to reset the password for your account. If you made this request, please click the button below to secure your account:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset My Password</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #007bff;">${resetUrl}</p>
            
            <p>This link will expire in <b>1 hour</b>.</p>
            <hr style="border: 0; border-top: 1px solid #eeeeee;">
            <p style="font-size: 13px; color: #666;">If you did not request this password reset, please ignore this email. Your account remains secure.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Devloped By Webaura. All rights reserved.</p>
            <p>Phagwara, Punjab</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await sendEmail({
      to: user.email,
      subject: "Reset Your Password – Dental Clinic",
      html
    });

    if (!result.success) {
      console.error("❌ Email sending failed");
      return res.status(500).json({
        msg: "Unable to send reset email. Please try again later."
      });
    }

    console.log("📩 Reset email sent to:", user.email);


    res.json({
      msg: "If an account exists, a reset link has been sent to your email."
    });

  } catch (err) {
    console.error("❌ Forgot password error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ---------------- RESET PASSWORD ----------------
router.post("/reset-password/:token", async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired token" });
    }

    const hashedPass = await bcrypt.hash(req.body.password, 10);

    user.password = hashedPass;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ msg: "Password updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ---------------- UPDATE PROFILE ----------------
router.put("/update-profile", auth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ msg: "Name is required" });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name },
      { new: true }
    ).select("-password -resetPasswordToken -resetPasswordExpires");

    res.json({ msg: "Profile updated successfully", user });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
