"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VillageDate = void 0;
var moment = require("moment");
var VillageDate = /** @class */ (function () {
    function VillageDate(game) {
        this.day = 1;
        this.phase = "prologue";
        this.phaseLimit = null;
        this.timerFlg = null;
        this.isBanTalk = false;
        this.game = game;
    }
    VillageDate.prototype.setLimit = function (sec) {
        this.phaseLimit = moment().add(sec, "seconds").format();
    };
    VillageDate.prototype.clearLimit = function () {
        this.phaseLimit = null;
    };
    VillageDate.prototype.leftSeconds = function () {
        return this.phaseLimit ? moment().diff(this.phaseLimit, "seconds") * -1 : null;
    };
    VillageDate.prototype.sunrise = function () {
        this.day++;
    };
    VillageDate.prototype.pass = function (phase) {
        this.phase = phase;
        if (phase == "day") {
            this.sunrise();
        }
    };
    VillageDate.prototype.forLog = function () {
        return { day: this.day, phase: this.phase };
    };
    VillageDate.prototype.is = function (phase) {
        return phase == this.phase;
    };
    VillageDate.prototype.canTalk = function (type) {
        switch (type) {
            case "share":
            case "fox":
                return this.is("night") || this.is("ability");
            case "wolf":
                return this.is("night");
            case "discuss":
                return ["prologue", "day", "epilogue"].includes(this.phase);
            case "tweet":
                return ["day", "vote", "night", "ability"].includes(this.phase);
        }
    };
    VillageDate.prototype.canVote = function () {
        return this.is("day") || this.is("vote");
    };
    VillageDate.prototype.canUseAbility = function () {
        return this.is("night") || this.is("ability");
    };
    VillageDate.prototype.setNsec = function (sec) {
        var _this = this;
        this.isBanTalk = true;
        setTimeout(function () {
            _this.isBanTalk = false;
        }, sec * 1000);
    };
    VillageDate.prototype.setTimer = function (nextPhase, sec) {
        var _this = this;
        this.clearTimer();
        this.timerFlg = setTimeout(function () {
            _this.game.changePhase(nextPhase);
        }, sec * 1000);
        this.setLimit(sec);
    };
    VillageDate.prototype.clearTimer = function () {
        clearTimeout(this.timerFlg);
        this.clearLimit();
    };
    return VillageDate;
}());
exports.VillageDate = VillageDate;
//# sourceMappingURL=villageDate.js.map