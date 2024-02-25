const mongoose = require('mongoose');

const ActionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    entrepriseID:{ type: mongoose.Schema.Types.ObjectId, ref: 'Entreprise' },
    associatedToLiv: { type: mongoose.Schema.Types.ObjectId, ref: 'Livreur' },
    type: { type: String, enum: ['demenagement', 'livraison'] }, 
    state: { type: String, default: 'waiting' }, 
    create_time: { type: Date, default: Date.now },
    responded_time: { type: Date, default: null },
    confirmed_time: { type: Date, default: null },
    declined_time: { type: Date, default: null },
    currentPriceByAdmin: { type: Number },
    dateByAdmin: { type: Date },
    creatorRole : {type: String, enum: ['entreprise', 'user'] },
    delivered : {type : Boolean},
    deliveredDate : {type : Date}
});

module.exports = ActionSchema;
