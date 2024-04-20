// ActionRoutes.js
const express = require('express');
const router = express.Router();

const ActionSchema = require("../models/ActionSchema");
const UserSchema = require("../models/UserSchema");

const mongoose = require("mongoose");
const User = mongoose.model("Users",UserSchema)
const EntrepriseSchema = require('../models/EntrepriseSchema');
const Admin = mongoose.model("Admins",require('../models/AdminSchema')) ;
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

// Get actions by userID
router.get('/get-actions/:id', async (req, res) => {
    
          try {
            const {id} = req.params;

            const actionsByUserId = await Action.find({ userId : id });

                res.status(200).json(actionsByUserId);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
              
});

// Get action by ID
router.get('/get-action/:id', async (req, res) => {
    
    try {
      const {id} = req.params;

      const action = await Action.find({ _id : id });

          res.status(200).json(action);
      } catch (error) {
          res.status(500).json({ message: error.message });
      }
        
});

// Get pending by ID
router.get('/pending', async (req, res) => {
    
    try {

      const pendingActions = await Action.find({ state : "pending" });

          res.status(200).json(pendingActions);
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

  
      if (!action.confirmed_time) {

          const updatedAction = await Action.findByIdAndUpdate(id, req.body, { new: true });
          res.status(200).json(updatedAction);

      } else {
          
          res.status(400).json({ message: 'Cannot update action after confirmation' });
      }

  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

router.put('/update-conf/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const action = await Action.findById(id);
  
        if (!action) {
            return res.status(404).json({ message: `Cannot find any action with ID ${id}` });
        }
  
    
        
  
            const updatedAction = await Action.findByIdAndUpdate(id, req.body, { new: true });
            const acctype = updatedAction?.type === "livraison" ? "userResponseLiv" : "userResponseDem"
            await Admin.findOneAndUpdate({},{ $push: { notifications: {
                actionId : updatedAction._id,
                repliedDate : new Date().toDateString(),
                message : req.body?.confirmed_time ? 'Client Confirmed' : "Client Declined",
                notifType : acctype,
                seen : false
            } } },{new : true});
            
            res.status(200).json(updatedAction);
  
        
  
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
  });
// Delete action
router.delete('/delete-action/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const action = await Action.findById(id);

      if (!action) {
          return res.status(404).json({ message: `Cannot find any action with ID ${id}` });
      }

      if (action.confirmed_time) {
          
          const deletedAction = await Action.findByIdAndDelete(id);
          res.status(200).json(deletedAction);
      } else {
          
          res.status(403).json({ message: 'Cannot delete action after confirmation' });
      }
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

module.exports = router;
