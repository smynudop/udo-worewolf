var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
    userid : { type: String, required: true, unique: true }, 
    password : { type: String, required: true },
    trip: String
});

var Game = new Schema({
	vno: { type: Number, required: true},
	name: { type: String, required: true},
	pr: {type: String, required: true},
	casttype: {type: String, required: true},
	time: {
		day: Number,
		vote: Number,
		night: Number,
		ability: Number,
		nsec: Number
	},
	capacity: {type:Number, required: true},
	GMid: {type: String, required: true},
	state: {type: String},
	kariGM: {type: Boolean}
})

module.exports = {
	User: mongoose.model('user', User),
	Game: mongoose.model("game", Game)
}