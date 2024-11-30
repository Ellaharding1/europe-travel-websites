const { MongoClient, ObjectId } = require("mongodb");
const express = require("express");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const validator = require("validator");
const Joi = require('joi');




require("dotenv").config(); // Load environment variables
const FRONTEND_URL = process.env.FRONTEND_URL;


const app = express(); // Initialize the app **before** using it
app.use(express.json()); // JSON parser    


const cors = require("cors");


// Middleware setup
console.log("Initializing middleware...");
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // Ensure this matches http://localhost:5173
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"], // Include Authorization header
    credentials: true, // Allow cookies if needed
  })
);


const PORT = process.env.PORT || 3000;
const DATABASE_URI = process.env.DATABASE_URI;

// MongoDB Setup
const client = new MongoClient(DATABASE_URI);

// Initialize and connect to MongoDB
(async () => {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("lab4_database");
    const usersCollection = db.collection("users");
    const listsCollection = db.collection("lists");
    const destinationsCollection = db.collection("destinations");


    // Middleware for authenticating admin
    const authenticateAdmin = async (req, res, next) => {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        console.error("No token provided in Authorization header.");
        return res.status(401).json({ error: "Unauthorized: No token provided" });
      }
    
      try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        console.log("Decoded token:", decoded);
    
        if (decoded.role !== "admin") {
          console.error("User is not an admin. Role:", decoded.role);
          return res.status(403).json({ error: "Forbidden: Admin access required" });
        }
    
        const admin = await db.collection("admins").findOne({ _id: new ObjectId(decoded.id) });
        if (!admin) {
          console.error("Admin not found in database. Admin ID:", decoded.id);
          return res.status(403).json({ error: "Forbidden: Admin not found" });
        }
    
        req.admin = admin;
        next(); // Proceed
      } catch (err) {
        console.error("Error in authenticateAdmin middleware:", err.message, err.stack);
        res.status(500).json({ error: "Internal server error during authentication." });
      }
    };
    
    


    // Define routes here (example)
    app.get("/", (req, res) => {
      res.send("Server is up and running!");
    });
    app.post("/api/add-to-list", async (req, res) => {
      const { listId, destinationId, email } = req.body;
    
      if (!listId || !destinationId || !email) {
        return res.status(400).json({ error: "List ID, destination ID, and email are required." });
      }
    
      try {
        // Add the destination to the list
        const updatedList = await db.collection("lists").findOneAndUpdate(
          { _id: new ObjectId(listId), email: email.trim() },
          {
            $addToSet: { destinationIDs: destinationId }, // Avoid duplicates
            $inc: { destinationCount: 1 }, // Increment destination count
          },
          { returnDocument: "after" } // Return updated list
        );
    
        if (!updatedList.value) {
          return res.status(404).json({ error: "List not found." });
        }
    
        res.status(200).json({
          message: "Destination added successfully!",
          updatedList: updatedList.value,
        });
      } catch (err) {
        console.error("Error in add-to-list:", err.message);
        res.status(500).json({ error: "Internal server error." });
      }
    });
    
    // Register User
    app.post("/register", async (req, res) => {
      const { email, password, nickname } = req.body;
    
      try {
        // Validate email format
        if (!validator.isEmail(email)) {
          return res.status(400).json({ error: "Invalid email format" });
        }
    
        // Check if user already exists
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ error: "User already exists" });
        }
    
        // Hash the password and generate a secret key
        const hashedPassword = await bcrypt.hash(password, 10);
        const secretKey = crypto.randomBytes(32).toString("hex");
    
        // Create the new user object
        const newUser = {
          email,
          password: hashedPassword,
          nickname,
          secretKey,
          isDisabled: false,
          isVerified: false,
        };
    
        // Insert the new user into the database
        const result = await usersCollection.insertOne(newUser);
    
        // Generate a token for email verification
        const token = jwt.sign(
          { id: result.insertedId, email: newUser.email },
          process.env.TOKEN_SECRET, // Use TOKEN_SECRET here
          { expiresIn: "1h" }
        );
        
    
        console.log("TOKEN_SECRET:", process.env.TOKEN_SECRET);
    
        // Create the verification link
        const verificationLink = `${FRONTEND_URL}/verify-email?token=${token}`;
        console.log(`Verification link: ${verificationLink}`);
    
        // Respond with success
        res.status(201).json({
          message: "User registered successfully. Please verify your email.",
          verificationLink,
        });
      } catch (err) {
        console.error("Registration error:", err.message);
        res.status(500).json({ error: "Failed to register user", details: err.message });
      }
    });
    

  // Verify Email
  app.get("/verify-email", async (req, res) => {
    const { token } = req.query;
  
    if (!token) {
      console.error("No token provided.");
      return res.status(400).json({ error: "Token is missing." });
    }
  
    try {
      // Decode the token
      const decodedToken = jwt.decode(token);
      console.log("Decoded token:", decodedToken);
  
      if (!decodedToken || !decodedToken.email) {
        console.error("Invalid token format.");
        return res.status(400).json({ error: "Invalid token format." });
      }
  
      // Find the user
      const user = await usersCollection.findOne({ email: decodedToken.email });
      if (!user) {
        console.error("User not found for email:", decodedToken.email);
        return res.status(404).json({ error: "User not found." });
      }
  
      // Check if the email is already verified
      if (user.isVerified) {
        console.log("Email is already verified for:", decodedToken.email);
        return res.status(200).json({ message: "Email is verified." });
      }
  
      // Verify the token
      jwt.verify(token, process.env.TOKEN_SECRET);
      console.log("Token verified successfully for user:", decodedToken.email);
  
      // Update user's verification status
      const result = await usersCollection.updateOne(
        { email: decodedToken.email },
        { $set: { isVerified: true } }
      );
  
      if (result.modifiedCount === 0) {
        console.error("Failed to update verification status.");
        return res.status(500).json({ error: "Failed to verify email." });
      }
  
      res.status(200).json({ message: "Email verified successfully." });
    } catch (err) {
      console.error("Verification error:", err.message);
      res.status(400).json({ error: "Invalid or expired token." });
    }
  });
  
  
  app.get("/api/public-lists", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
  
      // Fetch public lists with essential fields
      const publicLists = await db.collection("lists")
        .find({ visibility: "public" })
        .sort({ lastEdited: -1 })
        .limit(limit)
        .toArray();
  
      if (!publicLists.length) {
        return res.status(200).json({ lists: [] }); // Gracefully handle no lists
      }
  
      // Fetch destinations and calculate average rating
      const listsWithDetails = await Promise.all(
        publicLists.map(async (list) => {
          const destinations = await db.collection("destinations")
            .find({ id: { $in: list.destinationIDs || [] } }) // Ensure destinationIDs is valid
            .toArray();
  
          // Calculate average rating
          const reviews = list.reviews || [];
          const averageRating =
            reviews.length > 0
              ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
              : null;
  
          return {
            ...list,
            destinations,
            reviews,
            averageRating, // Include calculated average rating
          };
        })
      );
  
      res.status(200).json({ lists: listsWithDetails });
    } catch (err) {
      console.error("Error fetching public lists:", err.message);
  
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to fetch public lists." });
      }
    }
  });
  
  
  // Login User
  app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Find the user by email
      const user = await db.collection("users").findOne({ email });
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }
  
      // Compare the password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid email or password." });
      }
  
      // Check if the user is verified
      if (!user.isVerified) {
        return res.status(403).json({ error: "Please verify your email before logging in." });
      }
  
      // Check if the account is disabled
      if (user.isDisabled) {
        return res.status(403).json({ error: "Account is disabled." });
      }
  
      // Generate a token with user information
      const token = jwt.sign({ id: user._id, email: user.email, status: user.status }, process.env.TOKEN_SECRET, {
        expiresIn: "1h",
      });
  
      // Respond with the token and user status
      res.status(200).json({ message: "Login successful", token, status: user.status });
    } catch (err) {
      console.error("Login error:", err.message);
      res.status(500).json({ error: "Failed to log in." });
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
// Backend: Search for destinations
app.get("/search-destinations", async (req, res) => {
  try {
    const { field, value, page = 1, limit = 5 } = req.query;

    const query = {};
    if (value) {
      query[field] = { $regex: `${value}`, $options: "i" };
    }

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const results = await db
      .collection("destinations")
      .find(query)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .toArray();

    const totalCount = await db.collection("destinations").countDocuments(query);

    res.status(200).json({
      results,
      totalCount,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCount / limitNumber),
    });
  } catch (err) {
    console.error("Error searching destinations:", err.message);
    res.status(500).json({ error: "Error searching destinations: " + err.message });
  }
});
app.post("/api/createList", async (req, res) => {
  try {
    const { email, listName, description = "", visibility = "private" } = req.body;

    // Validate input
    if (!email || !listName) {
      return res.status(400).json({ error: "Email and list name are required." });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    // Trim inputs
    const trimmedListName = (listName || "").trim();
    const trimmedDescription = (description || "").trim();

    // Fetch user to get nickname
    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    const nickname = user.nickname || "Anonymous";

    // Check if a list with the same name already exists for the user
    const existingList = await db.collection("lists").findOne({
      email,
      listName: trimmedListName,
    });
    if (existingList) {
      return res.status(400).json({ error: "List name must be unique for each user." });
    }

    // Check if the user already has 20 lists
    const userListsCount = await db.collection("lists").countDocuments({ email });
    if (userListsCount >= 20) {
      return res.status(400).json({ error: "You cannot create more than 20 lists." });
    }

    // Create new list
    const newList = {
      listName: trimmedListName,
      description: trimmedDescription,
      visibility,
      destinationIDs: [],
      email,
      nickname,
      createdAt: new Date(),
      destinationCount: 0,
    };

    const result = await db.collection("lists").insertOne(newList);

    console.log(`List "${trimmedListName}" created for user "${email}"`);

    res.status(201).json({ message: "List created successfully.", listId: result.insertedId });
  } catch (err) {
    console.error("Error creating list:", err.message);
    res.status(500).json({ error: "Failed to create list: " + err.message });
  }
});

app.post("/api/add-review", authenticateToken, async (req, res) => {
  try {
    console.log("User from token:", req.user); // Ensure the user is attached
    console.log("Request body:", req.body); // Log the incoming request data

    const { listId, rating, comment } = req.body;

    if (!ObjectId.isValid(listId)) {
      return res.status(400).json({ error: "Invalid list ID" });
    }

    const reviewSchema = Joi.object({
      rating: Joi.number().integer().min(1).max(5).required(),
      comment: Joi.string().optional(),
    });

    const { error } = reviewSchema.validate({ rating, comment });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const list = await db.collection("lists").findOne({
      _id: new ObjectId(listId),
      visibility: "public",
    });

    if (!list) {
      return res.status(404).json({ error: "Public list not found" });
    }

    const user = await db.collection("users").findOne({ _id: new ObjectId(req.user.id) });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const review = {
      _id: new ObjectId(),
      userId: req.user.id,
      username: user.nickname,
      rating: Number(rating),
      comment: comment || "",
      createdAt: new Date(),
    };

    const result = await db.collection("lists").updateOne(
      { _id: new ObjectId(listId) },
      { $push: { reviews: review } }
    );

    if (!result.modifiedCount) {
      return res.status(500).json({ error: "Failed to add review." });
    }

    const updatedList = await db.collection("lists").findOne({ _id: new ObjectId(listId) });

    const reviews = updatedList.reviews || [];
    const totalRatings = reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0);
    const averageRating =
      reviews.length > 0 ? parseFloat((totalRatings / reviews.length).toFixed(2)) : 0;

    await db.collection("lists").updateOne(
      { _id: new ObjectId(listId) },
      { $set: { averageRating } }
    );

    console.log("Review added successfully:", review);

    res.status(201).json({ message: "Review added successfully", updatedList });
  } catch (error) {
    console.error("Error in add-review:", error.message);
    res.status(500).json({ error: "Failed to add review." });
  }
});



// Update list selection status
app.patch("/api/select-list", async (req, res) => {
  try {
    const { email, listName } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    // Update the selected state of the list
    await db.collection("lists").updateMany(
      { email },
      { $set: { selected: false } } // Deselect all lists first
    );

    if (listName) {
      // Select the specified list
      const result = await db.collection("lists").updateOne(
        { email, listName },
        { $set: { selected: true } }
      );

      if (result.modifiedCount === 0) {
        return res.status(404).json({ error: "List not found." });
      }
    }

    res.status(200).json({ message: "List selection updated successfully." });
  } catch (err) {
    console.error("Error updating list selection:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
});
// Backend route to get the selected list
app.get("/api/get-selected-list", async (req, res) => {
  try {
    const email = req.query.email; // Expecting email as a query parameter

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    // Fetch the user's lists from the database
    const userLists = await db.collection("lists").find({ email }).toArray();

    // Find the selected list
    const selectedList = userLists.find((list) => list.selected);

    if (!selectedList) {
      return res.status(200).json({ selectedList: null }); // No selected list
    }

    res.status(200).json({ selectedList });
  } catch (err) {
    console.error("Error fetching selected list:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
});
app.patch("/api/deselect-list", async (req, res) => {

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    // Update all lists for the user to set `selected` to false
    const result = await db.collection("lists").updateMany(
      { email }, // Match lists by the user's email
      { $set: { selected: false } } // Set `selected` to false
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "No lists were updated or found." });
    }

    res.status(200).json({ message: "List deselected successfully." });
  } catch (error) {
    console.error("Error in deselect-list route:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});
app.get("/api/getLists", async (req, res) => {
  try {
    const email = req.query.email; // Extract email from query parameters

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    // Fetch the user's lists by email
    const lists = await db.collection("lists").find({ email }).toArray();

    if (!lists || lists.length === 0) {
      return res.status(200).json({ lists: [], selectedList: null }); // Return an empty list if none are found
    }

    // Collect all destination IDs from the lists
    const destinationIds = lists.flatMap((list) => list.destinationIDs || []);
    const uniqueDestinationIds = [...new Set(destinationIds)]; // Remove duplicates

    // Fetch the matching destinations from the database
    const destinations = await db
      .collection("destinations")
      .find({ id: { $in: uniqueDestinationIds } }) // Match the `id` field
      .toArray();

    // Map destination IDs to their details
    const destinationMap = destinations.reduce((map, destination) => {
      map[destination.id] = destination; // Use the `id` as the key
      return map;
    }, {});

    // Find the currently selected list
    const selectedList = lists.find((list) => list.selected) || null;

    // Attach destination details to each list
    const updatedLists = lists.map((list) => ({
      ...list,
      destinationDetails: (list.destinationIDs || []).map(
        (id) => destinationMap[id] || { name: "Unknown" }
      ),
    }));

    res.status(200).json({ lists: updatedLists, selectedList: selectedList?.listName || null });
  } catch (err) {
    console.error("Error fetching lists:", err.message);
    res.status(500).json({ error: "Error fetching lists: " + err.message });
  }
});
app.patch("/api/change-visibility", async (req, res) => {
  try {
    const { listId, visibility } = req.body;

    if (!listId || !visibility) {
      return res.status(400).json({ error: "List ID and visibility are required." });
    }

    if (!["public", "private"].includes(visibility)) {
      return res.status(400).json({ error: "Invalid visibility value. Must be 'public' or 'private'." });
    }

    const result = await db.collection("lists").updateOne(
      { _id: new ObjectId(listId) },
      { $set: { visibility } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "List not found." });
    }

    res.status(200).json({ message: "Visibility updated successfully." });
  } catch (err) {
    console.error("Error changing visibility:", err.message);
    res.status(500).json({ error: "Failed to change visibility: " + err.message });
  }
});
app.delete("/api/deleteList", async (req, res) => {
  try {
    const { listId } = req.body; // Expecting `listId` in the request body

    if (!listId) {
      return res.status(400).json({ error: "List ID is required." });
    }

    const result = await db.collection("lists").deleteOne({ _id: new ObjectId(listId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "List not found." });
    }

    res.status(200).json({ message: "List deleted successfully." });
  } catch (err) {
    console.error("Error deleting list:", err.message);
    res.status(500).json({ error: "Failed to delete list: " + err.message });
  }
});
app.patch("/api/editList", async (req, res) => {
  try {
    const { listId, listName, description, visibility } = req.body;
    destinationCount=destinationCount+1;


    if (!listId || !listName) {
      return res.status(400).json({ error: "List ID and name are required." });
    }

    const result = await db.collection("lists").updateOne(
      { _id: new ObjectId(listId) },
      {
        $set: {
          listName,
          description,
          visibility,
          lastEditedAt: new Date(), // Record the last edited time
          destinationCount,
        },
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "List not found or no changes made." });
    }
    

    res.status(200).json({ message: "List updated successfully." });
  } catch (err) {
    console.error("Error updating list:", err.message);
    res.status(500).json({ error: "Failed to update list: " + err.message });
  }
});
// Update List Description
app.patch("/api/editDescription", async (req, res) => {
  try {
    const { listId, description } = req.body;

    if (!listId || typeof description !== "string") {
      return res
        .status(400)
        .json({ error: "List ID and description are required." });
    }

    const result = await db.collection("lists").updateOne(
      { _id: new ObjectId(listId) }, // Find the list by ID
      {
        $set: {
          description, // Update the description
          lastEdited: new Date(), // Record the last edited time
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "List not found." });
    }

    res.status(200).json({ message: "Description updated successfully." });
  } catch (err) {
    console.error("Error updating description:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
});
app.patch("/api/remove-destination", async (req, res) => {
  try {
    const { listId, destinationId } = req.body;

    if (!listId || !destinationId) {
      return res.status(400).json({ error: "List ID and Destination ID are required." });
    }

    const result = await db.collection("lists").updateOne(
      { _id: new ObjectId(listId) }, // Match the list by its ID
      { $pull: { destinationIDs: destinationId } } // Remove the destination from the list
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "List or Destination not found." });
    }

    res.status(200).json({ message: "Destination removed successfully!" });
  } catch (err) {
    console.error("Error removing destination:", err.message);
    res.status(500).json({ error: "Failed to remove destination: " + err.message });
  }
});
app.patch("/api/updateLastEdited", async (req, res) => {
  try {
    const { listId } = req.body;

    if (!listId) {
      return res.status(400).json({ error: "List ID is required." });
    }

    const result = await db.collection("lists").updateOne(
      { _id: new ObjectId(listId) },
      { $set: { lastEdited: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "List not found." });
    }

    res.status(200).json({ message: "Last edited timestamp updated successfully." });
  } catch (err) {
    console.error("Error updating last edited timestamp:", err.message);
    res.status(500).json({ error: "Internal server error." });
  }
});
app.patch("/api/update-list", async (req, res) => {
  try {
    const { listId, email, updatedFields } = req.body; // Expect updatedFields to be an object with fields to update

    if (!listId || !email || !updatedFields) {
      return res.status(400).json({ error: "List ID, email, and fields to update are required." });
    }


    const validFields = ["listName", "description", "visibility", "destinationIDs"]; // Fields allowed to update
    const updateData = {};

    for (const key in updatedFields) {
      if (validFields.includes(key)) {
        updateData[key] = updatedFields[key];
      }
    }

    // Update the lastEditedAt field to the current timestamp
    updateData.lastEditedAt = new Date();

    const result = await db.collection("lists").updateOne(
      { _id: new ObjectId(listId), email },
      { $set: updateData }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "List not found or no changes made." });
    }

    res.status(200).json({ message: "List updated successfully." });
  } catch (err) {
    console.error("Error updating list:", err.message);
    res.status(500).json({ error: "Failed to update list: " + err.message });
  }
});

app.get("/api/test-token", authenticateToken, (req, res) => {
  res.json({ message: "Token is valid", user: req.user });
});



// Grant admin privileges
// Grant Admin Privileges
app.patch("/api/admin/grant", authenticateAdmin, async (req, res) => {
  const { email } = req.body;
  const username = email.split("@")[0];

  try {
    // Find the user in the users collection
    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Update the user's isAdmin field in the users collection
    await db.collection("users").updateOne(
      { email },
      { $set: { isAdmin: true } }
    );

    // Add the user to the admins collection
    await db.collection("admins").insertOne({
      username,
      email,
      password: user.password, // Include hashed password
      grantedAt: new Date(),
    });

    res.status(200).json({ message: `${username} is now an admin.` });
  } catch (error) {
    console.error("Error granting admin privileges:", error.message);
    res.status(500).json({ error: "Failed to grant admin privileges." });
  }
});


// Revoke Admin Privileges
app.patch("/api/admin/revoke", authenticateAdmin, async (req, res) => {
  const { email } = req.body;
  const username = email.split("@")[0];

  try {
    // Update the user's isAdmin field in the users collection
    await db.collection("users").updateOne(
      { email },
      { $set: { isAdmin: false } }
    );

    // Remove the user from the admins collection
    await db.collection("admins").deleteOne({ email });

    res.status(200).json({ message: `Admin privileges revoked for ${username}.` });
  } catch (error) {
    console.error("Error revoking admin privileges:", error.message);
    res.status(500).json({ error: "Failed to revoke admin privileges." });
  }
});





// Manage review visibility
app.patch("/api/admin/review", authenticateAdmin, async (req, res) => {
  const { reviewId, visibility } = req.body;

  try {
    const result = await db.collection("reviews").updateOne(
      { _id: new ObjectId(reviewId) },
      { $set: { visibility } }
    );
    if (!result.modifiedCount) return res.status(404).json({ error: "Review not found" });

    res.status(200).json({ message: `Review visibility updated to ${visibility}` });
  } catch (err) {
    console.error("Error updating review visibility:", err.message);
    res.status(500).json({ error: "Failed to update review visibility" });
  }
});

// Admin login route
// Admin Login
app.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await db.collection("admins").findOne({ username });
    if (!admin) return res.status(403).json({ error: "Invalid credentials" });

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) return res.status(403).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, role: "admin" }, // Include role
      process.env.TOKEN_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    console.error("Admin login error:", err.message);
    res.status(500).json({ error: "An error occurred during login" });
  }
});

// Fetch Users (Admin Protected Route)
app.get("/api/admin/users", authenticateAdmin, async (req, res) => {
  try {
    const users = await db.collection("users").find({}).toArray(); // Fetch all users
    res.status(200).json(users); // Send users as JSON response
  } catch (err) {
    console.error("Error fetching users:", err.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});



app.patch("/api/admin/user", authenticateAdmin, async (req, res) => {
  const { userId, status } = req.body;
  console.log("TESTTT")

  if (!["active", "deactivated"].includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  try {
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { status } }
    );
    if (!result.modifiedCount) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: `User status updated to ${status}` });
  } catch (err) {
    console.error("Error updating user status:", err.message);
    res.status(500).json({ error: "Failed to update user status" });
  }
});




app.get("/api/admin/status", authenticateAdmin, async (req, res) => {
  try {
    res.status(200).json({ isAdmin: true });
  } catch (err) {
    console.error("Error fetching admin status:", err.message);
    res.status(500).json({ error: "Failed to fetch admin status" });
  }
});

// Check if the user is an admin
app.get("/api/check-admin", authenticateToken, async (req, res) => {
  try {
    res.status(200).json({
      isAdmin: req.user.isAdmin,
      status: req.user.status,
    });
  } catch (err) {
    console.error("Error in check-admin endpoint:", err.message);
    res.status(500).json({ error: "Failed to check admin status." });
  }
});




app.get("/api/user-profile", authenticateToken, async (req, res) => {
  try {
    const { id } = req.user;

    const user = await db.collection("users").findOne({ _id: new ObjectId(id) });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Return user status and isAdmin property
    res.status(200).json({
      id: user._id,
      email: user.email,
      nickname: user.nickname,
      status: user.status, // 'active' or other statuses
      isAdmin: user.isAdmin || false, // Ensure boolean
    });
  } catch (err) {
    console.error("Error fetching user profile:", err.message);
    res.status(500).json({ error: "Failed to fetch user profile." });
  }
});


app.get("/api/admin", authenticateToken, (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: "Admin privileges required." });
  }

  res.status(200).json({ message: "Welcome, admin!" });
});





app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Middleware for authentication
async function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    // Decode and verify the token
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

    // Fetch the user from the database
    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.id) });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Check if the user's account is active
    if (user.status !== "active") {
      return res.status(403).json({ error: "Account is not active. Access denied." });
    }

    // Attach user information to the request object
    req.user = {
      id: user._id,
      email: user.email,
      nickname: user.nickname,
      isAdmin: user.isAdmin || false,
      status: user.status,
    };

    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    console.error("Token verification error:", err.message);
    res.status(403).json({ error: "Invalid or expired token." });
  }
}









} catch (err) {
  console.error("Failed to connect to MongoDB:", err.message);
  process.exit(1);
}
  
})();