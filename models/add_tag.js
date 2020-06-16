var mongoose = require('mongoose');
var add_tag = new mongoose.Schema({
    tag : String
});

module.exports = mongoose.model('add_tag',add_tag)