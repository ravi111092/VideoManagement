var LocalStrategy = require('passport-local').Strategy;
var localStorage = require('localStorage');

var User = require('../models/user');
var configAuth = require('./auth');

module.exports = function (passport) {

	//it is setting id as cookie in user’s browser
	passport.serializeUser(function (user, done) {
		console.log("serializeUserserializeUserserializeUser");
		console.log(user);
		done(null, user.id);
	});
	// it is getting id from the cookie
	passport.deserializeUser(function (id, done) {
		console.log("deserializeUserdeserializeUser : " + id); //deserializeUserdeserializeUser : 5e71b2058f08ba0d44b47c32
		User.findById(id, function (err, user) {
			done(err, user);
		});
	});



	passport.use('local-login', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	},
		function (req, email, password, done) {
			process.nextTick(function () {
				User.findOne({ 'email': email }, function (err, user) {
					console.log('possport+++++++++++++++++++++++++++++++++++');
					console.log(user);
					if (err)
						return done(err);
					if (!user)
						return done(null, false, req.flash('loginMessage', 'No User found'));
					if (user.password !== password) {
						return done(null, false, req.flash('loginMessage', 'Password invalid'));

					}
					return done(null, user);



				});
			});
		}
	));



};