var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Inventory Schema
var InventorySchema = new Schema({
    username: {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    gold: {
        type: String,
        required: true,
        select: false
    },
    food: {
        type: String,
        required: true,
        select: false
    },
    wood: {
        type: String,
        required: true,
        select: false
    }
});

module.exports = mongoose.model('Inventory', InventorySchema);