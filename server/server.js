const { MongoClient } = require("mongodb");

const express = require("express");
const bcrypt = require("bcrypt");
const crypto = require("crypto"); // For generating a random secret key
const jwt = require('jsonwebtoken')
const nodemailer = require("nodemailer");
const validator = require("validator");


const app = express();
app.use(express.json());

const TOKEN_SECRET = "your-secret-key";

const port = 3000;

const uri = "mongodb+srv://ellaharding:Shadowflash1@users.8onqb.mongodb.net/";
const databaseName = "lab4_database";

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if(!token) return res.status(401).json({error: "Access denied. No token provided."});
    try {
        const decoded = jwt.verify(token, TOKEN_SECRET);
        req.user = decoded; // Attach the user payload to the request
        next(); // Call the next middleware or route handler
      } catch (err) {
        res.status(403).json({ error: "Invalid token." });
      }
}

app.use("/api/secure", authenticateToken);


const client = new MongoClient(uri);
const db = client.db(databaseName);
const usersCollection = db.collection("users");

(async () => {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
  }

  app.listen(port, () =>{
    console.log(`Server is running on http://localhost:${port}`);
  });

  app.post("register", async (req,res) =>{
    const {email, password, nickname}= req.body;

  })

})();


app.post("/register", async (req, res) => {
    const { email, password, nickname } = req.body;
  
    try {
      // Validate the email format
      if (!validator.isEmail(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }
  
      // Check if the user already exists
      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Generate a unique secret key for the user
      const secretKey = crypto.randomBytes(32).toString("hex");
  
      // Save the new user
      const newUser = {
        email,
        password: hashedPassword,
        nickname,
        secretKey,
        isDisabled: false,
        isVerified: false,
      };
  
      await usersCollection.insertOne(newUser);
  
      // Generate a verification token
      const token = jwt.sign({ email }, secretKey, { expiresIn: "1h" });
  
      // Simulate sending a verification email
      const verificationLink = `http://localhost:3000/verify-email?token=${token}`;
      console.log(`Verification link: ${verificationLink}`); // Log the link for testing
  
      res.status(201).json({
        message: "User registered successfully. Simulated email verification link:",
        verificationLink,
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to register user", details: err.message });
    }
  });
  
  

  app.get("/verify-email", async (req, res) => {
    const { token } = req.query;
  
    try {
      // Decode the token without verifying to extract the email
      const decodedToken = jwt.decode(token);
  
      // Find the user by email
      const user = await usersCollection.findOne({ email: decodedToken.email });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Verify the token with the user's secret key
      jwt.verify(token, user.secretKey);
  
      // Update the user's `isVerified` field
      await usersCollection.updateOne(
        { email: decodedToken.email },
        { $set: { isVerified: true } }
      );
  
      res.send("Email verified successfully.");
    } catch (err) {
      res.status(400).json({ error: "Invalid or expired token" });
    }
  });
  

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Validate email format
      if (!validator.isEmail(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }
  
      // Find the user
      const user = await usersCollection.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      if (user.isDisabled) {
        return res.status(403).json({ error: "Account is disabled. Please contact the administrator." });
      }
  
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ error: "Invalid password" });
      }
  
      // Generate JWT
      const token = jwt.sign({ id: user._id, email: user.email }, user.secretKey, { expiresIn: "1h" });
      res.json({ message: "Login successful", token });
    } catch (err) {
      res.status(500).json({ error: "Failed to log in", details: err.message });
    }
  });
  
  
