// ActionRoutes.js
const express = require('express');
const router = express.Router();

const ActionSchema = require("../models/ActionSchema");
const UserSchema = require("../models/UserSchema");

const mongoose = require("mongoose");
const User = mongoose.model("Users",UserSchema)
const EntrepriseSchema = require('../models/EntrepriseSchema');
const Entreprise = mongoose.model('Entreprise', EntrepriseSchema);
const Action = mongoose.model("Actions",ActionSchema)

// Create an action by user
router.post('/user/create-action', async (req, res) => {
   
        try {
            
            const action = new Action(req.body)
            const savedAction = await action.save()
    
            
            await User.findOneAndUpdate(
                { "_id": savedAction.userId } ,
                {$push: { actions:  savedAction._id } }
            )
                
            res.json(savedAction)
    
        } catch (error) {
            res.json({error : "500 server error"})
        }   
});

// Create an action by Entreprise
router.post('/entreprise/create-action', async (req, res) => {
    
    try {
        console.log(req.body);
        const action = new Action(req.body)
        const savedAction = await action.save()
        
        await Entreprise.findOneAndUpdate(
            { "_id": savedAction.entrepriseID } ,
            {$push: { actions:  savedAction._id } }
        )
            
        res.json(savedAction)

    } catch (error) {
        res.json({error : "500 server error"})
    }   
});
// Get all actions(for admin)
router.get('/all-actions', async (req, res) => {
    
        try{
      
          const allActions = await Action.find({});
          res.status(200).json(allActions);
      
        }catch(error){
      
          res.status(500).json ({message: error.message})
      
        }
      
});

// Get action by ID
router.get('/get-actions/:id', async (req, res) => {
    
          try {
            const {id} = req.params;

            const actionsByUserId = await Action.find({ userId : id });

                res.status(200).json(actionsByUserId);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
              
});

// Update action
router.put('/update-action/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const action = await Action.findById(id);

      if (!action) {
          return res.status(404).json({ message: `Cannot find any action with ID ${id}` });
      }

      const docCreatedTimeString = action.create_time;
      const docCreatedTime = new Date(docCreatedTimeString);
      const currentTime  = Date.now();
      const timeDifference = currentTime - docCreatedTime.getTime();
      const twoHoursInMilliseconds = 2 * 60 * 60 * 1000;
  
      if (timeDifference < twoHoursInMilliseconds) {

          const updatedAction = await Action.findByIdAndUpdate(id, req.body, { new: true });
          res.status(200).json(updatedAction);

      } else {
          
          res.status(400).json({ message: 'Cannot update action after 2 hours of creation.' });
      }

  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

module.exports = router;
      

// Delete action
router.delete('/delete-action/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const action = await Action.findById(id);

      if (!action) {
          return res.status(404).json({ message: `Cannot find any action with ID ${id}` });
      }

      const create_time = action.create_time; 

      const Now_time = new Date();
      const timeDifference = Now_time - create_time; 

        //const twoHours = 2 * 60 * 60 * 1000 ; 
        //timeDifference <= twoHours
      if (true) {
          
          const deletedAction = await Action.findByIdAndDelete(id);
          res.status(200).json(deletedAction);
      } else {
          
          res.status(403).json({ message: 'Cannot delete action after 2 hours of creation.' });
      }
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

module.exports = router;
