// UserRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AdminSchema = require("../models/AdminSchema");
const UserSchema = require("../models/UserSchema");
const ActionSchema = require("../models/ActionSchema");

const mongoose = require("mongoose");
const User = mongoose.model("Users", UserSchema);
const Admin = mongoose.model("Admin", AdminSchema);
const Action = mongoose.model("Action", ActionSchema);


// Signup endpoint
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({ ...req.body, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// Login endpoint
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user in the database
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate a JWT token for authentication
    const token = jwt.sign({ userId: user._id }, "Secret-key", {
      expiresIn: "8554h",
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// User update himself

router.put("/update-user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { actions, notifications, ...restOfUpdates } = req.body;


    if (actions !== undefined || notifications !== undefined) {
      return res
        .status(400)
        .json({ message: "Cannot update actions or notifications directly." });
    }
// find user id and check if he is the same or not
    const user = await User.findByIdAndUpdate(id, restOfUpdates);

    if (!user) {
      return res
        .status(404)
        .json({ message: `Cannot find any user with ID ${id}` });
    }

    res.status(200).json({ ...user, ...restOfUpdates });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Endpoint to get ratingStars
router.get("/get-rating/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res
        .status(404)
        .json({ message: `Cannot find any user with ID ${id}` });
    }

    const ratingStars = user.ratingStars;
    res.status(200).json({ ratingStars });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Endpoint to update ratingStars
router.put("/update-rating/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { ratingStars } = req.body;

    if (id !== id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this user." });
    }

    if (ratingStars < 0 || ratingStars > 5) {
      return res
        .status(400)
        .json({ message: "RatingStars must be between 0 and 5." });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { ratingStars },
      { new: true },
    );

    if (!user) {
      return res
        .status(404)
        .json({ message: `Cannot find any user with ID ${id}` });
    }

    res.status(200).json({ ratingStars: user.ratingStars });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Confirm or Decline the admin's price and date
router.put("/confirmOrDeclineAction/:actionId", async (req, res) => {
  try {
    const actionId = req.params.actionId;
    const { confirmation } = req.body;

    // Fetch the Action by ID
    const action = await Action.findById(actionId);

    if (!action) {
      return res.status(404).json({ message: "Action not found" });
    }

    // Update the action based on user confirmation
    if (confirmation == true) {
      action.state = "confirmed";
      action.confirmed_time = new Date();
    } else {
      action.state = "declined";
      action.declined_time = new Date();
    }

    // Save the updated action
    await action.save();

    await Admin.findOneAndUpdate(
      {},
      {
        $push: {
          notifications: {
            title: "user confirmation",
            actionId,
            confirmation,
            actioState: action.state,
          },
        },
      },
    );

    res.status(200).json({ message: "Action updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
