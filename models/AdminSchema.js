const mongoose = require('mongoose');

const Admin = new mongoose.Schema({
    username: String,
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
