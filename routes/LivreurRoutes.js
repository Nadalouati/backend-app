const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const LivreurSchema = require("../models/LivreurSchema");

const mongoose = require("mongoose");
const ActionSchema = require("../models/ActionSchema");
const Action = mongoose.model("Action", ActionSchema);
const Livreur = mongoose.model("Livreur", LivreurSchema);


// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const livreur = await Livreur.findOne({ username });

    if (!livreur) {
      return res.status(401).json({ message: "Livreur not found" });
    }

    const isPasswordValid = password == livreur?.password;

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ livreurId: livreur._id }, process.env.ADMIN_KEY, {
      expiresIn: "8554h",
    });

    res.status(200).json({ message: "Login successful", token , livreurId : livreur._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Check if Livreur has actions to do
router.get("/checkActions/:livreurId", async (req, res) => {
  try {
    const livreurId = req.params.livreurId;

    // Fetch the Livreur by ID
    const livreur = await Livreur.findById(livreurId);
    
    if (!livreur) {
      return res.status(404).json({ message: "Livreur not found" });
    }

    // Check if the Livreur has any actions
    const hasActions = await Action.find({ associatedToLiv: livreurId });
    res.status(200).json({ hasActions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update Livreur's profile
router.put("/updateProfile/:livreurId", async (req, res) => {
  try {
    const livreurId = req.params.livreurId;
    const { nom, prenom, numTelephone, email } = req.body;

    // Fetch the Livreur by ID
    const livreur = await Livreur.findById(livreurId);

    if (!livreur) {
      return res.status(404).json({ message: "Livreur not found" });
    }

    // Update Livreur's profile
    livreur.nom = nom || livreur.nom;
    livreur.prenom = prenom || livreur.prenom;
    livreur.numTelephone = numTelephone || livreur.numTelephone;
    livreur.email = email || livreur.email;

    // Save the updated Livreur
    await livreur.save();

    res.status(200).json({ message: "Profile updated successfully", livreur });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Endpoint to mark an action as delivered (changing delivered to true and deliveredDate to the current Date)
router.post("/markDelivered/:actionId", async (req, res) => {
  try {
    const { actionId } = req.params;

    // Find the action by ID
    const action = await Action.findById(actionId);

    if (!action) {
      return res.status(404).json({ error: "Action not found" });
    }

    // Update the action with delivered information
    action.delivered = true;
    action.deliveredDate = new Date();
    action.state = "delivered";

    // Save the updated action
    await action.save();

    // Find the livreur by ID and update its actions
    const livreur = await Livreur.findById(action.associatedToLiv);
    if (livreur) {
      const updatedActions = livreur.actions.map((livreurAction) => {
        if (livreurAction.equals(action._id)) {
          return {
            ...livreurAction,
            delivered: true,
            deliveredDate: action.deliveredDate,
          };
        }
        return livreurAction;
      });

      // Update the livreur's actions
      livreur.actions = updatedActions;
      await livreur.save();
    }

    res.json({ message: "Action marked as delivered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/markCancled/:actionId", async (req, res) => {
  try {
    const { actionId } = req.params;

    // Find the action by ID
    const action = await Action.findById(actionId);

    if (!action) {
      return res.status(404).json({ error: "Action not found" });
    }

    // Update the action with delivered information
    action.delivered = false;
    action.cancledDate = new Date();
    action.state = "cancled";
    action.cancledReason = req.body.cancledReason
    console.log(req.body.cancledReason);
    // Save the updated action
    await action.save();

    // Find the livreur by ID and update its actions
    const livreur = await Livreur.findById(action.associatedToLiv);
    if (livreur) {
      const updatedActions = livreur.actions.map((livreurAction) => {
        if (livreurAction.equals(action._id)) {
          return {
            ...livreurAction,
            delivered: false,
            cancledDate: action.cancledDate,
          };
        }
        return livreurAction;
      });

      // Update the livreur's actions
      livreur.actions = updatedActions;
      await livreur.save();
    }

    res.json({ message: "Action marked as cancled successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;

