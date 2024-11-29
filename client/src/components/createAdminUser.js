import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcrypt";

const createAdminUser = async () => {
  const uri = "mongodb://localhost:27017"; // Update with your MongoDB URI
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("users"); // Replace with your database name
    const usersCollection = db.collection("users");

    // Check if admin user already exists
    const existingAdmin = await usersCollection.findOne({ username: "admin" });
    if (existingAdmin) {
      console.log("Admin user already exists.");
      return;
    }

    // Create hashed password
    const initialPassword = "password"; // Replace with your desired initial password
    const hashedPassword = await bcrypt.hash(initialPassword, 10);

    // Insert admin user
    const adminUser = {
      _id: new ObjectId(),
      username: "admin", // Designated admin username
      password: hashedPassword,
      isAdmin: true,
      status: "active", // Set status to active by default
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(adminUser);
    console.log("Admin user created successfully:", result.insertedId);
  } catch (error) {
    console.error("Error creating admin user:", error.message);
  } finally {
    await client.close();
  }
};

createAdminUser();
