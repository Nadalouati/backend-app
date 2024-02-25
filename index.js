const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



const app = express();

const PORT = process.env.PORT || 5000;


const userRoutes = require('./routes/UserRoutes');
const actionRoutes = require('./routes/ActionRoutes');
const adminRoutes = require('./routes/AdminRoutes');
const livreurRoutes = require('./routes/LivreurRoutes');
const entrepriseRoutes = require('./routes/EntrepriseRoutes');

app.use(bodyParser.json());

app.use('/user', userRoutes); 
app.use('/action', actionRoutes); 
app.use('/admin', adminRoutes);
app.use('/livreur', livreurRoutes);
app.use('/entreprise', entrepriseRoutes);


 // Start the server
 app.listen(PORT, async () => {
    console.log("server is runing on"+PORT)
    await mongoose.connect('mongodb+srv://wassali:wassali123"@wassali.zbc9jzr.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true , dbName :"wassali" });
});
 









