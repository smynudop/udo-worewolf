"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const Express = __importStar(require("express"));
exports.router = Express.Router();
var tripcode = require("tripcode");
const schema_1 = require("../schema");
exports.router.use("/", async function (req, res, next) {
    if (!req.session.userid) {
        req.session.rd = "mypage";
        res.redirect("login");
    }
    else {
        let user = await schema_1.User.findOne({ userid: req.session.userid }).exec();
        req.user = user;
        next();
    }
});
/* GET users listing. */
exports.router.get("/", async function (req, res, next) {
    res.render("mypage", { userid: req.user.userid, trip: req.user.trip });
});
exports.router.post("/set_trip", function (req, res, next) {
    let trip = "◆" + tripcode(req.body.key);
    schema_1.User.update({ userid: req.session.userid }, { $set: { trip: trip } }, function (err) {
        if (err)
            console.log(err);
        res.redirect("/mypage?mes=success_set_trip");
    });
});
exports.router.post("/change_password", function (req, res, next) {
    let new1 = req.body.new;
    let new2 = req.body.new2;
    if (req.user.password != req.body.now || !/^\w+$/.test(new1) || new1 != new2) {
        return res.redirect("/mypage?mes=failed_change_password");
    }
    schema_1.User.update({ userid: req.session.userid }, { $set: { password: new1 } }, function (err) {
        if (err)
            console.log(err);
        res.redirect("/mypage?mes=success_change_password");
    });
});
//# sourceMappingURL=mypage.js.map