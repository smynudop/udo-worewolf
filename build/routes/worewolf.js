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
/* GET home page. */
exports.router.get("/", function (req, res, next) {
    if (!req.session.userid) {
        req.session.rd = "worewolf";
        res.redirect("login");
    }
    else {
        schema_1.Game.find({ state: { $ne: "logged" } }, function (err, result) {
            if (err)
                console.log(err);
            res.render("worewolf_lobby", { result: result, userid: req.session.userid });
        });
    }
});
exports.router.get("/:vno", function (req, res, next) {
    if (!req.session.userid) {
        req.session.rd = "worewolf";
        res.redirect("../login");
    }
    else {
        var vno = req.params.vno;
        schema_1.Game.findOne({ vno: vno }, function (err, result) {
            if (err)
                console.log(err);
            if (!result) {
                res.redirect("/");
            }
            if (result.state == "logged") {
                res.redirect("/log/" + vno + ".html");
            }
            else {
                res.render("worewolf", { id: req.session.userid, vno: vno });
            }
        });
    }
});
//# sourceMappingURL=worewolf.js.map