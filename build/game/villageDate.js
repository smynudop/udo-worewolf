"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VillageDate = void 0;
const moment = require("moment");
class VillageDate {
    constructor(game) {
        this.day = 1;
        this.phase = "prologue";
        this.phaseLimit = null;
        this.timerFlg = null;
        this.isBanTalk = false;
        this.game = game;
    }
    setLimit(sec) {
        this.phaseLimit = moment().add(sec, "seconds").format();
    }
    clearLimit() {
        this.phaseLimit = null;
    }
    leftSeconds() {
        return this.phaseLimit ? moment().diff(this.phaseLimit, "seconds") * -1 : null;
    }
    sunrise() {
        this.day++;
    }
    pass(phase) {
        this.phase = phase;
        if (phase == "day") {
            this.sunrise();
        }
    }
    forLog() {
        return { day: this.day, phase: this.phase };
    }
    is(phase) {
        return phase == this.phase;
    }
    canTalk(type) {
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
    }
    canVote() {
        return this.is("day") || this.is("vote");
    }
    canUseAbility() {
        return this.is("night") || this.is("ability");
    }
    setNsec(sec) {
        this.isBanTalk = true;
        setTimeout(() => {
            this.isBanTalk = false;
        }, sec * 1000);
    }
    setTimer(nextPhase, sec) {
        this.clearTimer();
        this.timerFlg = setTimeout(() => {
            this.game.changePhase(nextPhase);
        }, sec * 1000);
        this.setLimit(sec);
    }
    clearTimer() {
        clearTimeout(this.timerFlg);
        this.clearLimit();
    }
}
exports.VillageDate = VillageDate;
//# sourceMappingURL=villageDate.js.map