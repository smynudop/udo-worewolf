"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = void 0;
var messageTemplate_1 = require("./messageTemplate");
var Log = /** @class */ (function () {
    function Log(nsp, date) {
        this.list = [];
        this.nsp = nsp;
        this.date = date;
        this.count = 1;
        this.formatter = new messageTemplate_1.MessageFormat(this);
    }
    Log.prototype.all = function () {
        return this.list;
    };
    Log.prototype.initial = function (visitor) {
        var e_1, _a;
        var logs = [];
        var rooms = visitor.socket.rooms;
        try {
            for (var _b = __values(this.list), _c = _b.next(); !_c.done; _c = _b.next()) {
                var log = _c.value;
                var canWatchAllLog = rooms.has("gm") || rooms.has("all");
                var isTarget = rooms.has(log.target);
                var isPersonal = log.target == "personal" && rooms.has("player-" + log.no);
                var isGlobal = log.target == "all";
                if (canWatchAllLog || isTarget || isPersonal || isGlobal) {
                    logs.push(log);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return logs;
    };
    Log.prototype.resetCount = function () {
        this.count = 1;
    };
    Log.prototype.quoteDiscuss = function (anchor) {
        var logs = this.list.filter(function (log) { return log.anchor == anchor; });
        return logs.length ? logs[0] : null;
    };
    Log.prototype.replaceQuote = function (txt, num) {
        var _this = this;
        var cnt = 0;
        txt = txt.replace(/&gt;&gt;\d{1,2}-\d{1,3}/g, function (match) {
            if (cnt >= num)
                return match;
            cnt++;
            var q = _this.quoteDiscuss(match);
            return q ? q.quote : match;
        });
        return txt;
    };
    Log.prototype.add = function (type, detail, option) {
        if (option === void 0) { option = {}; }
        var log = this.formatter.makeLog(type, detail, option);
        if (log.type == "talk" && log.class == "discuss") {
            log.resno = this.count;
            log.anchor = "&gt;&gt;" + log.day + "-" + log.resno;
            log.quote = "<blockquote><div class=\"resno\">" + log.anchor + "</div>" + log.message + "</blockquote>";
            log.message = this.replaceQuote(log.message, 3);
            this.count++;
        }
        this.list.push(log);
        switch (log.target) {
            case "all":
                this.nsp.emit("talk", log);
                break;
            case "wolf":
                this.nsp.to("wolf").to("gm").to("all").emit("talk", log);
                break;
            case "personal":
                this.nsp
                    .to("player-" + log.no)
                    .to("gm")
                    .to("all")
                    .emit("talk", log);
                break;
            case "share":
                this.nsp.to("share").to("gm").to("all").emit("talk", log);
                break;
            case "fox":
                this.nsp.to("fox").to("gm").to("all").emit("talk", log);
                break;
            case "grave":
                this.nsp.to("grave").to("gm").to("all").emit("talk", log);
                break;
        }
    };
    return Log;
}());
exports.Log = Log;
//# sourceMappingURL=log.js.map