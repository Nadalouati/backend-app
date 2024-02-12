// ActionRoutes.js
const express = require('express');
const router = express.Router();

const Action = require("../models/ActionSchema");
const User = require("../models/UserSchema");

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


// Get all actions(yest79ha l'admin)
router.get('/all-actions', async (req, res) => {
    
        try{
      
          const allActions = await Action.find({});
          res.status(200).json(allActions);
      
        }catch(error){
      
          res.status(500).json ({message: error.message})
      
        }
      
});

// Get action by ID
router.get('/action/:id', async (req, res) => {
    
        try{
          const{id} = req.params;
      
          const ActionById = await Action.findById(id);
          res.status(200).json(ActionById);
      
        } catch(error){
      
          res.status(500).json ({message: error.message})
      
        }
      
});

// Update action
router.put('/update-action/:id', async (req, res) => {
    
        try{
          const{id} = req.params;
          const action = await Action.findByIdAndUpdate(id, req.body);
          // we cannot find any action in db
          if(!action){
            return res.status(404).json({message: `cannot find any action with ID ${id}`})
          }
      
          //afficher les actions apres la modofication
          const updatedaction = await Action.findById(id);
          res.status(200).json(updatedaction);
      
        }catch(error){
          res.status(500).json ({message: error.message})
        }
      });
      

// Delete action
router.delete('/action/:id', async (req, res) => {
        try{
      
          const{id} = req.params;
          const action = await Action.findByIdAndDelete(id);
          if(!action){
            return res.status(404).json({message: `cannot find any action with ID ${id}`})
          }
          res.status(200).json(action);
      
        }catch(error){
          res.status(500).json ({message: error.message})
        }
      
      
});

module.exports = router;
