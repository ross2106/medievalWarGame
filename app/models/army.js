var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Inventory Schema
var ArmySchema = new Schema({
    username: {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    infantry: {
        type: String,
        required: true
    },
    archers: {
        type: String,
        required: true
    },
    cavalry: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Army', ArmySchema);