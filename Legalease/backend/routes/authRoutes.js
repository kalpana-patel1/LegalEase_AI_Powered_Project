import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import protect from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import { sendCredentialsEmail } from "../utils/emailService.js";
const router = express.Router();

/* REGISTER */
router.post("/register", protect, async (req, res) => {
  // Only admin can create users
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Only admin can create users" });
  }

  const { name, email, password, barCouncilId } = req.body;

  if (!barCouncilId) {
    return res.status(400).json({ message: "Bar Council ID required" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  await User.create({
    name,
    email,
    password,
    role: "lawyer", // auto hashed
    barCouncilId,
  });

  await sendCredentialsEmail(email, email, password);
  res.json({ message: "Lawyer created successfully" });
});

/* LOGIN */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    //  FIXED RESPONSE
    res.status(200).json({
      token,
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});
export default router;
