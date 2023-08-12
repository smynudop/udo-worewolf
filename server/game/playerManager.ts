import { IPlayerData, IVisitorData, Player, Visitor } from "./player"
import { Log } from "./log"
import { VillageDate } from "./villageDate"
import { castManager } from "./cast"
import { Game } from "./game"
import { IAbility } from "./status"

const npcNames = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
]

export class PlayerManager {
  players: Record<number, Player>
  list: Player[]
  listAll: Player[]
  userid2no: Record<string, number>
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

  newVisitor(data: IVisitorData) {
    let visitor = new Visitor(data, this)
    return visitor
  }

  add(data: IPlayerData) {
    var no = this.count
    data.no = no
    var p = new Player(data, this)

    var userid = data.userid

    this.userid2no[userid] = no
    this.players[no] = p
    this.count++
    this.refreshList()

    this.log.add("player", "add", {
      player: p.cn,
    })

    return p
  }

  leave(userid: string) {
    var id = this.pick(userid).no
    var p = this.players[id]
    p.socket.emit("leaveSuccess")

    this.log.add("player", "leave", { player: p.cn })
    delete this.players[id]
    delete this.userid2no[userid]
    this.refreshList()
  }

  kick(target: string) {
    var iTarget = +target

    if (!(target in this.players)) return false
    var p = this.pick(target)

    if (p.isGM || p.isKariGM || p.isDamy) return false

    var userid = p.userid
    p.socket.emit("leaveSuccess")

    this.log.add("player", "kick", {
      player: p.cn,
    })
    delete this.players[iTarget]
    delete this.userid2no[userid]
    this.refreshList()
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
    var human = this.select((p) => p.status.job.species == "human").length
    var wolf = this.select((p) => p.status.job.species == "wolf").length
    var fox = this.select((p) => p.status.job.species == "fox").length

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

  pick(id: number | string | Player): Player {
    if (typeof id == "number") {
      return this.players[id]
    } else if (typeof id == "string") {
      if (isNaN(parseInt(id))) {
        id = this.userid2no[id]
      } else {
        id = parseInt(id)
      }

      return this.players[id]
    } else {
      return id
    }
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
    var votes: Record<number, number> = {}
    var table = `<table class="votesummary"><tbody>`

    for (var player of this.alive()) {
      var target = this.pick(player.status.vote!)
      var get = this.alive().filter((p) => p.status.vote == player.no).length
      votes[player.no] = get

      table += `<tr class="eachVote"><td>${player.cn}</td><td>(${get})</td><td>→</td><td>${target.cn}</td></tr>`
    }

    table += "</tbody></table>"

    var max = Math.max(...Object.values(votes))
    var maxers = Object.keys(votes).filter((v) => votes[+v] == max)

    var exec = maxers.length == 1 ? this.pick(maxers[0]) : null

    return {
      table: table,
      exec: exec,
    }
  }

  setKnow() {
    var wolf = this.select((p) => p.status.job.species == "wolf")
      .map((p) => p.cn)
      .join("、")
    var share = this.select((p) => p.status.job.name == "share")
      .map((p) => p.cn)
      .join("、")
    var fox = this.select((p) => p.status.job.species == "fox")
      .map((p) => p.cn)
      .join("、")
    var noble = this.select((p) => p.status.job.name == "noble")
      .map((p) => p.cn)
      .join("、")

    const texts: Record<string, string> = {
      wolf: "<br>【能力発動】人狼は" + wolf,
      share: "<br>【能力発動】共有者は" + share,
      fox: "<br>【能力発動】妖狐は" + fox,
      noble: "<br>【能力発動】貴族は" + noble,
    }

    for (var player of this) {
      for (let job in texts) {
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
      socket: null,
      cn: "初日犠牲者",
      color: "orange",
      isDamy: true,
      isNPC: true,
    })
  }

  summonNPC() {
    var cn = npcNames.shift()
    this.add({
      userid: "damy-" + cn,
      socket: null,
      cn: cn,
      color: "orange",
      isNPC: true,
    })
  }

  setGM(gmid: string, isKari: boolean) {
    if (isKari) {
      this.add({
        userid: gmid,
        socket: null,
        cn: "仮GM",
        color: "orange",
        isKariGM: true,
      })
      return false
    }
    var gm = new Player(
      {
        userid: gmid,
        socket: null,
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
    var targets: Record<number, string> = {}
    if (type == "alive") {
      for (var player of this.alive()) {
        targets[player.no] = player.cn
      }
    } else {
      for (var player of this.dead()) {
        targets[player.no] = player.cn
      }
    }

    return targets
  }

  *[Symbol.iterator]() {
    yield* this.list
  }
}
