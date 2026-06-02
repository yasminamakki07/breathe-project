const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../config/db");

const router = express.Router();

// SIGN UP
router.post("/signup", async (req, res) => {
  const { full_name, email, password } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)",
      [full_name, email, hashedPassword],
      (err, result) => {
        if (err) {
          return res.status(500).json({ message: "Error creating user" });
        }

        res.status(201).json({
          message: "User created successfully",
          user: {
            user_id: result.insertId,
            full_name,
            email,
          },
        });
      }
    );
  });
});

// LOG IN WITH FULL NAME OR EMAIL
router.post("/login", (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ message: "Username/email and password are required" });
  }

  db.query(
    "SELECT * FROM users WHERE email = ? OR full_name = ?",
    [identifier, identifier],
    async (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }

      if (results.length === 0) {
        return res.status(400).json({ message: "Invalid username/email or password" });
      }

      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: "Invalid username/email or password" });
      }

      res.status(200).json({
        message: "Login successful",
        user: {
          user_id: user.user_id,
          full_name: user.full_name,
          email: user.email,
        },
      });
    }
  );
});

module.exports = router;