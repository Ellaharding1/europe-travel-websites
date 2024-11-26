const { MongoClient, ObjectId } = require("mongodb");
const express = require("express");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const validator = require("validator");

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
        const updatedList = await db.collection("lists").findOneAndUpdate(
          { _id: new ObjectId(listId), email: email.trim() },
          { $addToSet: { destinationIDs: destinationId } },
          { returnDocument: "after" }
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

      const token = jwt.sign(
        { id: newUser._id, email: newUser.email },
        newUser.secretKey,
        { expiresIn: "1h" }
      );
      
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

    if (!email || !listName) {
      return res.status(400).json({ error: "Email and list name are required." });
    }

    // Trim inputs
    const trimmedListName = listName.trim();
    const trimmedDescription = description.trim();

    // Check if a list with the same name already exists for the user
    const existingList = await db.collection("lists").findOne({ email, listName: trimmedListName });
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



app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});



} catch (err) {
  console.error("Failed to connect to MongoDB:", err.message);
  process.exit(1);
}
  
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
}); 


// Middleware for token authentication
async function authenticateToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  try {
    const decoded = jwt.decode(token); // Decode to get user ID
    if (!decoded?.id) {
      return res.status(403).json({ error: "Invalid token payload." });
    }

    const user = await usersCollection.findOne({ _id: new MongoClient.ObjectID(decoded.id) });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    jwt.verify(token, user.secretKey, (err, verified) => {
      if (err) return res.status(403).json({ error: "Invalid token." });
      req.user = verified; // Attach the verified user info to the request
      next();
    });
  } catch (err) {
    console.error("Error verifying token:", err.message);
    res.status(500).json({ error: "Failed to authenticate token." });
  }
}*/

// Middleware
 // Start the server

  