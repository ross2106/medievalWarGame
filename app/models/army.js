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
        type: Number,
        required: true
    },
    archers: {
        type: Number,
        required: true
    },
    cavalry: {
        type: Number,
        required: true
    },
    level: {
        type: Number,
        required: true
    },
    winCount: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Army', ArmySchema);