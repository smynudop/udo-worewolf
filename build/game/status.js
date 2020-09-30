"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Status = void 0;
const abilityInfo = require("./command").abilityInfo;
const talkInfo = require("./command").talkInfo;
class Status {
    constructor(player) {
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
    command() {
        return this.ability
            .map((a) => {
            let info = abilityInfo[a];
            if (!info)
                return null;
            info.target = this.player.manager.makeTargets(info.targetType);
            return info;
        })
            .filter((a) => a !== null);
    }
    talkCommand() {
        let commands = [];
        for (let type in talkInfo) {
            let t = talkInfo[type];
            if (this.player.canTalkNow({ type: type })) {
                commands.push(t);
            }
        }
        return commands;
    }
    forClient() {
        let desc = this.desc
            ? `あなたは【${this.nameja}】です。<br>${this.desc}${this.knowText}`
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
    }
    set(job) {
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
    }
    get isUsedAbility() {
        return this.target !== null;
    }
    get isVote() {
        return this.vote !== null;
    }
    add(attr, player) {
        this.temporary.push(attr);
        this.limit[attr] = this.date.day;
        if (this.has("standoff") && attr == "bitten" && player) {
            player.status.add("stand");
        }
        if (this.has("standoff") && attr == "maxVoted") {
            let s = this.player.randomSelectTarget();
            s.status.add("stand");
        }
    }
    except(attr) {
        if (this.temporary.includes(attr)) {
            this.temporary = this.temporary.filter((a) => a != attr);
            delete this.limit[attr];
        }
    }
    can(ability) {
        return this.ability.includes(ability);
    }
    canTalk(type) {
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
    }
    canWatch(type) {
        return this.talk.includes(type) || this.watch.includes(type);
    }
    canKnow(job) {
        return this.know.includes(job) || this.watch.includes(job) || this.talk.includes(job);
    }
    has(attr) {
        return this.forever.includes(attr) || this.temporary.includes(attr);
    }
    hasnot(attr) {
        return !this.has(attr);
    }
    winCondhas(attr) {
        return this.winCond.includes(attr);
    }
    get hasAliveDecoy() {
        return this.player.manager.select((p) => p.status.name == "slave").length > 0;
    }
    get isDead() {
        return !this.isAlive;
    }
    update() {
        let newTemporary = [];
        for (let attr of this.temporary) {
            if (!this.limit[attr])
                continue;
            if (this.limit[attr] >= this.date.day) {
                newTemporary.push(attr);
            }
            else {
                delete this.limit[attr];
            }
        }
        this.temporary = newTemporary;
    }
    isDeadRival() {
        let result = true;
        for (let rival of this.rival) {
            if (!this.playerManager.isDeadAllJob(rival)) {
                result = false;
            }
        }
        return result;
    }
    judgeWinOrLose(winSide) {
        let isWin = true;
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
    }
}
exports.Status = Status;
//# sourceMappingURL=status.js.map