const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); 
const EntrepriseSchema = require('../models/EntrepriseSchema');

const mongoose = require('mongoose');
const Entreprise = mongoose.model('Entreprise', EntrepriseSchema);

// Update Entreprise
router.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const updateFields = req.body;

  try {
    const updatedEntreprise = await Entreprise.findOneAndUpdate(
      {_id : id},
      updateFields,
      { new: true }
    );

    if (!updatedEntreprise) {
      return res.status(404).json({ message: 'Entreprise not found' });
    }

    res.status(200).json(updatedEntreprise);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Create Action for Entreprise
// router.post('/create-action/:id', async (req, res) => {
//   const { id } = req.params;
//   const { actionType, description } = req.body;

//   try {
//     const entreprise = await Entreprise.findById(id);

//     if (!entreprise) {
//       return res.status(404).json({ message: 'Entreprise not found' });
//     }

//     entreprise.actions.push({ actionType, description });
//     await entreprise.save();

//     res.status(201).json({
//       message: 'Action created successfully',
//       action: entreprise.actions[entreprise.actions.length - 1],
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });

// Login Entreprise
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const entreprise = await Entreprise.findOne({ email });

    if (!entreprise) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // const passwordMatch = await bcrypt.compare(password, entreprise.password);

    if (password == entreprise.password) {
      // Passwords match, login successful
      res.status(200).json({ message: 'Entreprise login successful' });
    } else {
      // Passwords don't match
      res.status(401).json({ message: 'Unauthorized' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
