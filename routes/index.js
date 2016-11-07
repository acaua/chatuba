var express = require('express');
var router = express.Router();
//var ensureLoggedIn = require('ensureLoggedIn');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;


router.get('/', function(req, res){
	res.render('index');
});

router.get('/chat', ensureLoggedIn('/user/login'), function(req, res){
	res.render('chat');
});


module.exports = router;