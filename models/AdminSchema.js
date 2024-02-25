const mongoose = require('mongoose');


const Admin = new mongoose.Schema({
    email: String,
    password: String,
    nom: String,
    prenom: String,
    email: String,
    notifications: {
        type: Array,
        default: []
    },
  

});

module.exports = Admin;
