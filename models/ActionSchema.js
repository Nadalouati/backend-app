const mongoose = require('mongoose');

const ActionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    type: { type: String, enum: ['demenagement', 'livraison'] }, 
    state: { type: String, default: 'waiting' }, 
    create_time: { type: Date, default: Date.now },
    responded_time: { type: Date, default: null },
    confirmed_time: { type: Date, default: null },
    declined_time: { type: Date, default: null },
    currentPriceByAdmin: { type: Number }, 
    dateByAdmin: { type: Date }
});

module.exports = ActionSchema;
