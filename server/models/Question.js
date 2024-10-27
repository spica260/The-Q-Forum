const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const QnSchema = new Schema({
    question: {
        type: String,
        require: true
    },
    category: {
        type: String,
        require: true
    },
    reply: {
        type: String,
        require: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('question', QnSchema);