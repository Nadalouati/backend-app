const mongoose = require('mongoose');


const User = new mongoose.Schema({
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
    ratingStars: {
        type: Number,
        min: 0,
        max: 5
    }
});

module.exports = User;
