var mongoose = require('mongoose');
var video_gallery = new mongoose.Schema({
    title : String,
    video : String,
    description : String,
    tag : Array, //Array
    category : Array, //Array
    subcategory : Array, //Array
    download_link : String
    
});

module.exports = mongoose.model('video_gallery',video_gallery)