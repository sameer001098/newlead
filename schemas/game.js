const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    username: {
        type: String,
      
    },
    name : {
        type : String
    },
    prize : {
        type : String
    },

    userid: {
        type: String, 
        required: true,
    },
    magicnumber: {
        type: String,
        required: true
    },
    hint: {
        type: String,
        required: true
    },
    attempts: {
        type: Number,
        required: true,
        default: 0
    },
    createdOn: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Game', gameSchema);
