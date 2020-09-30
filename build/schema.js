"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wordwolf = exports.Game = exports.User = void 0;
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const u = new Schema({
    userid: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    trip: String,
});
const g = new Schema({
    vno: { type: Number, required: true },
    name: { type: String, required: true },
    pr: { type: String, required: true },
    casttype: { type: String, required: true },
    time: {
        day: Number,
        vote: Number,
        night: Number,
        ability: Number,
        nsec: Number,
    },
    capacity: { type: Number, required: true },
    GMid: { type: String, required: true },
    state: { type: String },
    kariGM: { type: Boolean },
});
const w = new Schema({
    vno: { type: Number, required: true },
    name: { type: String, required: true },
    pr: { type: String, required: true },
    time: {
        setWord: Number,
        discuss: Number,
        counter: Number,
    },
    GMid: { type: String, required: true },
    state: { type: String },
});
exports.User = mongoose.model("User", u);
exports.Game = mongoose.model("Game", g);
exports.Wordwolf = mongoose.model("Wordwolf", w);
//# sourceMappingURL=schema.js.map