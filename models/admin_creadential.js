var mongoose = require('mongoose');
var Admin_creadential = new mongoose.Schema({
    local: {
		username: String,
		password: String
	}
  })
  module.exports = mongoose.model('Admin_creadential', Admin_creadential)