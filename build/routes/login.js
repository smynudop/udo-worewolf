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
var Express = __importStar(require("express"));
exports.router = Express.Router();
var schema_1 = require("../schema");
exports.router.get("/", function (req, res, next) {
    res.render("login", {});
});
exports.router.post("/", function (req, res, next) {
    var userid = req.body.userid;
    var password = req.body.password;
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
                res.redirect("/");
            });
        }
        else {
            if (password == result[0].password) {
                req.session.userid = userid;
                var rd = req.session.rd;
                if (rd) {
                    delete req.session.rd;
                    res.redirect("/" + rd);
                }
                else {
                    res.redirect("/");
                }
            }
            else {
                res.render("login", { registerflg: "incorrect" });
            }
        }
    });
    /*処理を書く*/
});
//# sourceMappingURL=login.js.map