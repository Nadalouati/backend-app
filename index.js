const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

const PORT = process.env.PORT || 5000;


// Replace 'your_mongo_db_uri' with your MongoDB URI


const UserSchema = require("./models/UserSchema")
const User = mongoose.model('Users', UserSchema);

app.use(bodyParser.json());

// Signup endpoint
app.post('/signup', async (req, res) => {

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
app.post('/login', async (req, res) => {
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

// user action 
const ActionSchema = require("./models/ActionSchema")
const Action = mongoose.model('Actions', ActionSchema);

// create an action by user
app.post('/user/create-action', async (req,res)=> {
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
})


 // Start the server
 app.listen(PORT, async () => {
    await mongoose.connect('mongodb+srv://wassali:wassali123"@wassali.zbc9jzr.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true , dbName :"wassali" });
});
 