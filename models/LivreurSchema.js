const mongoose = require('mongoose');

const Livreur = new mongoose.Schema({
    username: String,
    password: String,
    nom: String,
    prenom: String,
    numTelephone: String,
    email: String,
    notifications: {
        type: Array,
        default: []
    },
    actions: {
        type: Array,
        default: []
    },
   
});

module.exports = Livreur;
