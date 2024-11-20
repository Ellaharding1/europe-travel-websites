require("dotenv").config(); // Load environment variables from .env

const express = require("express");
const cors = require("cors"); // Import CORS
const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");
const crypto = require("crypto"); // For generating a random secret key
const jwt = require("jsonwebtoken");
const validator = require("validator");

const app = express(); // Initialize app

// Load environment variables
const PORT = process.env.PORT || 3000; // Default to port 3000 if not provided
const DATABASE_URI = process.env.DATABASE_URI; // MongoDB connection string
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5174"; // Default to localhost frontend
const TOKEN_SECRET = process.env.TOKEN_SECRET || "your-secret-key"; // Secret for JWT signing

// Enable CORS
app.use(
  cors({
    origin: FRONTEND_URL, // Allow requests from frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
    credentials: true, // Include this if you're using cookies or authentication headers
  })
);

app.use(express.json()); // Enable JSON parsing

// MongoDB client setup
const client = new MongoClient(DATABASE_URI);
const db = client.db("lab4_database");
const usersCollection = db.collection("users");

// Middleware for token authentication
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, TOKEN_SECRET);
    req.user = decoded; // Attach the user payload to the request
    next(); // Call the next middleware or route handler
  } catch (err) {
    res.status(403).json({ error: "Invalid token." });
  }
}

app.use("/api/secure", authenticateToken); // Secure route middleware

(async () => {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1); // Exit process if MongoDB connection fails
  }

  // Start the server
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

  // Register endpoint
  app.post("/register", async (req, res) => {
    const { email, password, nickname } = req.body;

    try {
      if (!validator.isEmail(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const secretKey = crypto.randomBytes(32).toString("hex");

      const newUser = {
        email,
        password: hashedPassword,
        nickname,
        secretKey,
        isDisabled: false,
        isVerified: false,
      };

      await usersCollection.insertOne(newUser);

      const token = jwt.sign({ email }, secretKey, { expiresIn: "1h" });

      const verificationLink = `${FRONTEND_URL}/verify-email?token=${token}`;
      console.log(`Verification link: ${verificationLink}`);

      res.status(201).json({
        message: "User registered successfully. Simulated email verification link:",
        verificationLink,
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to register user", details: err.message });
    }
  });

  // Email verification endpoint
  app.get("/verify-email", async (req, res) => {
    const { token } = req.query;

    try {
      const decodedToken = jwt.decode(token);

      const user = await usersCollection.findOne({ email: decodedToken.email });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      jwt.verify(token, user.secretKey);

      await usersCollection.updateOne(
        { email: decodedToken.email },
        { $set: { isVerified: true } }
      );

      res.send("Email verified successfully.");
    } catch (err) {
      res.status(400).json({ error: "Invalid or expired token" });
    }
  });

  // Login endpoint
  app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
      if (!validator.isEmail(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      const user = await usersCollection.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.isDisabled) {
        return res.status(403).json({ error: "Account is disabled. Please contact the administrator." });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ error: "Invalid password" });
      }

      const token = jwt.sign({ id: user._id, email: user.email }, user.secretKey, { expiresIn: "1h" });
      res.json({ message: "Login successful", token });
    } catch (err) {
      res.status(500).json({ error: "Failed to log in", details: err.message });
    }
  });
})();
