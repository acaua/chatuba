var express = require('express');
var router = express.Router();
var csurf = require('csurf')();
var passport = require('passport');

router.use(csurf);

router.get('/login', function(req, res){
  var messages = req.flash('error');
  res.render('user/login', {csrfToken: req.csrfToken(), messages: messages});
});

router.post('/login', passport.authenticate('local.login', {
  successRedirect: '/chat',
  failureRedirect: '/user/login',
  failureFlash: true
}));


router.get('/logout', function (req, res, next) {
    req.logout();
    res.redirect('/user/login');
});

router.get('/register', function(req, res){
  var messages = req.flash('error');
  res.render('user/register', {csrfToken: req.csrfToken(), messages: messages});
});

router.post('/register', passport.authenticate('local.register', {
  successRedirect: '/chat',
  failureRedirect: '/user/register',
  failureFlash: true
}));

module.exports = router;