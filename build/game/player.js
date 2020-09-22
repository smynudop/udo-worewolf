"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = exports.Visitor = void 0;
var socket_1 = require("./socket");
var status_1 = require("./status");
var schema_1 = require("../schema");
var Visitor = /** @class */ (function () {
    function Visitor(data, manager) {
        this.manager = manager;
        this.userid = data.userid;
        this.isPlayer = false;
        this.socket = new socket_1.PlayerSocket(data.socket);
        this.log = manager.log;
        this.isGM = false;
        this.isKariGM = false;
    }
    Object.defineProperty(Visitor.prototype, "hasPermittionOfGMCommand", {
        get: function () {
            return false;
        },
        enumerable: false,
        configurable: true
    });
    Visitor.prototype.forClientDetail = function () {
        return {};
    };
    Visitor.prototype.emitPersonalInfo = function () {
        this.socket.emit("enterSuccess", this.forClientDetail());
    };
    Visitor.prototype.talk = function (data) { };
    Visitor.prototype.vote = function (target) { };
    Visitor.prototype.update = function (data) { };
    Visitor.prototype.useAbility = function (data, isAuto) { };
    Visitor.prototype.emitInitialLog = function () {
        var logs = this.log.initial(this);
        this.socket.emit("initialLog", logs);
    };
    return Visitor;
}());
exports.Visitor = Visitor;
var Player = /** @class */ (function (_super) {
    __extends(Player, _super);
    function Player(data, manager) {
        var _this = _super.call(this, data, manager) || this;
        _this.no = data.no === undefined ? 997 : data.no;
        _this.userid = data.userid || "null";
        _this.cn = data.cn || "kari";
        _this.color = data.color || "red";
        _this.isPlayer = true;
        _this.isGM = data.isGM || false;
        _this.isKariGM = data.isKariGM || false;
        _this.isDamy = data.isDamy || false;
        _this.isNPC = data.isNPC || false;
        _this.waitCall = false;
        _this.trip = "";
        _this.manager = manager;
        _this.log = manager.log;
        _this.date = manager.date;
        _this.status = new status_1.Status(_this);
        _this.socket = new socket_1.PlayerSocket(data.socket);
        _this.getTrip();
        return _this;
    }
    Player.prototype.getTrip = function () {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isBot)
                            return [2 /*return*/, false];
                        return [4 /*yield*/, schema_1.User.findOne({ userid: this.userid }).exec()];
                    case 1:
                        user = _a.sent();
                        this.trip = user.trip;
                        return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(Player.prototype, "isAlive", {
        get: function () {
            return this.status.isAlive;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "isDead", {
        get: function () {
            return !this.status.isAlive;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "hasPermittionOfGMCommand", {
        get: function () {
            return (this.isGM || this.isKariGM) && this.date.is("prologue");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "isNull", {
        get: function () {
            return this.no == 997;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "isBot", {
        get: function () {
            return this.isDamy || this.isNPC || this.isNull;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "isUsedAbility", {
        get: function () {
            return this.status.isUsedAbility;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "isVote", {
        get: function () {
            return this.status.isVote;
        },
        enumerable: false,
        configurable: true
    });
    Player.prototype.has = function (attr) {
        return this.status.has(attr);
    };
    Player.prototype.hasnot = function (attr) {
        return this.status.hasnot(attr);
    };
    Player.prototype.winCondhas = function (attr) {
        return this.status.winCondhas(attr);
    };
    Player.prototype.except = function (attr) {
        this.status.except(attr);
    };
    Player.prototype.can = function (ability) {
        return this.status.can(ability);
    };
    Player.prototype.update = function (data) {
        var cn = data.cn.trim();
        if (cn.length == 0 || cn.length > 8)
            return false;
        this.cn = cn;
        this.color = data.color;
    };
    Player.prototype.forClientSummary = function () {
        return {
            type: "summary",
            no: this.no,
            cn: this.cn,
            color: this.color,
            isAlive: this.isAlive,
            waitCall: this.waitCall,
        };
    };
    Player.prototype.forClientDetail = function () {
        return {
            type: "detail",
            no: this.no,
            userid: this.userid,
            trip: this.trip,
            cn: this.cn,
            color: this.color,
            status: this.status.forClient(),
            isGM: this.isGM,
            isKariGM: this.isKariGM,
            isAlive: this.isAlive,
            vote: this.status.vote,
            ability: this.status.target,
            waitCall: this.waitCall,
        };
    };
    Player.prototype.emitPersonalInfo = function () {
        this.socket.emit("enterSuccess", this.forClientDetail());
    };
    Player.prototype.talk = function (data) {
        if (data.type == "discuss" && this.date.isBanTalk) {
            this.log.add("system", "banTalk");
            this.socket.emit("banTalk");
            return false;
        }
        if (this.waitCall) {
            this.call();
        }
        data.cn = this.cn;
        data.color = this.color;
        var option = {
            cn: this.cn,
            color: this.color,
            size: data.size,
            input: data.message,
            no: this.no,
        };
        this.log.add("talk", data.type, option);
    };
    Player.prototype.vote = function (data) {
        var target = this.pick(data.target);
        if (this.status.vote == target.no)
            return;
        this.status.vote = target.no;
        this.log.add("vote", "success", {
            no: this.no,
            player: this.cn,
            target: target.cn,
        });
        this.socket.emit("voteSuccess");
    };
    Player.prototype.pick = function (target) {
        if (typeof target == "number" || typeof target == "string") {
            return this.manager.pick(target);
        }
        return target;
    };
    Player.prototype.setTarget = function (target) {
        this.status.target = target.no;
    };
    Player.prototype.kill = function (reason) {
        this.status.isAlive = false;
        this.log.add("death", reason, {
            player: this.cn,
            no: this.no,
        });
    };
    Player.prototype.revive = function () {
        this.status.isAlive = true;
        this.log.add("comeback", "comeback", {
            player: this.cn,
        });
    };
    Player.prototype.reset = function () {
        this.status.vote = null;
        this.status.target = null;
    };
    Player.prototype.useAbility = function (data, isAuto) {
        isAuto = isAuto || false;
        var target = this.pick(data.target);
        this.setTarget(target);
        this.log.add("ability", data.type, {
            player: this.cn,
            target: target.cn,
            fortuneResult: target.status.fortuneResult,
            necroResult: target.status.necroResult,
            isAuto: isAuto,
            no: this.no,
        });
        this.socket.emit("useAbilitySuccess");
        if (data.type == "bite") {
            this.status.add("biter");
        }
    };
    Player.prototype.noticeDamy = function (damy) {
        this.log.add("ability", "reiko", {
            no: this.no,
            result: damy.status.nameja,
        });
    };
    Player.prototype.nightTalkType = function () {
        if (this.date.is("day"))
            return "discuss";
        if (this.status.canTalk("wolf"))
            return "wolf";
        if (this.status.canTalk("fox"))
            return "fox";
        if (this.status.canTalk("share"))
            return "share";
        return "tweet";
    };
    Player.prototype.randomSelectTarget = function () {
        return this.manager.lot(this.no);
    };
    Player.prototype.randomVote = function () {
        this.vote({ target: this.randomSelectTarget() });
    };
    Player.prototype.randomUseAbility = function (type) {
        this.useAbility({
            type: type,
            target: this.randomSelectTarget(),
        }, true);
    };
    Player.prototype.canTalkNow = function (data) {
        if (this.isNull)
            return false;
        var date = this.date;
        var hasStatus = this.status.canTalk(data.type);
        switch (data.type) {
            case "discuss":
                return ((date.canTalk(data.type) && this.isAlive && !this.isGM) ||
                    date.is("epilogue") ||
                    date.is("prologue"));
            case "tweet":
            case "share":
            case "fox":
            case "wolf":
                return date.canTalk(data.type) && hasStatus;
            case "grave":
                return hasStatus || this.isGM;
            case "gmMessage":
                return this.isGM;
        }
        return false;
    };
    Player.prototype.canVote = function (data) {
        if (this.isNull)
            return false;
        if (!this.date.canVote())
            return false;
        if (!this.manager.pick(data.target))
            return false;
        if (this.no == data.target)
            return false;
        if (this.isDead)
            return false;
        return true;
    };
    Player.prototype.canUseAbility = function (data) {
        if (this.isNull)
            return false;
        if (!this.date.canUseAbility())
            return false;
        var target = this.manager.pick(data.target);
        if (!target)
            return false;
        if (!this.status.can(data.type))
            return false;
        switch (data.type) {
            case "fortune":
                if (this.isUsedAbility)
                    return false;
                break;
            case "guard":
                break;
            case "bite":
                if (target.has("notBitten"))
                    return false;
                break;
            case "revive":
                if (target.isAlive)
                    return false;
                if (this.date.day < 3)
                    return false;
                break;
        }
        return true;
    };
    Player.prototype.startRollcall = function () {
        this.waitCall = true;
    };
    Player.prototype.call = function () {
        this.waitCall = false;
    };
    Player.prototype.judgeWinOrLose = function (winSide) {
        var isWin = this.status.judgeWinOrLose(winSide);
        var result = isWin ? "win" : "lose";
        this.log.add("result", result, {
            player: this.cn,
        });
    };
    return Player;
}(Visitor));
exports.Player = Player;
//# sourceMappingURL=player.js.map