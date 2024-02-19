
const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');// Load environment variables from .env

const Userr = require('../models/UserSchema'); 
const Actionn = require('../models/ActionSchema'); 
const Livreurr = require('../models/LivreurSchema'); 

const mongoose = require("mongoose");
const Livreur = mongoose.model("Livreurs",Livreurr);
const Action = mongoose.model("Action",Actionn);
const User = mongoose.model("User",Userr);





dotenv.config(); 

// Admin login route
router.post('/login', (req, res) => {
  const { key } = req.body;

  if (key === process.env.ADMIN_KEY) {
    
    res.status(200).json({ message: 'Admin login successful' });
  } else {
    
    res.status(401).json({ message: 'Unauthorized' });
  }
});


// Create livreur profile route
router.post('/createLivreurProfile', async (req, res) => {
    try {
        const data = req.body;
        const liv = new Livreur(data);
        await liv.save();
        res.status(200).json({ message: 'Livreur profile created successfully', livreur: liv });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create Livreur profile', errorMessage: error.message });
    }
});


//la reponse de l'admin  
router.post('/adminResponse', async (req, res) => {
    try {
      const { actionId, currentPriceByAdmin, dateByAdmin } = req.body;
  
      // Find the action by ID
      const action = await Action.findById(actionId);
      // Find the user associated with the action
      const user = await User.findById(action.userId);
  
      if (!action || !user) {
        return res.status(404).json({ message: 'Action not found' });
      }
  
      // Update the action
      const updatedaction = await Action.findByIdAndUpdate(actionId , {currentPriceByAdmin , dateByAdmin  , responded_time : new Date().toISOString() , state : "responded"})
     
      const pushNotif = await  User.findByIdAndUpdate(
         user._id , 
        { $push: { "notifications": {
            actionId: action._id,
            message: 'An admin replied to your action',
            repliedDate: action.responded_time
        } } },
        {safe : true , upsert : true , new : true}
    );

      res.status(200).json({ message: 'Admin response saved successfully' , updatedaction , pushNotif});
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

module.exports = router;




  













