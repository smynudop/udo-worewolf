"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameIO = void 0;
var fs = require("fs");
var ejs = require("ejs");
var schema = require("../schema");
var GameSchema = schema.Game;
var User = schema.User;
var GameIO = /** @class */ (function () {
    function GameIO() {
    }
    GameIO.writeHTML = function (log, player, vinfo) {
        ejs.renderFile("./views/worewolf_html.ejs", {
            logs: log,
            players: player,
            vinfo: vinfo,
        }, function (err, html) {
            if (err)
                console.log(err);
            html = html.replace(/\n{3,}/, "\n");
            fs.writeFile("./public/log/" + vinfo.no + ".html", html, "utf8", function (err) {
                console.log(err);
            });
        });
    };
    GameIO.update = function (vno, data) {
        GameSchema.updateOne({ vno: vno }, { $set: data }, function (err) {
            if (err)
                console.log(err);
        });
    };
    GameIO.find = function (vno) {
        return GameSchema.findOne({ vno: vno }).exec();
    };
    return GameIO;
}());
exports.GameIO = GameIO;
//# sourceMappingURL=gameIO.js.map