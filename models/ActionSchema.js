const mongoose = require('mongoose');

const ActionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName : {type :String},
    entrepriseName : {type :String},
    entrepriseID:{ type: mongoose.Schema.Types.ObjectId, ref: 'Entreprise' },
    associatedToLiv: { type: mongoose.Schema.Types.ObjectId, ref: 'Livreur' },
    type: { type: String, enum: ['demenagement', 'livraison'] }, 
    state: { type: String, default: 'pending' }, 
    create_time: { type: Date, default: Date.now },
    responded_time: { type: Date, default: null },
    confirmed_time: { type: Date, default: null },
    declined_time: { type: Date, default: null },

    currentPriceByAdmin: { type: Number },
    dateByAdmin: { type: Date },
    messageByAdmin : {type : String},
    
    creatorRole : {type: String, enum: ['entreprise', 'user'] },
    delivered : {type : Boolean , default : false},
    deliveredDate : {type : Date},

    cancledDate : {typ : Date},
    cancledReason : {type : String },

    taille: { type: String },
    poids: { type: String },
    nature: { type: String },
    lieuDepart: { type: String },
    lieuArriver: { type: String },
    dateLivraison: { type: Date },
    heureLivraison: { type: String },
    nomDestinataire: { type: String },
    telephoneDestinataire: { type: String },


    photosMeuble: [String],
    typeLocalDepart: { type: String },
    typeLocalArrivee: { type: String },
    ascenseurDepart: { type: String },
    ascenseurArrivee: { type: String },
    etageMeubles: { type: String },
    etageSouhaite: { type: String },
    lieuDepart: { type: String },
    lieuArrivee: { type: String },
    dateDemenagement: { type: Date },
    heureDemenagement: { type: String },
    telephone: { type: String },

});

module.exports = ActionSchema;
