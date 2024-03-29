import { IPlayerData, Player } from "./player"
import { Log } from "./log"
import { VillageDate } from "./villageDate"
import { castManager } from "./cast"
import { Game } from "./game"
import { IAbility } from "./status"
import { keyof } from "../common/utilities"

const npcNames = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N"]

export class PlayerManager {
    players: { [key in number]: Player }
    list: Player[]
    listAll: Player[]
    userid2no: { [key in string]: number }
    count: number
    log: Log
    date: VillageDate

    constructor(game: Game) {
        this.players = {}
        this.list = []
        this.listAll = []
        this.userid2no = {}
        this.count = 0

        this.log = game.log
        this.date = game.date
    }

    add(data: Omit<IPlayerData, "no">) {
        const no = this.count
        const p = new Player({ ...data, no: this.count }, this)

        const userid = data.userid

        this.userid2no[userid] = no
        this.players[no] = p
        this.count++
        this.refreshList()

        this.log.add("player", "add", {
            player: p.cn,
        })

        return p
    }

    leave(userid: string): Player | null {
        const p = this.getByUserId(userid)
        if (!p) return null

        this.log.add("player", "leave", { player: p.cn })
        delete this.players[p.no]
        delete this.userid2no[userid]
        this.refreshList()

        return p
    }

    kick(target: number): Player | null {
        //todo
        const iTarget = +target

        const p = this.getPlayerByNo(target)
        if (!p) return null

        if (p.isGM || p.isKariGM || p.isDamy) return null

        const userid = p.userid

        this.log.add("player", "kick", {
            player: p.cn,
        })
        delete this.players[iTarget]
        delete this.userid2no[userid]
        this.refreshList()

        return p
    }

    in(userid: string) {
        return userid in this.userid2no
    }

    refreshList() {
        this.list = Object.values(this.players).filter((p) => p.no < 990)
        this.listAll = Object.values(this.players)
    }

    forClientSummary() {
        return this.listAll.map((p) => p.forClientSummary())
    }

    forClientDetail() {
        return this.listAll.map((p) => p.forClientDetail())
    }

    get num() {
        return this.list.length
    }

    numBySpecies() {
        const human = this.select((p) => p.status.job.species == "human").length
        const wolf = this.select((p) => p.status.job.species == "wolf").length
        const fox = this.select((p) => p.status.job.species == "fox").length

        return {
            human: human,
            wolf: wolf,
            fox: fox,
        }
    }

    alive() {
        return this.list.filter((p) => p.isAlive)
    }

    dead() {
        return this.list.filter((p) => !p.isAlive)
    }

    getPlayerByNo(no: number): Player | undefined {
        return this.listAll.find((x) => x.no == no)
    }

    getByUserId(userid: string): Player | undefined {
        return this.listAll.find((x) => x.userid == userid)
    }

    damy() {
        return this.players[0]
    }

    NPC() {
        return this.alive().filter((p) => p.isNPC)
    }

    lot(ignore: number) {
        return this.alive()
            .filter((p) => p.no != ignore)
            .lot()
    }

    select(func: (p: Player) => boolean) {
        return this.alive().filter((p) => func(p))
    }

    has(attr: string) {
        return this.alive().filter((p) => p.has(attr))
    }

    selectAll(func: (p: Player) => boolean) {
        return this.list.filter((p) => func(p))
    }

    compileVote() {
        const votes: Record<number, number> = {}
        let table = `<table class="votesummary"><tbody>`

        for (const player of this.alive()) {
            const target = this.getPlayerByNo(player.status.vote!)!
            const get = this.alive().filter((p) => p.status.vote == player.no).length
            votes[player.no] = get

            table += `<tr class="eachVote"><td>${player.cn}</td><td>(${get})</td><td>→</td><td>${target.cn}</td></tr>`
        }

        table += "</tbody></table>"

        const max = Math.max(...Object.values(votes))
        const maxers = keyof(votes).filter((v) => votes[+v] == max)

        const exec = maxers.length == 1 ? this.getPlayerByNo(maxers[0]) : undefined

        return {
            table: table,
            exec: exec,
        }
    }

    setKnow() {
        const wolf = this.select((p) => p.status.job.species == "wolf")
            .map((p) => p.cn)
            .join("、")
        const share = this.select((p) => p.status.job.name == "share")
            .map((p) => p.cn)
            .join("、")
        const fox = this.select((p) => p.status.job.species == "fox")
            .map((p) => p.cn)
            .join("、")
        const noble = this.select((p) => p.status.job.name == "noble")
            .map((p) => p.cn)
            .join("、")

        const texts: Record<string, string> = {
            wolf: "<br>【能力発動】人狼は" + wolf,
            share: "<br>【能力発動】共有者は" + share,
            fox: "<br>【能力発動】妖狐は" + fox,
            noble: "<br>【能力発動】貴族は" + noble,
        }

        for (const player of this) {
            for (const job in texts) {
                if (player.status.canKnow(job)) {
                    player.status.knowText += texts[job]
                }
            }
        }
    }

    isDeadAllFox() {
        return this.select((p) => p.status.job.species == "fox").length == 0
    }

    isDeadAllJob(job: string) {
        return this.select((p) => p.status.job.name == job).length == 0
    }

    summonDamy() {
        this.add({
            userid: "shonichi",
            cn: "初日犠牲者",
            color: "orange",
            isDamy: true,
            isNPC: true,
        })
    }

    summonNPC() {
        const cn = npcNames.shift() ?? "damy-xxx"
        this.add({
            userid: "damy-" + cn,
            cn: cn,
            color: "orange",
            isNPC: true,
        })
    }

    setGM(gmid: string, isKari: boolean) {
        if (isKari) {
            this.add({
                userid: gmid,
                cn: "仮GM",
                color: "orange",
                isKariGM: true,
            })
            return false
        }
        const gm = new Player(
            {
                userid: gmid,
                no: 999,
                isGM: true,
                cn: "ゲームマスター",
                color: "gm",
            },
            this
        )
        this.players[999] = gm
        this.userid2no[gmid] = 999
        gm.status.set(castManager.job("GM"))
        this.refreshList()
    }

    isCompleteVote() {
        return this.alive().every((p) => p.isVote)
    }

    savoVote() {
        return this.alive().filter((p) => !p.isVote)
    }

    savoAbility(ability: IAbility) {
        return this.alive().filter((p) => !p.isUsedAbility && p.status.can(ability))
    }

    makeTargets(type?: string): Record<number, string> {
        type = type || "alive"
        const targets: Record<number, string> = {}
        if (type == "alive") {
            for (const player of this.alive()) {
                targets[player.no] = player.cn
            }
        } else {
            for (const player of this.dead()) {
                targets[player.no] = player.cn
            }
        }

        return targets
    }

    *[Symbol.iterator]() {
        yield* this.list
    }
}
