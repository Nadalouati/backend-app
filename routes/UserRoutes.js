// UserRoutes.js
const express = require('express');
const router = express.Router();

const User = require("../models/UserSchema");

// Signup endpoint
router.post('/signup', async (req, res) => {
  
        const { username , password} = req.body;
        
        try {
          // Check if the user already exists
          const existingUser = await User.findOne({ username });
      
          if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
          }
      
          // Hash the password before saving it to the database
          const hashedPassword = await bcrypt.hash(password, 10);
      
          // Create a new user
          const newUser = new User({ ...req.body, password: hashedPassword });
          await newUser.save();
      
          res.status(201).json({ message: 'User created successfully' });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Internal server error' });
        }
      });


// Login endpoint
router.post('/login', async (req, res) => {
    
        const { username, password } = req.body;
      
        try {
          // Find the user in the database
          const user = await User.findOne({ username });
          if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
          }
      
          // Compare the provided password with the hashed password in the database
          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
          }
      
          // Generate a JWT token for authentication
          const token = jwt.sign({ userId: user._id }, 'Secret-key', { expiresIn: '8554h' });
      
          res.status(200).json({ message: 'Login successful', token });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Internal server error' });
        }
      });


module.exports = router;
