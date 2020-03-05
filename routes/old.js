var express = require('express');
var router = express.Router();
var Game = require("../schema").Game

/* GET home page. */

router.get("/", function(req,res,next){
	Game.find({state:"logged"}, function(err, result){
		if(err) console.log(err)
		res.render("old", {"result": result})
	}) 	
})

module.exports = router;
