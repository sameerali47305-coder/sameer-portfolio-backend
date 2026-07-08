const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// Treat email as "not really configured" if it's still the placeholder
// from .env.example, so signup never gets stuck waiting on a verification
// email that can never be sent.
const isEmailConfigured = () =>
  process.env.EMAIL_USER &&
  process.env.EMAIL_PASS &&
  !process.env.EMAIL_USER.includes("yourgmail");

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      verificationToken,
    });

    const emailConfigured = isEmailConfigured();

    if (emailConfigured) {
      const verifyUrl = `${process.env.CLIENT_URL}/verify/${verificationToken}`;

      try {
        await sendEmail(
          user.email,
          "Verify your email - Sameer Portfolio",
          `Hi ${user.name}, please verify your email by visiting: ${verifyUrl}`
        );
      } catch (emailError) {
        console.log("Email sending failed:", emailError.message);
      }
    } else {
      // No real email service configured (e.g. fresh deployment) -
      // auto-verify so the account is usable right away.
      user.isVerified = true;
      user.verificationToken = undefined;
      await user.save();
    }

    return res.status(201).json({
      success: true,
      message: emailConfigured
        ? "Signup successful. Please check your email to verify your account."
        : "Signup successful. You can now log in.",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in",
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired verification link",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const getMe = async (req, res) => {
  // req.user is set by the `protect` auth middleware
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

module.exports = {
  signup,
  login,
  verifyEmail,
  getMe,
};
