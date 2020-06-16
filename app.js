var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var dbconnect = require('./dbconnect/index');
var add_user = require('./routes/add_user');

var mongoose = require('mongoose');
var cors  = require('cors');
var bodyparser = require('body-parser');
var flash = require('connect-flash');
// var passport = require('passport');
var session = require('express-session');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(session({
  secret: 'vediogalleryproject',
  resave: true,
  saveUninitialized: false,
  cookie: {
      expires: 30 * 60 * 1000 // after the time it will back on login pages...
  }}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended : true}));
app.use(cors());
app.use(flash());
// app.use(passport.initialize());
// app.use(passport.session());

// Database connection here....
mongoose.connect(dbconnect.mongoURI, dbconnect.mongoCFG).then((data)=>{
  console.log('Successfully connected database... 3000');
}).catch((err)=>{
  console.log('connection error');
  console.log(err);
});

 
// require('./config/passport')(passport);
app.use('/', indexRouter);
// require('./routes/login.js')(app, passport);
app.use('/', add_user);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
