require("dotenv").config(); // Load environment variables

const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const fs = require("fs");
const csv = require("csv-parser");

const CSV_FILE_PATH = process.env.CSV_FILE_PATH || "data/destinations.csv";

const app = express();
const PORT = process.env.PORT || 3000; // Default to 3000 if PORT is not in .env
const DATABASE_URI = process.env.DATABASE_URI;
const TOKEN_SECRET = process.env.TOKEN_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;


// Enable CORS
app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Middleware
app.use(express.json());

// MongoDB Setup
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
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid token." });
  }
}

// Initialize and connect to MongoDB
(async () => {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }

  // Start the server
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

  // Register User
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
        message: "User registered successfully. Please verify your email.",
        verificationLink,
      });
      
    } catch (err) {
      res.status(500).json({ error: "Failed to register user", details: err.message });
    }
  });

  // Verify Email
  app.get("/verify-email", async (req, res) => {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: "Token is missing." });
    }

    try {
      const decodedToken = jwt.decode(token);

      if (!decodedToken || !decodedToken.email) {
        return res.status(400).json({ error: "Invalid token format." });
      }

      const user = await usersCollection.findOne({ email: decodedToken.email });

      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      jwt.verify(token, user.secretKey);

      await usersCollection.updateOne(
        { email: decodedToken.email },
        { $set: { isVerified: true } }
      );

      res.status(200).json({ message: "Email verified successfully." });
    } catch (err) {
      res.status(400).json({ error: "Invalid or expired token." });
    }
  });

  // Login User
  app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
      if (!validator.isEmail(email)) {
        return res.status(400).json({ error: "Invalid email format." });
      }

      const user = await usersCollection.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      if (user.isDisabled) {
        return res.status(403).json({ error: "Account is disabled. Please contact the administrator." });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ error: "Invalid password." });
      }

      const token = jwt.sign({ id: user._id, email: user.email }, user.secretKey, { expiresIn: "1h" });
      res.json({ message: "Login successful", token });
    } catch (err) {
      res.status(500).json({ error: "Failed to log in", details: err.message });
    }
  });

  app.get("/destinations", async (req, res) => {
    try {
      const destinations = await db.collection("destinations").find().toArray(); // Fetch all destinations
      res.status(200).json(destinations); // Send the destinations as a JSON response
    } catch (err) {
      res.status(500).send("Error fetching destinations: " + err.message);
    }
  });

// Search for destinations
app.get("/search-destinations", async (req, res) => {
  try {
    const { field, value = "", page = 1, limit = 5 } = req.query;

    // Prepare query
    const query = {};
    if (value.trim() !== "") {
      query[field] = { $regex: `^${value.trim()}`, $options: "i" }; // Match field starts with value
    }

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Fetch results with pagination
    const results = await db.collection("destinations")
      .find(query)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .toArray();

    // Fetch all results for total count
    const totalCount = await db.collection("destinations").countDocuments(query);

    res.status(200).json({
      results,
      totalCount,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCount / limitNumber),
    });
  } catch (err) {
    console.error("Error fetching destinations:", err.message);
    res.status(500).json({ error: "Error fetching destinations: " + err.message });
  }
});



  
  
  
  
  
  
  
  
  


  
})();
// Route to trigger the CSV import (optional)
/* app.get("/import-csv", async (req, res) => {
  try {
    await importCSVtoMongoDB();
    res.send("CSV imported successfully.");
  } catch (err) {
    res.status(500).send("Error importing CSV: " + err.message);
  }
}); */

/* async function importCSVtoMongoDB() {
  const destinations = []; // Array to store parsed data

  try {
    // Parse the CSV file
    fs.createReadStream(CSV_FILE_PATH)
      .pipe(csv())
      .on("data", (row) => {
        // Format the row to match the database schema
        const formattedRow = {
          id: row.ID,
          name: row["﻿Destination"] || row["Destination"], // Handles variations in the field name
          category: row.Category,
          approximateAnnualTourists: parseInt(row["Approximate Annual Tourists"], 10) || 0,
          currency: row.Currency,
          majorityReligion: row["Majority Religion"],
          famousFoods: row["Famous Foods"],
          language: row.Language,
          bestTimetoVisit: row["Best Time to Visit"],
          costofLiving: row["Cost of Living"], // Keep as a string
          safety: row.Safety,
          culturalSignificance: row["Cultural Significance"],
          description: row["Description"],
          latitude: parseFloat(row.Latitude) || 0,
          longitude: parseFloat(row.Longitude) || 0,
          region: row.Region,
          country: row.Country,
        };

        destinations.push(formattedRow); // Add formatted row to the array
      })
      .on("end", async () => {
        console.log("CSV file successfully processed.");

        // Insert data into the MongoDB collection
        const result = await db.collection("destinations").insertMany(destinations);
        console.log(`${result.insertedCount} records inserted.`);
      });
  } catch (err) {
    console.error("Error during CSV import:", err);
  }
} */
// Route to trigger the CSV import (optional)
/* app.get("/import-csv", async (req, res) => {
  try {
    await importCSVtoMongoDB(); // Call the import function
    res.send("CSV imported successfully.");
  } catch (err) {
    res.status(500).send("Error importing CSV: " + err.message);
  }
}); */