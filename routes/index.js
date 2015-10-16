var express = require('express');
var appInfo = require('../config').app;
var tokenAuth = require('../config/token');
var router = express.Router();

/* GET home page. */

router.get('/', function(req, res) {
	res.render('index', {
		title: appInfo.name
	});
});

module.exports = router;
