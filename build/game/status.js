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
exports.Status = void 0;
var abilityInfo = require("./command").abilityInfo;
var talkInfo = require("./command").talkInfo;
var Status = /** @class */ (function () {
    function Status(player) {
        this.name = "";
        this.nameja = "";
        this.camp = ""; //陣営
        this.species = ""; //種族(勝敗判定に使う)
        this.isAlive = true;
        this.fortuneResult = "村人";
        this.necroResult = "村人";
        this.desc = "";
        this.knowText = "";
        //永続の属性(呪殺・噛み耐性など)
        this.forever = [];
        //一時的な属性(噛まれた、占われた)
        this.temporary = [];
        //窓に発言する
        this.talk = [];
        //窓を見る
        this.watch = [];
        //能力
        this.ability = [];
        //役職を知る
        this.know = [];
        //打倒相手
        this.rival = [];
        this.winCond = [];
        this.limit = {};
        this.target = null;
        this.vote = null;
        this.player = player;
        this.playerManager = player.manager;
        this.date = player.date;
    }
    Status.prototype.command = function () {
        var _this = this;
        return this.ability
            .map(function (a) {
            var info = abilityInfo[a];
            if (!info)
                return null;
            info.target = _this.player.manager.makeTargets(info.targetType);
            return info;
        })
            .filter(function (a) { return a !== null; });
    };
    Status.prototype.talkCommand = function () {
        var commands = [];
        for (var type in talkInfo) {
            var t = talkInfo[type];
            if (this.player.canTalkNow({ type: type })) {
                commands.push(t);
            }
        }
        return commands;
    };
    Status.prototype.forClient = function () {
        var desc = this.desc
            ? "\u3042\u306A\u305F\u306F\u3010" + this.nameja + "\u3011\u3067\u3059\u3002<br>" + this.desc + this.knowText
            : "";
        return {
            name: this.name,
            nameja: this.nameja,
            desc: desc,
            ability: this.ability,
            target: this.target,
            vote: this.vote,
            command: this.command(),
            talkCommand: this.talkCommand(),
        };
    };
    Status.prototype.set = function (job) {
        this.name = job.name;
        this.nameja = job.nameja;
        this.camp = job.camp; //陣営
        this.species = job.species; //種族(勝敗判定に使う)
        this.fortuneResult = job.fortuneResult;
        this.necroResult = job.necroResult;
        this.desc = job.desc;
        this.talk = job.talk;
        this.watch = job.watch;
        this.ability = job.ability;
        this.know = job.knowFriend;
        this.forever = job.forever;
        this.winCond = job.winCond;
        this.rival = job.rival;
    };
    Object.defineProperty(Status.prototype, "isUsedAbility", {
        get: function () {
            return this.target !== null;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Status.prototype, "isVote", {
        get: function () {
            return this.vote !== null;
        },
        enumerable: false,
        configurable: true
    });
    Status.prototype.add = function (attr, player) {
        this.temporary.push(attr);
        this.limit[attr] = this.date.day;
        if (this.has("standoff") && attr == "bitten" && player) {
            player.status.add("stand");
        }
        if (this.has("standoff") && attr == "maxVoted") {
            var s = this.player.randomSelectTarget();
            s.status.add("stand");
        }
    };
    Status.prototype.except = function (attr) {
        if (this.temporary.includes(attr)) {
            this.temporary = this.temporary.filter(function (a) { return a != attr; });
            delete this.limit[attr];
        }
    };
    Status.prototype.can = function (ability) {
        return this.ability.includes(ability);
    };
    Status.prototype.canTalk = function (type) {
        switch (type) {
            case "share":
            case "fox":
            case "wolf":
                return this.talk.includes(type) && this.isAlive;
            case "discuss":
            case "tweet":
                return this.isAlive;
            case "grave":
                return this.isDead;
            case "gmMessage":
                return true;
        }
    };
    Status.prototype.canWatch = function (type) {
        return this.talk.includes(type) || this.watch.includes(type);
    };
    Status.prototype.canKnow = function (job) {
        return this.know.includes(job) || this.watch.includes(job) || this.talk.includes(job);
    };
    Status.prototype.has = function (attr) {
        return this.forever.includes(attr) || this.temporary.includes(attr);
    };
    Status.prototype.hasnot = function (attr) {
        return !this.has(attr);
    };
    Status.prototype.winCondhas = function (attr) {
        return this.winCond.includes(attr);
    };
    Object.defineProperty(Status.prototype, "hasAliveDecoy", {
        get: function () {
            return this.player.manager.select(function (p) { return p.status.name == "slave"; }).length > 0;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Status.prototype, "isDead", {
        get: function () {
            return !this.isAlive;
        },
        enumerable: false,
        configurable: true
    });
    Status.prototype.update = function () {
        var e_1, _a;
        var newTemporary = [];
        try {
            for (var _b = __values(this.temporary), _c = _b.next(); !_c.done; _c = _b.next()) {
                var attr = _c.value;
                if (!this.limit[attr])
                    continue;
                if (this.limit[attr] >= this.date.day) {
                    newTemporary.push(attr);
                }
                else {
                    delete this.limit[attr];
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
        this.temporary = newTemporary;
    };
    Status.prototype.isDeadRival = function () {
        var e_2, _a;
        var result = true;
        try {
            for (var _b = __values(this.rival), _c = _b.next(); !_c.done; _c = _b.next()) {
                var rival = _c.value;
                if (!this.playerManager.isDeadAllJob(rival)) {
                    result = false;
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
        return result;
    };
    Status.prototype.judgeWinOrLose = function (winSide) {
        var isWin = true;
        if (this.winCondhas("winCamp") && this.camp != winSide) {
            isWin = false;
        }
        if (this.winCondhas("alive") && this.isDead) {
            isWin = false;
        }
        if (this.winCondhas("killRival") && !this.isDeadRival()) {
            isWin = false;
        }
        return isWin;
    };
    return Status;
}());
exports.Status = Status;
//# sourceMappingURL=status.js.map