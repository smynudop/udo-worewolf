import moment from "moment"

import { ILog, Log } from "./word-log"
import { User, Wordwolf as GameSchema } from "../schema"
import { PlayerSocket } from "./socket"
import type * as SocketIO from "socket.io"

import fs from "fs"
import ejs from "ejs"

interface IPlayer {
  no?: number
  userid: string
  cn?: string
  color?: string
  isRM?: boolean
  isNPC?: boolean
  trip?: string
  socket?: any
}

class Player {
  no: number
  userid: string
  cn: string
  color: string
  isRM: boolean
  isNPC: boolean
  trip: string
  job: string
  vote: any
  manager: PlayerManager
  log: Log
  socket: any

  constructor(data: IPlayer, manager: PlayerManager) {
    this.no = data.no === undefined ? 997 : data.no
    this.userid = data.userid || "null"

    this.cn = data.cn || "kari"
    this.color = data.color || "red"
    this.isRM = data.isRM || false
    this.isNPC = data.isNPC || false
    this.trip = ""

    this.job = ""
    this.vote = {
      target: null,
      targetName: "",
      get: 0,
    }

    this.manager = manager
    this.log = manager.log

    this.socket = new PlayerSocket(data.socket)
    this.socket.join("player-" + this.no)

    this.getTrip()
  }

  async getTrip() {
    const user = await User.findOne({ userid: this.userid }).exec()
    this.trip = user.trip
  }

  changeVote(target: Player) {
    if (this.vote.target === target.no) return false
    if (this.no == target.no) return false
    if (this.isGM) return false

    this.vote.target = target.no
    this.vote.targetName = target.cn
  }

  cancelVote() {
    this.vote.target = null
    this.vote.targetName = ""
  }

  setJob(job: string) {
    this.job = job
  }

  reset() {
    this.job = ""
    this.vote = {
      target: null,
      targetName: "",
      get: 0,
    }
  }

  forClientSummary() {
    return {
      no: this.no,
      userid: this.userid,
      trip: this.trip,
      color: this.color,
      cn: this.cn,
      vote: this.vote,
      isGM: this.isGM,
    }
  }

  forClientDetail() {
    return {
      no: this.no,
      userid: this.userid,
      trip: this.trip,
      color: this.color,
      cn: this.cn,
      job: this.job,
      vote: this.vote,
      isRM: this.isRM,
      isGM: this.isGM,
    }
  }

  get isVillager() {
    return this.job == "villager"
  }

  get isWolf() {
    return this.job == "wolf"
  }

  get isGM() {
    return this.job == "GM"
  }

  get hasJob() {
    return this.job !== ""
  }

  canJudge() {
    return this.isGM
  }

  canSetWord() {
    return this.isGM
  }

  hasPermittionOfRMCommand() {
    return this.isRM
  }

  update(cn: string, color: string) {
    this.cn = cn
    this.color = color
  }
}

class PlayerManager {
  players: { [k: number]: Player }
  list: Player[]
  listAll: Player[]
  userid2no: any
  count: number
  npcNames: string[]
  log: Log
  constructor(game: Game) {
    this.players = {}
    this.list = []
    this.listAll = []
    this.userid2no = {}
    this.count = 0
    this.npcNames = [
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

    this.log = game.log
  }

  add(data: IPlayer) {
    const no = this.count
    data.no = no
    const p = new Player(data, this)

    const userid = data.userid

    this.userid2no[userid] = no
    this.players[no] = p
    this.count++
    this.refreshList()

    this.log.add("addPlayer", {
      player: p.cn,
    })

    return p
  }

  leave(userid: string) {
    const id = this.pick(userid).no
    const p = this.players[id]
    p.socket.emit("leaveSuccess")

    this.log.add("leavePlayer", {
      player: p.cn,
    })
    delete this.players[id]
    delete this.userid2no[userid]
    this.refreshList()
  }

  kick(target: number) {
    if (!(target in this.players)) return false
    const p = this.pick(target)

    if (p.isRM) return false

    const userid = p.userid
    p.socket.emit("leaveSuccess")

    this.log.add("kick", {
      player: p.cn,
    })
    delete this.players[target]
    delete this.userid2no[userid]
    this.refreshList()
  }

  in(userid: string) {
    return userid in this.userid2no
  }

  pick(id: number | string) {
    if (typeof id == "string") {
      if (isNaN(parseInt(id))) {
        id = this.userid2no[id]
      } else {
        id = parseInt(id)
      }
    }
    return this.players[+id]
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

  reset() {
    for (const player of this) {
      player.reset()
    }
  }

  selectGM() {
    this.reset()
    const gm = this.list.lot()
    gm.setJob("GM")
    this.log.add("selectGM", { gm: gm })
  }

  casting(wnum: number, vword: string, wword: string) {
    const players = this.list.filter((p) => !p.isGM)
    for (let cnt = 0; cnt < wnum; cnt++) {
      const i = Math.floor(Math.random() * players.length)
      players[i].setJob("wolf")
      players.splice(i, 1)
    }

    for (const player of players) {
      if (!player.hasJob) player.setJob("villager")
    }

    this.log.add("discussStart")

    for (const player of this.list) {
      if (player.isVillager) {
        this.log.add("word", { word: vword, player: player })
      }
      if (player.isWolf) {
        this.log.add("word", { word: wword, player: player })
      }
      if (player.isGM) {
        this.log.add("gmword", { vword: vword, wword: wword, player: player })
      }
    }
  }

  get num() {
    return this.list.length
  }

  setRM(rmid: string) {
    this.add({
      userid: rmid,
      socket: null,
      cn: "ルームマスター",
      color: "orange",
      isRM: true,
    })
    return false
  }

  compileVote() {
    const gets = this.list.map((p) => p.vote.get)
    console.log(gets)
    const getmax = Math.max(...gets)

    const maxGetters = this.list.filter((p) => p.vote.get == getmax)
    let exec: Player | null = maxGetters[0]
    if (maxGetters.length >= 2 || getmax == 0) {
      exec = null
    }
    return {
      exec: exec,
    }
  }

  countVote() {
    for (const player of this) {
      player.vote.get = 0
    }
    for (const player of this) {
      if (player.vote.target === null) continue
      const target = this.pick(player.vote.target)
      target.vote.get++
    }
  }

  *[Symbol.iterator]() {
    yield* this.list
  }
}

interface IGameData {
  io: any
  vno: number
  name: string
  pr: string
  time: { [key: string]: number }
  GMid: string
  limit: any
  wolfNum: number
  capacity: number
}

interface IVoteData {
  target: number
}

interface IGMData {
  wolfNum: number
  wword: string
  vword: string
}

class Game {
  io: SocketIO.Namespace
  vno: number
  name: string
  pr: string
  time: { [key: string]: number }
  RMid: string
  phase: string
  limit: any
  vword: string
  wword: string
  wolfNum: number
  log: Log
  players: PlayerManager
  timerFlg: any
  capacity: number

  constructor(io: SocketIO.Namespace, data: IGameData) {
    this.io = io

    this.vno = data.vno || 1
    this.name = data.name || "とある村"
    this.pr = data.pr || "宣伝文が設定されていません"
    this.time = data.time || {
      setWord: 120,
      discuss: 180,
      counter: 60,
    }
    this.RMid = data.GMid
    this.phase = "idol"
    this.capacity = 20

    this.limit = null

    this.vword = ""
    this.wword = ""
    this.wolfNum = 1

    this.log = new Log(io)
    this.players = new PlayerManager(this)

    this.timerFlg = null

    this.log.add("vinfo", this.villageInfo())

    this.players.setRM(this.RMid)
  }

  setLimit(sec: number) {
    this.limit = moment().add(sec, "seconds").format()
  }

  clearLimit() {
    this.limit = null
  }

  leftSeconds() {
    return this.limit ? moment().diff(this.limit, "seconds") * -1 : null
  }

  fixInfo(data: IGameData) {
    this.name = data.name || this.name
    this.pr = data.pr || this.pr
    this.time = data.time || data.pr

    GameIO.update(this.vno, data)
    this.log.add("vinfo", this.villageInfo())
  }

  fixPersonalInfo(player: Player, data: IPlayer) {
    let cn = data.cn || ""
    cn = cn.trim()
    if (cn.length == 0 || cn.length > 8) cn = player.cn

    const color = data.color || player.color

    player.update(cn, color)

    this.emitPlayer()
  }

  villageInfo() {
    return {
      name: this.name,
      pr: this.pr,
      no: this.vno,
      time: this.time,
      RMid: this.RMid,
    }
  }

  emitPlayer() {
    if (this.phaseIs("discuss")) {
      this.io.emit("player", this.players.forClientSummary())
    } else {
      this.io.emit("player", this.players.forClientDetail())
    }
  }

  emitPhase() {
    this.io.emit("changePhase", {
      phase: this.phase,
      villageInfo: this.villageInfo(),
      targets: {},
      left: this.leftSeconds(),
    })
  }

  talk(player: Player, data: ILog) {
    data.cn = player.cn
    data.color = player.color

    this.log.add("talk", data)
  }

  vote(player: Player, data: IVoteData) {
    if (!player) return false
    if (!this.phaseIs("discuss")) return false

    if (data.target === null) {
      player.cancelVote()
    } else {
      const target = this.players.pick(data.target)
      if (!target) return false
      player.changeVote(target)
    }

    this.players.countVote()
    this.emitPlayer()
  }

  phaseIs(phase: string) {
    return this.phase == phase
  }

  canStart() {
    return this.players.num >= 4 && this.phaseIs("idol")
  }

  setWord(data: IGMData) {
    if (this.phase != "setWord") return false

    this.vword = data.vword
    this.wword = data.wword
    this.wolfNum = data.wolfNum

    if (this.wolfNum >= this.players.num / 2) {
      this.wolfNum = Math.floor(this.players.num / 2) - 1
    }

    this.changePhase("discuss")
  }

  start() {
    if (!this.canStart()) return false
    this.changePhase("setWord")
  }

  casting() {
    this.players.casting(this.wolfNum, this.vword, this.wword)
  }

  counter() {
    this.log.add("counter")
  }

  finish(side: string) {
    this.log.add("release", { vword: this.vword, wword: this.wword })
    this.log.add("finish", { side: side })
    this.players.reset()

    this.changePhase("idol")
  }

  compileVote() {
    const result = this.players.compileVote()
    if (result.exec) {
      this.log.add("exec", { player: result.exec })
      return result.exec.isWolf
    } else {
      this.log.add("noexec")
      return false
    }
  }

  break() {
    this.log.add("break")
    this.changePhase("idol")
  }

  changePhase(phase: string) {
    this.phase = phase
    this.setTimer(phase)

    switch (phase) {
      case "setWord":
        this.players.selectGM()
        this.emitPersonalData()
        this.emitPlayer()
        this.emitPhase()
        break
      case "discuss":
        this.casting()
        this.emitPhase()
        break
      case "exec":
        if (this.compileVote()) {
          this.changePhase("counter")
          return false
        } else {
          this.changePhase("wolfWin")
          return false
        }
        break
      case "counter":
        this.counter()
        this.emitPhase()
        this.emitPlayer()
        break
      case "villageWin":
        this.finish("village")
        break
      case "wolfWin":
        this.finish("wolf")
        break
      case "break":
        this.break()
        break
      case "idol":
        this.emitPhase()
        this.emitPlayer()
        break
    }
  }

  setTimer(phase: string) {
    clearTimeout(this.timerFlg)
    this.clearLimit()

    switch (phase) {
      case "setWord":
        this.timerFlg = setTimeout(() => {
          this.changePhase("break")
        }, this.time.setWord * 1000)
        this.setLimit(this.time.setWord)
        break

      case "discuss":
        this.timerFlg = setTimeout(() => {
          this.changePhase("exec")
        }, this.time.discuss * 1000)
        this.setLimit(this.time.discuss)

        break

      case "counter":
        this.timerFlg = setTimeout(() => {
          this.changePhase("wolfWin")
        }, this.time.counter * 1000)
        this.setLimit(this.time.counter)
        break
    }
  }

  emitPersonalData() {
    for (const player of this.players) {
      player.socket.emit("you", player.forClientDetail())
    }
  }

  emitInitialLog(userid: string, socket: SocketIO.Socket) {
    socket.emit("initialLog", this.log.initial())
  }

  listen() {
    this.io.on("connection", (socket: SocketIO.Socket) => {
      //@ts-ignore
      const session = socket.request.session
      const userid = session.userid
      let player: Player | null = null

      this.emitPlayer()

      if (this.players.in(userid)) {
        player = this.players.pick(userid)

        socket.emit("enterSuccess", player.forClientDetail())

        player.socket.updateSocket(socket)

        this.emitPlayer()
      }

      this.emitPhase()
      this.emitInitialLog(userid, socket)

      socket.on("enter", (data) => {
        if (this.players.in(userid)) return false
        if (this.players.num >= this.capacity) return false

        data.userid = userid
        data.socket = socket
        player = this.players.add(data)

        socket.emit("enterSuccess", player.forClientDetail())
        this.emitPlayer()
      })

      socket.on("leave", (data) => {
        if (!player || player.isRM) return false
        this.players.leave(userid)
        this.emitPlayer()
      })

      socket.on("fix-player", (data) => {
        if (!player) return false
        this.fixPersonalInfo(player, data)
      })

      socket.on("talk", (data) => {
        if (!player) return false
        this.talk(player, data)
      })

      socket.on("vote", (data) => {
        if (!player) return false
        this.vote(player, data)
      })

      socket.on("setWord", (data) => {
        if (!player || !player.canSetWord()) return false
        this.setWord(data)
      })

      socket.on("wolfWin", (data) => {
        if (!player || !player.canJudge()) return false
        this.changePhase("wolfWin")
      })

      socket.on("villageWin", (data) => {
        if (!player || !player.canJudge()) return false
        this.changePhase("villageWin")
      })

      socket.on("start", (data) => {
        if (!player || !player.hasPermittionOfRMCommand) return false
        this.start()
      })

      socket.on("kick", (data) => {
        if (!player || !player.hasPermittionOfRMCommand) return false

        this.players.kick(data.target)
        this.emitPlayer()
      })

      socket.on("fix-rm", (data) => {
        if (!player || !player.hasPermittionOfRMCommand) return false

        this.fixInfo(data)
      })
    })
    this.io.emit("refresh")
  }

  close() {
    GameIO.writeHTML(this.log.all(), this.players.list, this.villageInfo())
    GameIO.update(this.vno, { state: "logged" })
  }
}

export class GameIO {
  static writeHTML(log: any, player: Player[], vinfo: any) {
    ejs.renderFile(
      "./views/worewolf_html.ejs",
      {
        logs: log,
        players: player,
        vinfo: vinfo,
      },
      function (err: any, html: string) {
        if (err) console.log(err)
        html = html.replace(/\n{3,}/, "\n")
        fs.writeFile(
          "./public/log/" + vinfo.no + ".html",
          html,
          "utf8",
          function (err: any) {
            console.log(err)
          }
        )
      }
    )
  }

  static update(vno: number, data: any) {
    GameSchema.updateOne(
      { vno: vno },
      { $set: data },
      undefined,
      (err: any) => {
        if (err) console.log(err)
      }
    )
  }

  static find(vno: number) {
    return GameSchema.findOne({ vno: vno }).exec()
  }
}

export class GameManager {
  io: SocketIO.Server
  games: number[]

  constructor(io: SocketIO.Server) {
    this.io = io
    this.games = []
    this.listen()
  }

  listen() {
    console.log("listen!")

    const rd = this.io
      .of(/^\/wordroom-\d+$/)
      .on("connect", async (socket: SocketIO.Socket) => {
        const nsp = socket.nsp
        const vno = +nsp.name.match(/\d+/)![0]
        if (this.games.includes(vno)) return false

        this.games.push(vno)

        const result = await GameIO.find(vno)

        if (result) {
          const village = new Game(nsp, result)
          village.listen()
          console.log("listen room-" + vno)
        }
      })
  }
}
