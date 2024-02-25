const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const LivreurSchema = require("../models/LivreurSchema");

const mongoose = require("mongoose");
const ActionSchema = require('../models/ActionSchema');
const Action = mongoose.model("Action",ActionSchema)
const Livreur = mongoose.model("Livreur", LivreurSchema);

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const livreur = await Livreur.findOne({ username });

    if (!livreur) {
      return res.status(401).json({ message: 'Livreur not found' });
    }

    const isPasswordValid = password == livreur?.password

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ livreurId: livreur._id }, process.env.ADMIN_KEY, { expiresIn: '8554h' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Check if Livreur has actions to do
router.get('/checkActions/:livreurId', async (req, res) => {
  try {
    const livreurId = req.params.livreurId;

    // Fetch the Livreur by ID
    const livreur = await Livreur.findById(livreurId);

    if (!livreur) {
      return res.status(404).json({ message: 'Livreur not found' });
    }

    // Check if the Livreur has any actions
    const hasActions = Action.find({associatedToLiv : livreurId})

    res.status(200).json({ hasActions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Update Livreur's profile
router.put('/updateProfile/:livreurId', async (req, res) => {
  try {
    const livreurId = req.params.livreurId;
    const { nom, prenom, numTelephone, email } = req.body;

    // Fetch the Livreur by ID
    const livreur = await Livreur.findById(livreurId);

    if (!livreur) {
      return res.status(404).json({ message: 'Livreur not found' });
    }

    // Update Livreur's profile
    livreur.nom = nom || livreur.nom;
    livreur.prenom = prenom || livreur.prenom;
    livreur.numTelephone = numTelephone || livreur.numTelephone;
    livreur.email = email || livreur.email;

    // Save the updated Livreur
    await livreur.save();

    res.status(200).json({ message: 'Profile updated successfully', livreur });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});






module.exports = router;
























module.exports = router;
