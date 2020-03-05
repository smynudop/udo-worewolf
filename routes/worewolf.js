var express = require('express');
var router = express.Router();
var Game = require("../schema").Game

/* GET home page. */

router.get("/", function(req,res,next){
	if(!req.session.userid){
		req.session.rd = "worewolf"
		res.redirect("login")
	} else {
		Game.find({state:{"$ne":"logged"}}, function(err, result){
			if(err) console.log(err)
			res.render("worewolf_lobby", {"result": result, "userid": req.session.userid})
		}) 	
	}
})



router.get('/:vno', function(req, res, next) {
	if(!req.session.userid){
		req.session.rd = "worewolf"
		res.redirect("../login")
	} else {
		var vno = req.params.vno
		Game.findOne({"vno":vno}, function(err, result){
			if(err) console.log(err)
			if(!result){
				res.redirect("/")
			}

			if(result.state == "logged"){
				res.redirect("/log/"+vno+".html")
			} else{
				res.render('worewolf', {id: req.session.userid, vno: vno});					
			}

		}) 
	
	}
});

module.exports = router;
