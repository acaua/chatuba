'use strict';

var express = require('express');
var app = express();
var http = require('http').Server(app);
var chatuba = require('./lib/chatuba-server');
var exphbs = require('express-handlebars');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var flash = require('connect-flash');
var validator = require('express-validator');
var MongoStore = require('connect-mongo')(session);

var routes = require('./routes/index');
var user = require('./routes/user');
var passport = require('./config/passport');

mongoose.connect('localhost:27017/chatuba');

mongoose.connection.on('error', function(err) {
  console.log('connection error: ' + err);
});

var sessionStore = new MongoStore({ mongooseConnection: mongoose.connection });

// Set view engine to handlebars
app.engine('handlebars', exphbs({
  defaultLayout:'main',
  helpers: {
    section: function(name, options){ 
      if(!this._sections) this._sections = {};
      this._sections[name] = options.fn(this); 
      return null;
    } 
  }    
}));
app.set('view engine', 'handlebars');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator());
app.use(cookieParser());
app.use(session({
  secret: process.env.SECRET_KEY_BASE || 'session secret', 
  resave: false, 
  saveUninitialized: false, 
  store: sessionStore,
  cookie: {maxAge: 180 * 60 * 1000}
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));

chatuba.listen(http, sessionStore);

app.use(function(req, res, next) {
  res.locals.username = req.isAuthenticated() ? req.user.username : null;
  next();
});

app.use('/user', user);
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});