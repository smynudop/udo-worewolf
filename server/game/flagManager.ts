import { PlayerManager } from "./playerManager"
import { VillageDate } from "./villageDate"
import { Log } from "./log"
import { Status, TemporaryStatus, Abilities, PassiveAbilities } from "./status"

export class FlagManager {
    players: PlayerManager
    date: VillageDate
    log: Log
    constructor(pm: PlayerManager) {
        this.players = pm
        this.date = pm.date
        this.log = pm.log
    }

    reset() {
        for (const player of this.players) {
            player.reset()
        }
    }

    updateStatus() {
        for (const player of this.players) {
            player.status.update()
        }
    }

    resetVote() {
        for (const player of this.players) {
            player.status.vote = null
        }
    }

    npcVote() {
        for (const npc of this.players.NPC()) {
            npc.randomVote()
        }
    }

    morningProgress() {
        this.autoUseAbility()

        this.guard()
        this.attack()
        this.killStand()
        this.revive()
        this.fellow()
    }

    nightProgress() {
        this.execution()
        this.killStandoff()
        this.fellow()
    }

    useNightAbility() {
        if (this.date.day == 1) {
            const damy = this.players.damy()
            damy.status.add(TemporaryStatus.bitten)
            this.log.add("ability", "bite", { player: "狼", target: damy.cn })

            for (const reiko of this.players.has(PassiveAbilities.knowdamy)) {
                reiko.noticeDamy(damy)
            }
        }

        if (this.date.day < 2) return false

        const exec = this.players.selectAll((p) => p.has(TemporaryStatus.executed))[0]
        if (!exec) return false

        for (const player of this.players.select((p) => p.status.can(PassiveAbilities.necro))) {
            player.useAbility({ type: PassiveAbilities.necro, target: exec })
        }
    }

    execution() {
        for (const player of this.players.has("maxVoted")) {
            player.kill("exec")
            player.status.add("executed")
        }
    }

    killStandoff() {
        for (const player of this.players.has("stand")) {
            player.kill("standoff")
        }
    }

    fellow() {
        if (this.players.isDeadAllFox()) {
            for (const imo of this.players.has("fellowFox")) {
                imo.kill("fellow")
            }
        }
    }

    killStand() {
        for (const stand of this.players.has("stand")) {
            stand.kill("bite")
        }
    }

    autoUseAbility() {
        /*自動噛み処理*/

        const biter = this.players.has("biter")
        if (!biter.length && this.date.day >= 2) {
            const autobiter = this.players.select((p) => p.status.can("bite")).lot()
            const target = this.players.select((p) => !p.status.can("bite")).lot()

            autobiter.useAbility({ type: "bite", target: target }, true)
        }

        /*自動占い*/
        for (const player of this.players.savoAbility("fortune")) {
            player.randomUseAbility("fortune")
        }

        /*自動護衛*/
        if (this.date.day < 2) return false

        for (const player of this.players.savoAbility("guard")) {
            player.randomUseAbility("guard")
        }
    }

    guard() {
        if (this.date.day >= 2) {
            for (const player of this.players.select((p) => p.status.can("guard"))) {
                const target = this.players.pick(player.status.target!)
                target.status.add("guarded")
            }
        }
    }

    revive() {
        for (const player of this.players.select((p) => p.status.can("revive"))) {
            if (!player.isUsedAbility) continue

            const target = this.players.pick(player.status.target!)
            const threshold = target.isDamy ? 50 : 30
            if (Math.floor(Math.random() * 100) < threshold) {
                target.status.add("revive")
            }
        }

        for (const player of this.players.has("revive")) {
            player.revive()
        }
    }

    attack() {
        for (const player of this.players.has("biter")) {
            const target = this.players.pick(player.status.target!)
            target.status.add("bitten", player)
        }

        for (const player of this.players.has("bitten")) {
            if (player.has("guarded") || player.has("resistBite")) continue

            if (player.has("useDecoy") && player.status.hasAliveDecoy) {
                for (const decoy of this.players.select((p) => p.status.job.name == "slave")) {
                    decoy.status.add("stand")
                }
                continue
            }

            player.status.add("eaten")
        }

        for (const fortune of this.players.select((p) => p.can("fortune"))) {
            const target = this.players.pick(fortune.status.target!)
            target.status.add("fortuned")
        }

        for (const fortuned of this.players.has("fortuned")) {
            if (fortuned.has("melt")) {
                fortuned.status.add("eaten")
            }
        }

        for (const eaten of this.players.has("eaten")) {
            eaten.kill("bite")
        }
    }
    startRollcall() {
        for (const player of this.players) {
            if (player.isBot) continue
            player.startRollcall()
        }
    }

    assignRoom(isShowJobDead: boolean) {
        for (const player of this.players.listAll) {
            const socket = player.socket

            socket.join("player-" + player.no)

            if (player.isGM) {
                socket.join("gm")
            }

            if (player.isDead) {
                socket.join("grave")
                if (isShowJobDead) {
                    socket.join("all")
                }
            } else {
                socket.leave("grave")
            }

            if (player.status.canWatch("share")) {
                socket.join("share")
            }

            if (player.status.canWatch("wolf")) {
                socket.join("wolf")
            }

            if (player.status.canWatch("fox")) {
                socket.join("fox")
            }
        }
    }
}
