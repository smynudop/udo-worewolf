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
const schema_1 = require("../schema");
/* GET home page. */
exports.router.get("/", function (req, res, next) {
    res.render("register");
});
exports.router.post("/", function (req, res, next) {
    var userid = req.body.userid.trim();
    var password = req.body.password.trim();
    if (!/^[^\d\s]\S+$/.test(userid)) {
        res.render("register", { error: "IDが不正です" });
        return false;
    }
    if (!/^\w+$/.test(password)) {
        res.render("register", { error: "パスワードが不正です" });
        return false;
    }
    schema_1.User.find({ userid: userid }, function (err, result) {
        if (err)
            console.log(err);
        if (result.length == 0) {
            var user = new schema_1.User();
            user.userid = userid;
            user.password = password;
            user.save(function (err) {
                if (err)
                    console.log(err);
                req.session.userid = userid;
                res.redirect("../");
            });
        }
        else {
            res.render("register", { error: "このIDは既に使われています" });
        }
    });
    /*処理を書く*/
});
//# sourceMappingURL=register.js.map