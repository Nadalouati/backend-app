const mongoose = require('mongoose');

const Entreprise = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      actions: {
        type: Array,
        default: []
    },
});

module.exports = Entreprise ;
