const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const EntrepriseSchema = require("../models/EntrepriseSchema");

const mongoose = require("mongoose");
const Entreprise = mongoose.model("Entreprise", EntrepriseSchema);

// Update Entreprise
router.put("/update/:id", async (req, res) => {
  try {
    const {id} = req.params;

    const { password,name, email } = req.body;

    // Fetch the Livreur by ID
    const entreprise = await Entreprise.findById(id);

    if (!entreprise) {
      return res.status(404).json({ message: "entreprise not found" });
    }

    
    entreprise.name = name || entreprise.name;
   
    entreprise.email = email || entreprise.email;

    const hashedPassword = await bcrypt.hash(password, 10);

    entreprise.password = hashedPassword || entreprise.password;
    // Save the updated Livreur
    await entreprise.save();

    res.status(200).json({ message: "Profile updated successfully", entreprise });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// Login Entreprise
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {

    const entreprise = await Entreprise.findOne({ email });

    if (!entreprise) {
      return res.status(401).json({ message: "Unauthorized" });
    }

   const passwordMatch = await bcrypt.compare(password, entreprise.password);

    if (passwordMatch) {
      // Passwords match, login successful
      res.status(200).json({ message: "Entreprise login successful" ,  id : entreprise._id , name : entreprise.name});
    } else {
      // Passwords don't match
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Entreprise update notif
router.put("/update-entreprise-notif/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = req.body;

    const entreprise = await Entreprise.findByIdAndUpdate(id, {notifications : data});

    if (!entreprise) {
      return res
        .status(404)
        .json({ message: `Cannot find any entreprise with ID ${id}` });
    }

    res.status(200).json({ ...entreprise });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
