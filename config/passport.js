var passport = require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use('local.register', new LocalStrategy({passReqToCallback: true}, function (req, username, password, done) {
  req.checkBody('username', 'Missing username').notEmpty();
  req.checkBody('password', 'Invalid password').notEmpty().isLength({min:4});
  req.checkBody('password', 'Password confirmation does not match').equals(req.body.passwordConfirmation);
  var errors = req.validationErrors();
  if (errors) {
    var messages = [];
    errors.forEach(function(error) {
      messages.push(error.msg);
    });
    return done(null, false, req.flash('error', messages));
  }
  User.findOne({'username': username}, function (err, user) {
    if (err) {
      return done(err);
    }
    if (user) {
      return done(null, false, {message: 'Username is taken.'});
    }
    var newUser = new User();
    newUser.username = username;
    newUser.encryptPassword(password, function(err, user) {
      if (err) {
        return done(err);
      }
      newUser.save(function(err, result) {
        if (err) {
          return done(err);
        };
        return done(null, newUser);
      });
    });
  });
}));

passport.use('local.login', new LocalStrategy({
  passReqToCallback: true
}, function(req, username, password, done) {
  req.checkBody('username', 'Missing username').notEmpty();
  req.checkBody('password', 'Missing password').notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    var messages = [];
    errors.forEach(function(error) {
      messages.push(error.msg);
    });
    return done(null, false, req.flash('error', messages));
  }
  User.findOne({'username': username}, function (err, user) {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(null, false, {message: 'User not found.'});
    }
    user.verifyPassword(password, function(err, isMatch){
      if(err) {
        return done(err);
      };
      if (!isMatch) {
        return done(null, false, {message: 'Wrong password.'});
      }
      return done(null, user);
    });    
  });
}));

module.exports = passport;