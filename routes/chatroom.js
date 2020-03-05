var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	if(!req.session.userid){
		req.session.rd = "chatroom"
		res.redirect("login")
	} else {
		res.render('chatroom', {id: req.session.userid});		
	}
});

module.exports = router;
