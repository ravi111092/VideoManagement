// var localStorage = require('localStorage');
// module.exports = function(app, passport){

// 	// login and check in passportjs 
// 	// app.post('/login', passport.authenticate('local-login', {
    
// 	// 	successRedirect: '/all_video',
// 	// 	failureRedirect: '/',
// 	// 	failureFlash: true
// 	// }));
										  
// 	// app.get('/logout', function(req, res){
//     //     localStorage.removeItem('access');
// 	// 	req.logout();
// 	// 	res.redirect('/');
// 	// })
// };

// function isLoggedIn(req, res, next) {
// 	if(req.isAuthenticated()){
// 		console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
// 		console.log(req.isAuthenticated());
// 		return next();
// 	}

// 	res.redirect('/');
// }