const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

const PORT = process.env.PORT || 5000;


const userRoutes = require('./routes/UserRoutes');
const actionRoutes = require('./routes/ActionRoutes');


app.use(bodyParser.json());

app.use('/user', userRoutes); 
app.use('/action', actionRoutes); 


 // Start the server
 app.listen(PORT, async () => {
    await mongoose.connect('mongodb+srv://wassali:wassali123"@wassali.zbc9jzr.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true , dbName :"wassali" });
});
 