"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlagManager = void 0;
class FlagManager {
    constructor(pm) {
        this.players = pm;
        this.date = pm.date;
        this.log = pm.log;
    }
    reset() {
        for (var player of this.players) {
            player.reset();
        }
    }
    updateStatus() {
        for (let player of this.players) {
            player.status.update();
        }
    }
    resetVote() {
        for (var player of this.players) {
            player.status.vote = null;
        }
    }
    npcVote() {
        for (var npc of this.players.NPC()) {
            npc.randomVote();
        }
    }
    morningProgress() {
        this.autoUseAbility();
        this.guard();
        this.attack();
        this.killStand();
        this.revive();
        this.fellow();
    }
    nightProgress() {
        this.execution();
        this.killStandoff();
        this.fellow();
    }
    useNightAbility() {
        if (this.date.day == 1) {
            var damy = this.players.damy();
            damy.status.add("bitten");
            this.log.add("ability", "bite", { player: "狼", target: damy.cn });
            for (var reiko of this.players.has("knowdamy")) {
                reiko.noticeDamy(damy);
            }
        }
        if (this.date.day < 2)
            return false;
        let exec = this.players.selectAll((p) => p.has("executed"))[0];
        if (!exec)
            return false;
        for (var player of this.players.select((p) => p.status.can("necro"))) {
            player.useAbility({ type: "necro", target: exec });
        }
    }
    execution() {
        for (let player of this.players.has("maxVoted")) {
            player.kill("exec");
            player.status.add("executed");
        }
    }
    killStandoff() {
        for (let player of this.players.has("stand")) {
            player.kill("standoff");
        }
    }
    fellow() {
        if (this.players.isDeadAllFox()) {
            for (var imo of this.players.has("fellowFox")) {
                imo.kill("fellow");
            }
        }
    }
    killStand() {
        for (var stand of this.players.has("stand")) {
            stand.kill("bite");
        }
    }
    autoUseAbility() {
        /*自動噛み処理*/
        let biter = this.players.has("biter");
        if (!biter.length && this.date.day >= 2) {
            var autobiter = this.players.select((p) => p.status.can("bite")).lot();
            var target = this.players.select((p) => !p.status.can("bite")).lot();
            autobiter.useAbility({ type: "bite", target: target }, true);
        }
        /*自動占い*/
        for (var player of this.players.savoAbility("fortune")) {
            player.randomUseAbility("fortune");
        }
        /*自動護衛*/
        if (this.date.day < 2)
            return false;
        for (var player of this.players.savoAbility("guard")) {
            player.randomUseAbility("guard");
        }
    }
    guard() {
        if (this.date.day >= 2) {
            for (var player of this.players.select((p) => p.status.can("guard"))) {
                var target = this.players.pick(player.status.target);
                target.status.add("guarded");
            }
        }
    }
    revive() {
        for (let player of this.players.select((p) => p.status.can("revive"))) {
            if (!player.isUsedAbility)
                continue;
            let target = this.players.pick(player.status.target);
            let threshold = target.isDamy ? 50 : 30;
            if (Math.floor(Math.random() * 100) < threshold) {
                target.status.add("revive");
            }
        }
        for (let player of this.players.has("revive")) {
            player.revive();
        }
    }
    attack() {
        for (let player of this.players.has("biter")) {
            let target = this.players.pick(player.status.target);
            target.status.add("bitten", player);
        }
        for (let player of this.players.has("bitten")) {
            if (player.has("guarded") || player.has("resistBite"))
                continue;
            if (player.has("useDecoy") && player.status.hasAliveDecoy) {
                for (let decoy of this.players.select((p) => p.status.job.name == "slave")) {
                    decoy.status.add("stand");
                }
                continue;
            }
            player.status.add("eaten");
        }
        for (var fortune of this.players.select((p) => p.can("fortune"))) {
            var target = this.players.pick(fortune.status.target);
            target.status.add("fortuned");
        }
        for (var fortuned of this.players.has("fortuned")) {
            if (fortuned.has("melt")) {
                fortuned.status.add("eaten");
            }
        }
        for (var eaten of this.players.has("eaten")) {
            eaten.kill("bite");
        }
    }
    startRollcall() {
        for (let player of this.players) {
            if (player.isBot)
                continue;
            player.startRollcall();
        }
    }
    assignRoom(isShowJobDead) {
        for (let player of this.players.listAll) {
            var socket = player.socket;
            socket.join("player-" + player.no);
            if (player.isGM) {
                socket.join("gm");
            }
            if (player.isDead) {
                socket.join("grave");
                if (isShowJobDead) {
                    socket.join("all");
                }
            }
            else {
                socket.leave("grave");
            }
            if (player.status.canWatch("share")) {
                socket.join("share");
            }
            if (player.status.canWatch("wolf")) {
                socket.join("wolf");
            }
            if (player.status.canWatch("fox")) {
                socket.join("fox");
            }
        }
    }
}
exports.FlagManager = FlagManager;
//# sourceMappingURL=flagManager.js.map