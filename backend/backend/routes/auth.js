const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { getUserByEmail, addUser } = require("../data/db");
const { JWT_SECRET, authMiddleware } = require("../middleware/auth");

const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "Name, email, and password are required." });
    if (password.length < 6)
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    if (getUserByEmail(email))
      return res.status(409).json({ success: false, message: "Email already registered." });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      id: `u-${uuidv4().slice(0, 8)}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: "user",
      phone: phone || "",
      createdAt: new Date().toISOString(),
    };
    addUser(user);
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ success: true, message: "Account created successfully!", data: { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Registration failed." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required." });

    const user = getUserByEmail(email);
    if (!user) return res.status(401).json({ success: false, message: "Invalid email or password." });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ success: false, message: "Invalid email or password." });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ success: true, message: "Login successful!", data: { token, user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone } } });
  } catch {
    res.status(500).json({ success: false, message: "Login failed." });
  }
});

// GET /api/auth/me
router.get("/me", authMiddleware, (req, res) => {
  const { getUserById } = require("../data/db");
  const user = getUserById(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found." });
  res.json({ success: true, data: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, createdAt: user.createdAt } });
});

module.exports = router;
