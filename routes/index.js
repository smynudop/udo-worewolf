var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	if(req.session.userid){
		res.render("index", {userid: req.session.userid, islogin: true})
	} else {
		res.render('index', {islogin: false});		
	}
});

module.exports = router;
