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
exports.Game = void 0;
var playerManager_1 = require("./playerManager");
var flagManager_1 = require("./flagManager");
var log_1 = require("./log");
var villageDate_1 = require("./villageDate");
var gameIO_1 = require("./gameIO");
var command_1 = require("./command");
var cast_1 = require("./cast");
var moment = require("moment");
var Game = /** @class */ (function () {
    function Game(io, data) {
        this.io = io;
        this.vno = data.vno || 1;
        this.name = data.name || "とある村";
        this.pr = data.pr || "宣伝文が設定されていません";
        this.casttype = data.casttype || "Y";
        this.time = data.time || {
            day: 285,
            vote: 150,
            night: 180,
            ability: 120,
            nsec: 15,
        };
        this.GMid = data.GMid;
        this.capacity = data.capacity || 17;
        this.isShowJobDead = data.isShowJobDead || true;
        this.isKariGM = data.kariGM;
        this.date = new villageDate_1.VillageDate(this);
        this.log = new log_1.Log(io, this.date);
        this.players = new playerManager_1.PlayerManager(this);
        this.flagManager = new flagManager_1.FlagManager(this.players);
        this.leftVoteNum = 4;
        this.win = "";
        this.nullPlayer = this.players.nullPlayer;
        //this.log.add("system", "vinfo", this.villageInfo())
        this.players.summonDamy();
        this.players.setGM(data.GMid, this.isKariGM);
        this.listen();
    }
    Game.prototype.fixInfo = function (data) {
        for (var key in data) {
            if (this[key] === undefined)
                continue;
            this[key] = data[key];
        }
        gameIO_1.GameIO.update(this.vno, data);
        //this.log.add("system", "vinfo", this.villageInfo())
    };
    Game.prototype.fixPersonalInfo = function (player, data) {
        this.emitPlayerAll();
    };
    Game.prototype.startRollcall = function () {
        this.flagManager.startRollcall();
        this.emitPlayerAll();
        this.log.add("system", "startRollCall");
    };
    Game.prototype.assignRoom = function () {
        this.flagManager.assignRoom(this.isShowJobDead);
    };
    Game.prototype.npcTalk = function () {
        var e_1, _a;
        try {
            for (var _b = __values(this.players.NPC()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var player = _c.value;
                var talkType = player.nightTalkType();
                var data = {
                    no: player.no,
                    cn: player.cn,
                    color: player.color,
                    input: command_1.talkTemplate[talkType].lot(),
                    type: talkType,
                };
                this.log.add("talk", talkType, data);
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
    Game.prototype.villageInfo = function () {
        return {
            name: this.name,
            pr: this.pr,
            no: this.vno,
            time: this.time,
            GMid: this.GMid,
            capacity: this.capacity,
            casttype: this.casttype,
            isShowJobDead: this.isShowJobDead,
        };
    };
    Game.prototype.emitPlayerAll = function () {
        var summary = this.players.forClientSummary();
        var detail = this.players.forClientDetail();
        if (this.date.is("epilogue")) {
            this.io.emit("player", detail);
        }
        else {
            this.io.emit("player", summary);
            this.io.to("gm").to("all").emit("player", detail);
        }
    };
    Game.prototype.emitPlayer = function (socket) {
        if (!socket)
            return false;
        var summary = this.players.forClientSummary();
        var detail = this.players.forClientDetail();
        if (this.date.is("epilogue")) {
            socket.emit("player", detail);
        }
        else {
            socket.emit("player", summary);
        }
    };
    Game.prototype.canStart = function () {
        return this.players.num >= 4 && this.date.is("prologue");
    };
    Game.prototype.start = function () {
        if (!this.canStart())
            return false;
        gameIO_1.GameIO.update(this.vno, { state: "playing" });
        this.date.pass("vote"); // これをやらないとログが出ない
        this.casting();
        this.emitPersonalData();
        this.changePhase("night");
    };
    Game.prototype.casting = function () {
        var e_2, _a;
        var castlist = cast_1.castManager.jobList(this.casttype, this.players.num);
        if (!castlist)
            return false;
        var job, i;
        try {
            for (var _b = __values(this.players), _c = _b.next(); !_c.done; _c = _b.next()) {
                var player = _c.value;
                do {
                    i = Math.floor(Math.random() * castlist.length);
                    job = castlist[i];
                } while (player.isDamy && job.onlyNotDamy);
                player.status.set(job);
                castlist.splice(i, 1);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        this.assignRoom();
        this.players.setKnow();
        var txt = cast_1.castManager.makeCastTxt(this.casttype, this.players.num);
        if (!txt)
            return false;
        this.log.add("system", "cast", { message: txt });
    };
    Game.prototype.checkCast = function () {
        if (!this.canStart())
            return false;
        var txt = cast_1.castManager.makeCastTxtAll(this.players.num);
        if (!txt)
            return false;
        this.log.add("system", "info", { message: txt });
    };
    Game.prototype.endCheck = function () {
        var alives = this.players.numBySpecies();
        var human = alives.human, wolf = alives.wolf, fox = alives.fox;
        if (wolf == 0) {
            this.win = fox ? "fox" : "human";
            this.finish();
            return true;
        }
        if (wolf >= human) {
            this.win = fox ? "fox" : "wolf";
            this.finish();
            return true;
        }
        return false;
    };
    Game.prototype.draw = function () {
        this.win = "draw";
        this.finish();
    };
    Game.prototype.compileVote = function () {
        var e_3, _a;
        if (this.date.day == 1)
            return true;
        try {
            for (var _b = __values(this.players.savoVote()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var player = _c.value;
                player.randomVote();
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
        var voteResult = this.players.compileVote();
        this.log.add("vote", "summary", {
            message: voteResult.table,
            day: this.date.day,
        });
        if (voteResult.exec) {
            voteResult.exec.status.add("maxVoted");
        }
        return voteResult.exec;
    };
    Game.prototype.nightReset = function () {
        this.flagManager.reset();
        this.assignRoom();
        this.leftVoteNum = 4;
    };
    Game.prototype.morningReset = function () {
        this.flagManager.updateStatus();
        this.assignRoom();
    };
    Game.prototype.setnsec = function () {
        if (!this.time.nsec)
            return false;
        this.date.setNsec(this.time.nsec);
    };
    Game.prototype.checkAllVote = function () {
        if (this.players.isCompleteVote()) {
            this.changePhase("night");
        }
    };
    Game.prototype.changePhase = function (phase) {
        switch (phase) {
            case "night":
                this.date.pass("vote");
                var isExec = this.compileVote();
                if (!isExec) {
                    this.changePhase("revote");
                    return false;
                }
                this.flagManager.nightProgress();
                if (this.endCheck())
                    return false;
                this.nightReset();
                this.pass("night");
                this.flagManager.useNightAbility();
                this.npcTalk();
                break;
            case "ability":
                this.pass("ability");
                break;
            case "day":
                this.flagManager.morningProgress();
                if (this.endCheck())
                    return false;
                this.pass("day");
                this.morningReset();
                this.setnsec();
                break;
            case "vote":
                this.pass("vote");
                this.flagManager.npcVote();
                if (this.players.isCompleteVote()) {
                    this.changePhase("night");
                    return false;
                }
                break;
            case "revote":
                this.leftVoteNum--;
                if (!this.leftVoteNum) {
                    this.draw();
                    return false;
                }
                this.log.add("phase", "revote", {
                    left: this.leftVoteNum,
                });
                this.flagManager.resetVote();
                this.pass("revote");
                this.flagManager.npcVote();
                if (this.players.isCompleteVote()) {
                    this.changePhase("night");
                    return false;
                }
                break;
        }
    };
    Game.prototype.finish = function () {
        var _this = this;
        var sides = {
            human: "村人",
            wolf: "人狼",
            fox: "妖狐",
            draw: "引き分け",
        };
        if (this.win != "draw") {
            this.log.add("gameend", "win", { side: sides[this.win] });
        }
        else {
            this.log.add("gameend", "draw");
        }
        this.date.pass("epilogue");
        this.date.clearTimer();
        this.emitPersonalData();
        this.emitChangePhase("epilogue");
        this.emitResult();
        this.emitPlayerAll();
        this.emitAllLog();
        gameIO_1.GameIO.update(this.vno, { state: "finish" });
        var logtime = moment().add(10, "minute").format("YYYY/MM/DD HH:mm:ss");
        this.log.add("system", "loggedDate", { message: logtime });
        setTimeout(function () {
            _this.close();
        }, 1000 * 60 * 10);
    };
    Game.prototype.emitResult = function () {
        var e_4, _a, e_5, _b;
        if (this.win == "draw") {
            try {
                for (var _c = __values(this.players), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var player = _d.value;
                    this.log.add("result", "draw", { player: player.cn });
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_4) throw e_4.error; }
            }
            return false;
        }
        try {
            for (var _e = __values(this.players), _f = _e.next(); !_f.done; _f = _e.next()) {
                var player = _f.value;
                player.judgeWinOrLose(this.win);
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
    Game.prototype.emitChangePhase = function (phase) {
        var nsec = phase == "day" && this.time.nsec ? this.time.nsec : null;
        this.io.emit("changePhase", {
            phase: phase,
            left: this.time[phase],
            nsec: nsec,
            targets: this.players.makeTargets(),
            deathTargets: this.players.makeDeathTargets(),
            day: this.date.day,
        });
    };
    Game.prototype.emitInitialPhase = function (socket) {
        var time = this.date.leftSeconds();
        socket.emit("changePhase", {
            phase: this.date.phase,
            left: time,
            targets: this.players.makeTargets(),
            day: this.date.day,
            villageInfo: this.villageInfo(),
        });
    };
    Game.prototype.emitPersonalData = function () {
        var e_6, _a;
        try {
            for (var _b = __values(this.players.listAll), _c = _b.next(); !_c.done; _c = _b.next()) {
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
    Game.prototype.pass = function (phase) {
        var next = {
            day: "vote",
            vote: "night",
            night: "ability",
            ability: "day",
        };
        if (phase == "revote") {
            phase = "vote";
            this.date.pass("vote");
        }
        else {
            this.date.pass(phase);
            this.log.add("phase", this.date.phase, { day: this.date.day });
        }
        this.emitPersonalData();
        this.emitPlayerAll();
        this.emitChangePhase(phase);
        this.date.setTimer(next[phase], this.time[phase]);
    };
    Game.prototype.emitAllLog = function () {
        this.io.emit("initialLog", this.log.all());
    };
    Game.prototype.listen = function () {
        var _this = this;
        this.io.on("connection", function (socket) {
            var session = socket.request.session;
            var userid = session.userid;
            var player;
            _this.emitPlayer(socket);
            if (_this.players.in(userid)) {
                player = _this.players.pick(userid);
                player.socket.updateSocket(socket);
                player.emitPersonalInfo();
                _this.assignRoom();
                _this.emitPlayerAll();
            }
            else {
                var data = { userid: userid, socket: socket };
                player = _this.players.newVisitor(data);
            }
            _this.emitInitialPhase(socket);
            player.emitInitialLog();
            socket.on("enter", function (data) {
                if (_this.players.in(userid))
                    return false;
                if (_this.players.num >= _this.capacity)
                    return false;
                data.userid = userid;
                data.socket = socket;
                player = _this.players.add(data);
                player.emitPersonalInfo();
                _this.emitPlayerAll();
            });
            socket.on("leave", function (data) {
                if (!player || player.isGM || player.isKariGM)
                    return false;
                _this.players.leave(userid);
                _this.emitPlayerAll();
            });
            socket.on("fix-player", function (data) {
                player.update(data);
                _this.emitPlayerAll();
            });
            socket.on("talk", function (data) {
                player.talk(data);
                _this.emitPlayerAll(); // 要改善
            });
            socket.on("vote", function (data) {
                player.vote(data);
                _this.checkAllVote();
            });
            socket.on("ability", function (data) {
                var e_7, _a;
                player.useAbility(data);
                switch (data.type) {
                    case "bite":
                        try {
                            for (var _b = __values(_this.players.has("biter")), _c = _b.next(); !_c.done; _c = _b.next()) {
                                var biter = _c.value;
                                biter.except("biter");
                            }
                        }
                        catch (e_7_1) { e_7 = { error: e_7_1 }; }
                        finally {
                            try {
                                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                            }
                            finally { if (e_7) throw e_7.error; }
                        }
                        _this.io.to("wolf").emit("useAbilitySuccess");
                        break;
                }
            });
            socket.on("rollcall", function (data) {
                if (!player.hasPermittionOfGMCommand)
                    return false;
                _this.startRollcall();
            });
            socket.on("start", function (data) {
                if (!player.hasPermittionOfGMCommand)
                    return false;
                _this.start();
            });
            socket.on("summonNPC", function (data) {
                if (!player.hasPermittionOfGMCommand)
                    return false;
                _this.players.summonNPC();
                _this.emitPlayerAll();
            });
            socket.on("checkCast", function (data) {
                if (!player.hasPermittionOfGMCommand)
                    return false;
                _this.checkCast();
            });
            socket.on("kick", function (data) {
                if (!player.hasPermittionOfGMCommand)
                    return false;
                _this.players.kick(data.target);
                _this.emitPlayerAll();
            });
            socket.on("fix-gm", function (data) {
                if (!player.hasPermittionOfGMCommand)
                    return false;
                _this.fixInfo(data);
            });
        });
        this.io.emit("refresh");
    };
    Game.prototype.close = function () {
        gameIO_1.GameIO.writeHTML(this.log.all(), this.players.list, this.villageInfo());
        gameIO_1.GameIO.update(this.vno, { state: "logged" });
    };
    return Game;
}());
exports.Game = Game;
//# sourceMappingURL=game.js.map