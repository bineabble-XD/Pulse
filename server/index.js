import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import UserModel from "./models/UserModel.js";

const app = express();
app.use(cors());
app.use(express.json());

// --- DB connection ---
const connectionString =
  "mongodb+srv://admin:admin@students.ll5gldx.mongodb.net/PulseDb?appName=students";

mongoose
  .connect(connectionString)
  .then(() => {
    console.log("Database Connected..");

    app.listen(6969, () => {
      console.log("Server connected at port number 6969..");
    });
  })
  .catch((error) => {
    console.log("Database connection error: " + error);
  });

/* ========== ROUTES ========== */

// POST /register  -> create user
app.post("/register", async (req, res) => {
  try {
    const { fname, lname, email, password, address, phnum, age, gender } =
      req.body;

    if (!fname || !lname || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // check if user already exists
    const existing = await UserModel.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await UserModel.create({
      fname,
      lname,
      email,
      password, // (plain text, fine for school project)
      address,
      phnum,
      age,
      gender,
    });

    return res.status(201).json({
      message: "Registered successfully",
      user,
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error during register" });
  }
});

// POST /login  -> check credentials
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.password !== password) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    return res.json({
      message: "Login successful",
      user,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error during login" });
  }
});
