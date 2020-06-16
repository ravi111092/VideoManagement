var mongoose = require('mongoose');
var timestamps = new mongoose.Schema({
    created: { type: Date, default: Date.now }
});

module.exports = mongoose.model('timestamps',timestamps);