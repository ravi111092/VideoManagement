var mongoose = require('mongoose');
var logs = new mongoose.Schema({
    username : String,
    email : String,
    video_name : String,
    size : String,
    time : String
});

module.exports = mongoose.model('logs',logs)