"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Status = void 0;
const cast_1 = require("./cast");
const command_1 = require("./command");
class Status {
    constructor(player) {
        this.job = new cast_1.Job("damy");
        this.attributes = [];
        this.isAlive = true;
        this.knowText = "";
        this.target = null;
        this.vote = null;
        this.player = player;
        this.playerManager = player.manager;
        this.date = player.date;
    }
    get isUsedAbility() {
        return this.target !== null;
    }
    get isVote() {
        return this.vote !== null;
    }
    get hasAliveDecoy() {
        return this.player.manager.select((p) => p.status.job.name == "slave").length > 0;
    }
    get isDead() {
        return !this.isAlive;
    }
    command() {
        return this.job.ability
            .map((a) => {
            let info = command_1.abilityInfo[a];
            if (!info)
                return null;
            info.target = this.player.manager.makeTargets(info.targetType);
            return info;
        })
            .filter((a) => a !== null);
    }
    talkCommand() {
        let commands = [];
        for (let type in command_1.talkInfo) {
            let t = command_1.talkInfo[type];
            if (this.player.canTalkNow({ type: type })) {
                commands.push(t);
            }
        }
        return commands;
    }
    forClient() {
        let desc = this.job.desc
            ? `あなたは【${this.job.nameja}】です。<br>${this.job.desc}${this.knowText}`
            : "";
        return {
            name: this.job.name,
            nameja: this.job.nameja,
            desc: desc,
            ability: this.job.ability,
            target: this.target,
            vote: this.vote,
            command: this.command(),
            talkCommand: this.talkCommand(),
        };
    }
    set(job) {
        this.job = job;
        this.attributes = job.forever.map((a) => { return { name: a, limit: 999 }; });
    }
    add(attr, player) {
        this.attributes.push({ name: attr, limit: this.date.day });
        if (this.has("standoff") && attr == "bitten" && player) {
            player.status.add("stand");
        }
        if (this.has("standoff") && attr == "maxVoted") {
            let s = this.player.randomSelectTarget();
            s.status.add("stand");
        }
    }
    except(attr) {
        this.attributes = this.attributes.filter((a) => a.name != attr);
    }
    can(ability) {
        return this.job.ability.includes(ability);
    }
    canTalk(type) {
        switch (type) {
            case "share":
            case "fox":
            case "wolf":
                return this.job.talk.includes(type) && this.isAlive;
            case "discuss":
            case "tweet":
                return this.isAlive;
            case "grave":
                return this.isDead;
            case "gmMessage":
                return true;
        }
    }
    canWatch(type) {
        return this.job.talk.includes(type) || this.job.watch.includes(type);
    }
    canKnow(job) {
        return this.job.knowFriend.includes(job) || this.job.watch.includes(job) || this.job.talk.includes(job);
    }
    has(attr) {
        return this.attributes.some((a) => a.name == attr);
    }
    hasnot(attr) {
        return !this.has(attr);
    }
    winCondhas(attr) {
        return this.job.winCond.includes(attr);
    }
    update() {
        this.attributes = this.attributes.filter((a) => a.limit >= this.date.day);
    }
    isDeadRival() {
        let result = this.job.rival.every((rival) => this.playerManager.isDeadAllJob(rival));
        return result;
    }
    judgeWinOrLose(winSide) {
        let isWin = true;
        if (this.winCondhas("winCamp") && this.job.camp != winSide) {
            isWin = false;
        }
        if (this.winCondhas("alive") && this.isDead) {
            isWin = false;
        }
        if (this.winCondhas("killRival") && !this.isDeadRival()) {
            isWin = false;
        }
        return isWin;
    }
}
exports.Status = Status;
//# sourceMappingURL=status.js.map