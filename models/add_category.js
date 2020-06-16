var mongoose = require('mongoose');
var add_category = new mongoose.Schema({
    category : String, //Array
    subcategory : Array //Array
});

module.exports = mongoose.model('add_category',add_category)