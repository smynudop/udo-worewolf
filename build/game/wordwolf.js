"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
exports.GameIO = void 0;
var moment = require("moment");
var schema = require("../schema");
var GameSchema = schema.Wordwolf;
var User = schema.User;
var PlayerSocket = require("./socket");
var word_log_1 = require("./word-log");
var fs = require("fs");
var ejs = require("ejs");
var e = require("express");
var Player = /** @class */ (function () {
    function Player(data, manager) {
        this.no = data.no === undefined ? 997 : data.no;
        this.userid = data.userid || "null";
        this.cn = data.cn || "kari";
        this.color = data.color || "red";
        this.isRM = data.isRM || false;
        this.isNPC = data.isNPC || false;
        this.trip = "";
        this.job = "";
        this.vote = {
            target: null,
            targetName: "",
            get: 0,
        };
        this.manager = manager;
        this.log = manager.log;
        this.socket = new PlayerSocket(data.socket);
        this.socket.join("player-" + this.no);
        this.getTrip();
    }
    Player.prototype.getTrip = function () {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, User.findOne({ userid: this.userid }).exec()];
                    case 1:
                        user = _a.sent();
                        this.trip = user.trip;
                        return [2 /*return*/];
                }
            });
        });
    };
    Player.prototype.changeVote = function (target) {
        if (this.vote.target === target.no)
            return false;
        if (this.no == target.no)
            return false;
        if (this.isGM)
            return false;
        this.vote.target = target.no;
        this.vote.targetName = target.cn;
    };
    Player.prototype.cancelVote = function () {
        this.vote.target = null;
        this.vote.targetName = "";
    };
    Player.prototype.setJob = function (job) {
        this.job = job;
    };
    Player.prototype.reset = function () {
        this.job = "";
        this.vote = {
            target: null,
            targetName: "",
            get: 0,
        };
    };
    Player.prototype.forClientSummary = function () {
        return {
            no: this.no,
            userid: this.userid,
            trip: this.trip,
            color: this.color,
            cn: this.cn,
            vote: this.vote,
            isGM: this.isGM,
        };
    };
    Player.prototype.forClientDetail = function () {
        return {
            no: this.no,
            userid: this.userid,
            trip: this.trip,
            color: this.color,
            cn: this.cn,
            job: this.job,
            vote: this.vote,
            isRM: this.isRM,
            isGM: this.isGM,
        };
    };
    Object.defineProperty(Player.prototype, "isVillager", {
        get: function () {
            return this.job == "villager";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "isWolf", {
        get: function () {
            return this.job == "wolf";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "isGM", {
        get: function () {
            return this.job == "GM";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "hasJob", {
        get: function () {
            return this.job !== "";
        },
        enumerable: false,
        configurable: true
    });
    Player.prototype.canJudge = function () {
        return this.isGM;
    };
    Player.prototype.canSetWord = function () {
        return this.isGM;
    };
    Player.prototype.hasPermittionOfRMCommand = function () {
        return this.isRM;
    };
    Player.prototype.update = function (cn, color) {
        this.cn = cn;
        this.color = color;
    };
    return Player;
}());
var PlayerManager = /** @class */ (function () {
    function PlayerManager(game) {
        this.players = {};
        this.list = [];
        this.listAll = [];
        this.userid2no = {};
        this.count = 0;
        this.npcNames = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N"];
        this.log = game.log;
    }
    PlayerManager.prototype.add = function (data) {
        var no = this.count;
        data.no = no;
        var p = new Player(data, this);
        var userid = data.userid;
        this.userid2no[userid] = no;
        this.players[no] = p;
        this.count++;
        this.refreshList();
        this.log.add("addPlayer", {
            player: p.cn,
        });
        return p;
    };
    PlayerManager.prototype.leave = function (userid) {
        var id = this.pick(userid).no;
        var p = this.players[id];
        p.socket.emit("leaveSuccess");
        this.log.add("leavePlayer", {
            player: p.cn,
        });
        delete this.players[id];
        delete this.userid2no[userid];
        this.refreshList();
    };
    PlayerManager.prototype.kick = function (target) {
        if (!(target in this.players))
            return false;
        var p = this.pick(target);
        if (p.isRM)
            return false;
        var userid = p.userid;
        p.socket.emit("leaveSuccess");
        this.log.add("kick", {
            player: p.cn,
        });
        delete this.players[target];
        delete this.userid2no[userid];
        this.refreshList();
    };
    PlayerManager.prototype.in = function (userid) {
        return userid in this.userid2no;
    };
    PlayerManager.prototype.pick = function (id) {
        if (typeof id == "string") {
            if (isNaN(parseInt(id))) {
                id = this.userid2no[id];
            }
            else {
                id = parseInt(id);
            }
        }
        return this.players[id];
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
    PlayerManager.prototype.reset = function () {
        var e_1, _a;
        try {
            for (var _b = __values(this), _c = _b.next(); !_c.done; _c = _b.next()) {
                var player = _c.value;
                player.reset();
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    PlayerManager.prototype.selectGM = function () {
        this.reset();
        var gm = this.list.lot();
        gm.setJob("GM");
        this.log.add("selectGM", { gm: gm });
    };
    PlayerManager.prototype.casting = function (wnum, vword, wword) {
        var e_2, _a, e_3, _b;
        var players = this.list.filter(function (p) { return !p.isGM; });
        for (var cnt = 0; cnt < wnum; cnt++) {
            var i = Math.floor(Math.random() * players.length);
            players[i].setJob("wolf");
            players.splice(i, 1);
        }
        try {
            for (var players_1 = __values(players), players_1_1 = players_1.next(); !players_1_1.done; players_1_1 = players_1.next()) {
                var player = players_1_1.value;
                if (!player.hasJob)
                    player.setJob("villager");
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (players_1_1 && !players_1_1.done && (_a = players_1.return)) _a.call(players_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        this.log.add("discussStart");
        try {
            for (var _c = __values(this.list), _d = _c.next(); !_d.done; _d = _c.next()) {
                var player = _d.value;
                if (player.isVillager) {
                    this.log.add("word", { word: vword, player: player });
                }
                if (player.isWolf) {
                    this.log.add("word", { word: wword, player: player });
                }
                if (player.isGM) {
                    this.log.add("gmword", { vword: vword, wword: wword, player: player });
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
            }
            finally { if (e_3) throw e_3.error; }
        }
    };
    Object.defineProperty(PlayerManager.prototype, "num", {
        get: function () {
            return this.list.length;
        },
        enumerable: false,
        configurable: true
    });
    PlayerManager.prototype.setRM = function (rmid) {
        this.add({
            userid: rmid,
            socket: null,
            cn: "ルームマスター",
            color: "orange",
            isRM: true,
        });
        return false;
    };
    PlayerManager.prototype.compileVote = function () {
        var gets = this.list.map(function (p) { return p.vote.get; });
        console.log(gets);
        var getmax = Math.max.apply(Math, __spread(gets));
        var maxGetters = this.list.filter(function (p) { return p.vote.get == getmax; });
        var exec = maxGetters[0];
        if (maxGetters.length >= 2 || getmax == 0) {
            exec = null;
        }
        return {
            exec: exec,
        };
    };
    PlayerManager.prototype.countVote = function () {
        var e_4, _a, e_5, _b;
        try {
            for (var _c = __values(this), _d = _c.next(); !_d.done; _d = _c.next()) {
                var player = _d.value;
                player.vote.get = 0;
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_4) throw e_4.error; }
        }
        try {
            for (var _e = __values(this), _f = _e.next(); !_f.done; _f = _e.next()) {
                var player = _f.value;
                if (player.vote.target === null)
                    continue;
                var target = this.pick(player.vote.target);
                target.vote.get++;
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
            }
            finally { if (e_5) throw e_5.error; }
        }
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
var Game = /** @class */ (function () {
    function Game(io, data) {
        this.io = io;
        this.vno = data.vno || 1;
        this.name = data.name || "とある村";
        this.pr = data.pr || "宣伝文が設定されていません";
        this.time = data.time || {
            setWord: 120,
            discuss: 180,
            counter: 60,
        };
        this.RMid = data.GMid;
        this.phase = "idol";
        this.capacity = 20;
        this.limit = null;
        this.vword = "";
        this.wword = "";
        this.wolfNum = 1;
        this.log = new word_log_1.Log(io);
        this.players = new PlayerManager(this);
        this.timerFlg = null;
        this.log.add("vinfo", this.villageInfo());
        this.players.setRM(this.RMid);
    }
    Game.prototype.setLimit = function (sec) {
        this.limit = moment().add(sec, "seconds").format();
    };
    Game.prototype.clearLimit = function () {
        this.limit = null;
    };
    Game.prototype.leftSeconds = function () {
        return this.limit ? moment().diff(this.limit, "seconds") * -1 : null;
    };
    Game.prototype.fixInfo = function (data) {
        for (var key in data) {
            if (this[key] === undefined)
                continue;
            this[key] = data[key];
        }
        GameIO.update(this.vno, data);
        this.log.add("vinfo", this.villageInfo());
    };
    Game.prototype.fixPersonalInfo = function (player, data) {
        var cn = data.cn.trim();
        if (cn.length == 0 || cn.length > 8)
            return false;
        player.update(cn, data.color);
        this.emitPlayer();
    };
    Game.prototype.villageInfo = function () {
        return {
            name: this.name,
            pr: this.pr,
            no: this.vno,
            time: this.time,
            RMid: this.RMid,
        };
    };
    Game.prototype.emitPlayer = function () {
        if (this.phaseIs("discuss")) {
            this.io.emit("player", this.players.forClientSummary());
        }
        else {
            this.io.emit("player", this.players.forClientDetail());
        }
    };
    Game.prototype.emitPhase = function () {
        this.io.emit("changePhase", {
            phase: this.phase,
            villageInfo: this.villageInfo(),
            targets: {},
            left: this.leftSeconds(),
        });
    };
    Game.prototype.talk = function (player, data) {
        data.cn = player.cn;
        data.color = player.color;
        this.log.add("talk", data);
    };
    Game.prototype.vote = function (player, data) {
        if (!player)
            return false;
        if (!this.phaseIs("discuss"))
            return false;
        if (data.target === null) {
            player.cancelVote();
        }
        else {
            var target = this.players.pick(data.target);
            if (!target)
                return false;
            player.changeVote(target);
        }
        this.players.countVote();
        this.emitPlayer();
    };
    Game.prototype.phaseIs = function (phase) {
        return this.phase == phase;
    };
    Game.prototype.canStart = function () {
        return this.players.num >= 4 && this.phaseIs("idol");
    };
    Game.prototype.setWord = function (data) {
        if (this.phase != "setWord")
            return false;
        this.vword = data.vword;
        this.wword = data.wword;
        this.wolfNum = data.wolfNum;
        if (this.wolfNum >= this.players.num / 2) {
            this.wolfNum = Math.floor(this.players.num / 2) - 1;
        }
        this.changePhase("discuss");
    };
    Game.prototype.start = function () {
        if (!this.canStart())
            return false;
        this.changePhase("setWord");
    };
    Game.prototype.casting = function () {
        this.players.casting(this.wolfNum, this.vword, this.wword);
    };
    Game.prototype.counter = function () {
        this.log.add("counter");
    };
    Game.prototype.finish = function (side) {
        this.log.add("release", { vword: this.vword, wword: this.wword });
        this.log.add("finish", { side: side });
        this.players.reset();
        this.changePhase("idol");
    };
    Game.prototype.compileVote = function () {
        var result = this.players.compileVote();
        if (result.exec) {
            this.log.add("exec", { player: result.exec });
            return result.exec.isWolf;
        }
        else {
            this.log.add("noexec");
            return false;
        }
    };
    Game.prototype.break = function () {
        this.log.add("break");
        this.changePhase("idol");
    };
    Game.prototype.changePhase = function (phase) {
        this.phase = phase;
        this.setTimer(phase);
        switch (phase) {
            case "setWord":
                this.players.selectGM();
                this.emitPersonalData();
                this.emitPlayer();
                this.emitPhase();
                break;
            case "discuss":
                this.casting();
                this.emitPhase();
                break;
            case "exec":
                var isExecutionWolf = this.compileVote();
                if (isExecutionWolf) {
                    this.changePhase("counter");
                    return false;
                }
                else {
                    this.changePhase("wolfWin");
                    return false;
                }
                break;
            case "counter":
                this.counter();
                this.emitPhase();
                this.emitPlayer();
                break;
            case "villageWin":
                this.finish("village");
                break;
            case "wolfWin":
                this.finish("wolf");
                break;
            case "break":
                this.break();
                break;
            case "idol":
                this.emitPhase();
                this.emitPlayer();
                break;
        }
    };
    Game.prototype.setTimer = function (phase) {
        var _this = this;
        clearTimeout(this.timerFlg);
        this.clearLimit();
        switch (phase) {
            case "setWord":
                this.timerFlg = setTimeout(function () {
                    _this.changePhase("break");
                }, this.time.setWord * 1000);
                this.setLimit(this.time.setWord);
                break;
            case "discuss":
                this.timerFlg = setTimeout(function () {
                    _this.changePhase("exec");
                }, this.time.discuss * 1000);
                this.setLimit(this.time.discuss);
                break;
            case "counter":
                this.timerFlg = setTimeout(function () {
                    _this.changePhase("wolfWin");
                }, this.time.counter * 1000);
                this.setLimit(this.time.counter);
                break;
        }
    };
    Game.prototype.emitPersonalData = function () {
        var e_6, _a;
        try {
            for (var _b = __values(this.players), _c = _b.next(); !_c.done; _c = _b.next()) {
                var player = _c.value;
                player.socket.emit("you", player.forClientDetail());
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_6) throw e_6.error; }
        }
    };
    Game.prototype.emitInitialLog = function (userid, socket) {
        socket.emit("initialLog", this.log.initial());
    };
    Game.prototype.listen = function () {
        var _this = this;
        this.io.on("connection", function (socket) {
            var session = socket.request.session;
            var userid = session.userid;
            var player = null;
            _this.emitPlayer();
            if (_this.players.in(userid)) {
                player = _this.players.pick(userid);
                socket.emit("enterSuccess", player.forClientDetail());
                player.socket.updateSocket(socket);
                _this.emitPlayer();
            }
            _this.emitPhase();
            _this.emitInitialLog(userid, socket);
            socket.on("enter", function (data) {
                if (_this.players.in(userid))
                    return false;
                if (_this.players.num >= _this.capacity)
                    return false;
                data.userid = userid;
                data.socket = socket;
                player = _this.players.add(data);
                socket.emit("enterSuccess", player.forClientDetail());
                _this.emitPlayer();
            });
            socket.on("leave", function (data) {
                if (!player || player.isRM)
                    return false;
                _this.players.leave(userid);
                _this.emitPlayer();
            });
            socket.on("fix-player", function (data) {
                if (!player)
                    return false;
                _this.fixPersonalInfo(player, data);
            });
            socket.on("talk", function (data) {
                if (!player)
                    return false;
                _this.talk(player, data);
            });
            socket.on("vote", function (data) {
                if (!player)
                    return false;
                _this.vote(player, data);
            });
            socket.on("setWord", function (data) {
                if (!player || !player.canSetWord())
                    return false;
                _this.setWord(data);
            });
            socket.on("wolfWin", function (data) {
                if (!player || !player.canJudge())
                    return false;
                _this.changePhase("wolfWin");
            });
            socket.on("villageWin", function (data) {
                if (!player || !player.canJudge())
                    return false;
                _this.changePhase("villageWin");
            });
            socket.on("start", function (data) {
                if (!player || !player.hasPermittionOfRMCommand)
                    return false;
                _this.start();
            });
            socket.on("kick", function (data) {
                if (!player || !player.hasPermittionOfRMCommand)
                    return false;
                _this.players.kick(data.target);
                _this.emitPlayer();
            });
            socket.on("fix-rm", function (data) {
                if (!player || !player.hasPermittionOfRMCommand)
                    return false;
                _this.fixInfo(data);
            });
        });
        this.io.emit("refresh");
    };
    Game.prototype.close = function () {
        GameIO.writeHTML(this.log.all(), this.players.list, this.villageInfo());
        GameIO.update(this.vno, { state: "logged" });
    };
    return Game;
}());
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
var GameManager = /** @class */ (function () {
    function GameManager(io) {
        this.io = io;
        this.games = [];
        this.listen();
    }
    GameManager.prototype.listen = function () {
        console.log("listen!");
        var mgr = this;
        var rd = this.io.of(/^\/wordroom-\d+$/).on("connect", function (socket) {
            return __awaiter(this, void 0, void 0, function () {
                var nsp, vno, result, village;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            nsp = socket.nsp;
                            vno = nsp.name.match(/\d+/)[0] - 0;
                            if (mgr.games.includes(vno))
                                return [2 /*return*/, false];
                            mgr.games.push(vno);
                            return [4 /*yield*/, GameIO.find(vno)];
                        case 1:
                            result = _a.sent();
                            if (result) {
                                village = new Game(nsp, result);
                                village.listen();
                                console.log("listen room-" + vno);
                            }
                            return [2 /*return*/];
                    }
                });
            });
        });
    };
    return GameManager;
}());
module.exports = GameManager;
//# sourceMappingURL=wordwolf.js.map