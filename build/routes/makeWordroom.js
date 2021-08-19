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
/* GET users listing. */
exports.router.get("/", function (req, res, next) {
    if (!req.session.userid) {
        req.session.rd = "makeWordroom";
        res.redirect("./login");
    }
    else {
        res.render("makeWordroom", { userid: req.session.userid });
    }
});
exports.router.post("/", function (req, res, next) {
    if (!req.session.userid) {
        req.session.rd = "makeWordroom";
        res.redirect("./login");
    }
    else {
        var userid = req.session.userid;
        var vno = 1;
        var name = req.body.name;
        var pr = req.body.pr;
        var time = {};
        if (!name || name.length >= 24 || name.length == 0) {
            res.render("makeWordroom", {
                userid: userid,
                error: "村名は24文字以内で入力してください",
            });
            return false;
        }
        else {
            name += "村";
        }
        if (pr && pr.length > 30) {
            pr = pr.slice(0, 30);
        }
        else if (!pr || pr == "") {
            pr = "PR文が設定されていません";
        }
        for (var t of ["setWord", "discuss", "counter"]) {
            if (!req.body[t] || req.body[t] - 0 > 600) {
                res.render("makeWordroom", { userid: userid, error: "時間が不正です" });
                return false;
            }
            else {
                time[t] = req.body[t] - 0;
            }
        }
        schema_1.Wordwolf.find({}, {}, { sort: { vno: -1 }, limit: 1 }, function (err, data) {
            if (err)
                console.log(err);
            if (data.length == 0) {
                vno = 1;
            }
            else {
                vno = data[0].vno + 1;
            }
        }).then(() => {
            var game = new schema_1.Wordwolf();
            game.vno = vno;
            game.name = name;
            game.pr = pr;
            game.GMid = userid;
            game.time = time;
            game.state = "recruit";
            game.save(function (err) {
                if (err)
                    console.log(err);
                res.redirect("./wordwolf");
            });
        });
    }
});
//# sourceMappingURL=makeWordroom.js.map