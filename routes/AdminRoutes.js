
const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');// Load environment variables from .env

const Userr = require('../models/UserSchema'); 
const Actionn = require('../models/ActionSchema'); 
const Livreurr = require('../models/LivreurSchema'); 

const mongoose = require("mongoose");
const Livreur = mongoose.model("Livreur",Livreurr);
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






  
  // Get all Livreurs
router.get('/all-Livreur', async (req, res) => {
    
    try{
  
      const allLivreur = await Livreur.find({});
      console.log(allLivreur);
      res.status(200).json(allLivreur);
  
    }catch(error){
  
      res.status(500).json ({message: error.message})
  
    }
  
});







// Associate an action to a Livreur
router.put('/associateActionToLivreur/:livreurId/:actionId', async (req, res) => {
  try {
    const livreurId = req.params.livreurId;
    const actionId = req.params.actionId;

    // Fetch the Livreur and Action by their IDs
    const livreur = await Livreur.findById(livreurId);
    const action = await Action.findById(actionId);

    if (!livreur || !action) {
      return res.status(404).json({ message: 'Livreur or Action not found' });
    }

    if(!action?.confirmed_time) {
        return res.status(404).json({ message: 'Action Not Confirmed Yet' });
    }

    // Save the updated Livreur
    await Action.findOneAndUpdate({_id : actionId},{associatedToLiv : livreurId})

    res.status(200).json({ message: 'Action associated to Livreur successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});








module.exports = router;
  

 