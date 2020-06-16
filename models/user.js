var mongoose = require('mongoose');
var user = new mongoose.Schema({
    fullname : String,
    email : String,
    password : String,
    confirmpass : String,
    admin : Boolean
});
module.exports = mongoose.model('user',user)