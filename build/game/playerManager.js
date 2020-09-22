"use strict";
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerManager = void 0;
var player_1 = require("./player");
var cast_1 = require("./cast");
var PlayerManager = /** @class */ (function () {
    function PlayerManager(game) {
        this.players = {};
        this.list = [];
        this.listAll = [];
        this.userid2no = {};
        this.count = 0;
        this.npcNames = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N"];
        this.nullPlayer = new player_1.Player({ no: 997 }, this);
        this.log = game.log;
        this.date = game.date;
    }
    PlayerManager.prototype.newVisitor = function (data) {
        var visitor = new player_1.Visitor(data, this);
        return visitor;
    };
    PlayerManager.prototype.add = function (data) {
        var no = this.count;
        data.no = no;
        var p = new player_1.Player(data, this);
        var userid = data.userid;
        this.userid2no[userid] = no;
        this.players[no] = p;
        this.count++;
        this.refreshList();
        this.log.add("player", "add", {
            player: p.cn,
        });
        return p;
    };
    PlayerManager.prototype.leave = function (userid) {
        var id = this.pick(userid).no;
        var p = this.players[id];
        p.socket.emit("leaveSuccess");
        this.log.add("player", "leave", { player: p.cn });
        delete this.players[id];
        delete this.userid2no[userid];
        this.refreshList();
    };
    PlayerManager.prototype.kick = function (target) {
        if (!(target in this.players))
            return false;
        var p = this.pick(target);
        if (p.isGM || p.isKariGM || p.isDamy)
            return false;
        var userid = p.userid;
        p.socket.emit("leaveSuccess");
        this.log.add("player", "kick", {
            player: p.cn,
        });
        delete this.players[target];
        delete this.userid2no[userid];
        this.refreshList();
    };
    PlayerManager.prototype.in = function (userid) {
        return userid in this.userid2no;
    };
    PlayerManager.prototype.refreshList = function () {
        this.list = Object.values(this.players).filter(function (p) { return p.no < 990; });
        this.listAll = Object.values(this.players);
    };
    PlayerManager.prototype.forClientSummary = function () {
        return this.listAll.map(function (p) { return p.forClientSummary(); });
    };
    PlayerManager.prototype.forClientDetail = function () {
        return this.listAll.map(function (p) { return p.forClientDetail(); });
    };
    Object.defineProperty(PlayerManager.prototype, "num", {
        get: function () {
            return this.list.length;
        },
        enumerable: false,
        configurable: true
    });
    PlayerManager.prototype.numBySpecies = function () {
        var human = this.select(function (p) { return p.status.species == "human"; }).length;
        var wolf = this.select(function (p) { return p.status.species == "wolf"; }).length;
        var fox = this.select(function (p) { return p.status.species == "fox"; }).length;
        return {
            human: human,
            wolf: wolf,
            fox: fox,
        };
    };
    PlayerManager.prototype.alive = function () {
        return this.list.filter(function (p) { return p.isAlive; });
    };
    PlayerManager.prototype.dead = function () {
        return this.list.filter(function (p) { return !p.isAlive; });
    };
    PlayerManager.prototype.pick = function (id) {
        if (typeof id == "number") {
            return this.players[id];
        }
        if (isNaN(parseInt(id))) {
            id = this.userid2no[id];
        }
        else {
            id = parseInt(id);
        }
        return this.players[id];
    };
    PlayerManager.prototype.damy = function () {
        return this.players[0];
    };
    PlayerManager.prototype.NPC = function () {
        return this.alive().filter(function (p) { return p.isNPC; });
    };
    PlayerManager.prototype.lot = function (ignore) {
        return this.alive()
            .filter(function (p) { return p.no != ignore; })
            .lot();
    };
    PlayerManager.prototype.select = function (func) {
        return this.alive().filter(function (p) { return func(p); });
    };
    PlayerManager.prototype.has = function (attr) {
        return this.alive().filter(function (p) { return p.has(attr); });
    };
    PlayerManager.prototype.selectAll = function (func) {
        return this.list.filter(function (p) { return func(p); });
    };
    PlayerManager.prototype.compileVote = function () {
        var e_1, _a;
        var votes = {};
        var table = "<table class=\"votesummary\"><tbody>";
        try {
            for (var _b = __values(this.alive()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var player = _c.value;
                var target = this.pick(player.status.vote);
                var get = this.alive().filter(function (p) { return p.status.vote == player.no; }).length;
                votes[player.no] = get;
                table += "<tr class=\"eachVote\"><td>" + player.cn + "</td><td>(" + get + ")</td><td>\u2192</td><td>" + target.cn + "</td></tr>";
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        table += "</tbody></table>";
        var max = Math.max.apply(Math, __spread(Object.values(votes)));
        var maxers = Object.keys(votes).filter(function (v) { return votes[v] == max; });
        var exec = maxers.length == 1 ? this.pick(maxers[0]) : null;
        return {
            table: table,
            exec: exec,
        };
    };
    PlayerManager.prototype.setKnow = function () {
        var e_2, _a;
        var wolf = this.select(function (p) { return p.status.species == "wolf"; })
            .map(function (p) { return p.cn; })
            .join("、");
        var share = this.select(function (p) { return p.status.name == "share"; })
            .map(function (p) { return p.cn; })
            .join("、");
        var fox = this.select(function (p) { return p.status.species == "fox"; })
            .map(function (p) { return p.cn; })
            .join("、");
        var noble = this.select(function (p) { return p.status.name == "noble"; })
            .map(function (p) { return p.cn; })
            .join("、");
        var texts = {
            wolf: "<br>【能力発動】人狼は" + wolf,
            share: "<br>【能力発動】共有者は" + share,
            fox: "<br>【能力発動】妖狐は" + fox,
            noble: "<br>【能力発動】貴族は" + noble,
        };
        try {
            for (var _b = __values(this), _c = _b.next(); !_c.done; _c = _b.next()) {
                var player = _c.value;
                for (var job in texts) {
                    if (player.status.canKnow(job)) {
                        player.status.knowText += texts[job];
                    }
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    PlayerManager.prototype.isDeadAllFox = function () {
        return this.select(function (p) { return p.status.species == "fox"; }).length == 0;
    };
    PlayerManager.prototype.isDeadAllJob = function (job) {
        return this.select(function (p) { return p.status.name == job; }).length == 0;
    };
    PlayerManager.prototype.summonDamy = function () {
        this.add({
            userid: "shonichi",
            socket: null,
            cn: "初日犠牲者",
            color: "orange",
            isDamy: true,
            isNPC: true,
        });
    };
    PlayerManager.prototype.summonNPC = function () {
        var cn = this.npcNames.shift();
        this.add({
            userid: "damy-" + cn,
            socket: null,
            cn: cn,
            color: "orange",
            isNPC: true,
        });
    };
    PlayerManager.prototype.setGM = function (gmid, isKari) {
        if (isKari) {
            this.add({
                userid: gmid,
                socket: null,
                cn: "仮GM",
                color: "orange",
                isKariGM: true,
            });
            return false;
        }
        var gm = new player_1.Player({
            userid: gmid,
            socket: null,
            no: 999,
            isGM: true,
            cn: "ゲームマスター",
            color: "gm",
        }, this);
        this.players[999] = gm;
        this.userid2no[gmid] = 999;
        gm.status.set(cast_1.castManager.job("GM"));
        this.refreshList();
    };
    PlayerManager.prototype.isCompleteVote = function () {
        return this.alive().every(function (p) { return p.isVote; });
    };
    PlayerManager.prototype.savoVote = function () {
        return this.alive().filter(function (p) { return !p.isVote; });
    };
    PlayerManager.prototype.savoAbility = function (ability) {
        return this.alive().filter(function (p) { return !p.isUsedAbility && p.status.can(ability); });
    };
    PlayerManager.prototype.makeTargets = function (type) {
        var e_3, _a, e_4, _b;
        type = type || "alive";
        var targets = {};
        if (type == "alive") {
            try {
                for (var _c = __values(this.alive()), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var player = _d.value;
                    targets[player.no] = player.cn;
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_3) throw e_3.error; }
            }
        }
        else {
            try {
                for (var _e = __values(this.dead()), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var player = _f.value;
                    targets[player.no] = player.cn;
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                }
                finally { if (e_4) throw e_4.error; }
            }
        }
        return targets;
    };
    PlayerManager.prototype.makeDeathTargets = function () {
        var e_5, _a;
        var targets = {};
        try {
            for (var _b = __values(this.dead()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var player = _c.value;
                targets[player.no] = player.cn;
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_5) throw e_5.error; }
        }
        return targets;
    };
    PlayerManager.prototype[Symbol.iterator] = function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [5 /*yield**/, __values(this.list)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    };
    return PlayerManager;
}());
exports.PlayerManager = PlayerManager;
//# sourceMappingURL=playerManager.js.map