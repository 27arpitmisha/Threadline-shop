import { Router } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function adminEmailConfigured() {
  return process.env.ADMIN_EMAIL?.trim().toLowerCase() || "";
}

function isAdminEmail(email) {
  const a = adminEmailConfigured();
  return Boolean(a && email?.trim().toLowerCase() === a);
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password || password.length < 6) {
      return res.status(400).json({ message: "Valid name, email, and password (6+ chars) required" });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }
    const role = isAdminEmail(email) ? "admin" : "user";
    const user = await User.create({ name: name.trim(), email, password, role });
    const token = signToken(user._id.toString());
    res.status(201).json({ user: user.toJSON(), token });
  } catch (e) {
    res.status(500).json({ message: e.message || "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (isAdminEmail(user.email) && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }
    const token = signToken(user._id.toString());
    res.json({ user: user.toJSON(), token });
  } catch (e) {
    res.status(500).json({ message: e.message || "Login failed" });
  }
});

router.get("/me", authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
