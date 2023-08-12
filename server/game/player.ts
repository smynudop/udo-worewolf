import { PlayerManager } from "./playerManager"
import { PlayerSocket } from "./socket"
import { Log } from "./log"
import { VillageDate } from "./villageDate"
import { IStatusForClient, StatusManager } from "./statusManager"

import { User } from "../schema"
import { messageOption } from "./messageTemplate"
import { ITalkType } from "./constants"
import SocketIO from "socket.io"
import { IAbility, IPassiveAbilities } from "./status"

export interface IVisitorData {
  userid: string
  socket: SocketIO.Socket | null
}

export class Visitor {
  manager: PlayerManager
  userid: string
  isPlayer: boolean
  socket: PlayerSocket
  isGM: boolean
  isKariGM: boolean
  log: Log

  constructor(data: IVisitorData, manager: PlayerManager) {
    this.manager = manager
    this.userid = data.userid
    this.isPlayer = false
    this.socket = new PlayerSocket(data.socket)
    this.log = manager.log
    this.isGM = false
    this.isKariGM = false
  }

  get hasPermittionOfGMCommand() {
    return false
  }

  forClientDetail() {
    return {}
  }

  emitPersonalInfo() {
    this.socket.emit("enterSuccess", this.forClientDetail())
  }

  talk(data: any) {}

  vote(target: any) {}

  update(data: any) {}

  useAbility(data: any, isAuto?: false) {}

  emitInitialLog() {
    const logs = this.log.initial(this)
    this.socket.emit("initialLog", logs)
  }
}

interface voteData {
  target: Player | number | string
}

interface abilityData {
  target: Player | number | string
  type: IAbility | IPassiveAbilities
}

interface ITalkData {
  cn: string
  color: string
  size: string
  type: string
  message: string
}

export interface IPlayerData {
  userid: string
  socket: SocketIO.Socket | null

  no?: number
  cn?: string
  color?: string
  isPlayer?: boolean
  isGM?: boolean
  isKariGM?: boolean
  isDamy?: boolean
  isNPC?: boolean
  waitCall?: boolean
  trip?: string
}

export type IPlayerForVisitor = {
  type: "summary"
  no: number
  cn: string
  color: string
  isAlive: boolean
  waitCall: boolean
}

export type IPlayerforPlayer = {
  type: "detail"
  no: number
  userid: string
  trip: string
  cn: string
  color: string
  status: IStatusForClient
  isGM: boolean
  isKariGM: boolean
  isAlive: boolean
  vote: number | null
  ability: number | null
  waitCall: boolean
}

export type IPlayerForClient = IPlayerForVisitor | IPlayerforPlayer

export class Player extends Visitor {
  no: number
  userid: string
  cn: string
  color: string
  isPlayer: boolean
  isGM: boolean
  isKariGM: boolean
  isDamy: boolean
  isNPC: boolean
  waitCall: boolean
  trip: string
  manager: PlayerManager
  log: Log
  date: VillageDate
  status: StatusManager
  socket: PlayerSocket
  constructor(data: IPlayerData, manager: PlayerManager) {
    super(data, manager)
    this.no = data.no === undefined ? 997 : data.no
    this.userid = data.userid || "null"

    this.cn = data.cn || "kari"
    this.color = data.color || "red"
    this.isPlayer = true
    this.isGM = data.isGM || false
    this.isKariGM = data.isKariGM || false
    this.isDamy = data.isDamy || false
    this.isNPC = data.isNPC || false
    this.waitCall = false
    this.trip = ""

    this.manager = manager
    this.log = manager.log
    this.date = manager.date

    this.status = new StatusManager(this)
    this.socket = new PlayerSocket(data.socket)

    this.getTrip()
  }

  async getTrip() {
    if (this.isBot) return false
    const user = await User.findOne({ userid: this.userid }).exec()
    this.trip = user.trip
  }

  get isAlive() {
    return this.status.isAlive
  }

  get isDead() {
    return !this.status.isAlive
  }

  get hasPermittionOfGMCommand() {
    return (this.isGM || this.isKariGM) && this.date.is("prologue")
  }

  get isNull() {
    return this.no == 997
  }

  get isBot() {
    return this.isDamy || this.isNPC || this.isNull
  }

  get isUsedAbility() {
    return this.status.isUsedAbility
  }

  get isVote() {
    return this.status.isVote
  }

  has(attr: string) {
    return this.status.has(attr)
  }

  hasnot(attr: string) {
    return this.status.hasnot(attr)
  }

  winCondhas(attr: string) {
    return this.status.winCondhas(attr)
  }

  except(attr: string) {
    this.status.except(attr)
  }

  can(ability: IAbility) {
    return this.status.can(ability)
  }

  update(data: IPlayerData) {
    let cn = data.cn || ""
    cn = cn.trim()
    if (cn.length == 0 || cn.length > 8) cn = ""

    this.cn = cn || this.cn
    this.color = data.color || this.color
  }

  forClientSummary(): IPlayerForVisitor {
    return {
      type: "summary",
      no: this.no,
      cn: this.cn,
      color: this.color,
      isAlive: this.isAlive,
      waitCall: this.waitCall,
    }
  }

  forClientDetail(): IPlayerforPlayer {
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
    }
  }

  emitPersonalInfo() {
    this.socket.emit("enterSuccess", this.forClientDetail())
  }

  talk(data: ITalkData) {
    if (data.type == "discuss" && this.date.isBanTalk) {
      this.log.add("system", "banTalk")
      this.socket.emit("banTalk")
      return false
    }

    if (this.waitCall) {
      this.call()
    }

    data.cn = this.cn
    data.color = this.color

    const option: messageOption = {
      cn: this.cn,
      color: this.color,
      size: data.size,
      input: data.message,
      no: this.no,
    }

    this.log.add("talk", data.type, option)
  }

  vote(data: voteData) {
    const target = this.pick(data.target)

    if (this.status.vote == target.no) return
    this.status.vote = target.no
    this.log.add("vote", "success", {
      no: this.no,
      player: this.cn,
      target: target.cn,
    })
    this.socket.emit("voteSuccess")
  }

  pick(target: number | string | Player) {
    if (typeof target == "number" || typeof target == "string") {
      return this.manager.pick(target)
    }
    return target
  }

  setTarget(target: Player) {
    this.status.target = target.no
  }

  kill(reason: string) {
    this.status.isAlive = false
    this.log.add("death", reason, {
      player: this.cn,
      no: this.no,
    })
  }

  revive() {
    this.status.isAlive = true
    this.log.add("comeback", "comeback", {
      player: this.cn,
    })
  }

  reset() {
    this.status.vote = null
    this.status.target = null
  }

  useAbility(data: abilityData, isAuto?: boolean) {
    isAuto = isAuto || false

    const target = this.pick(data.target)

    this.setTarget(target)
    this.log.add("ability", data.type, {
      player: this.cn,
      target: target.cn,
      fortuneResult: target.status.job.fortuneResult,
      necroResult: target.status.job.necroResult,
      isAuto: isAuto,
      no: this.no,
    })
    this.socket.emit("useAbilitySuccess")

    if (data.type == "bite") {
      this.status.add("biter")
    }
  }

  noticeDamy(damy: Player) {
    this.log.add("ability", "reiko", {
      no: this.no,
      result: damy.status.job.nameja,
    })
  }

  nightTalkType(): ITalkType {
    if (this.date.is("day")) return "discuss"
    if (this.status.canTalk("wolf")) return "wolf"
    if (this.status.canTalk("fox")) return "fox"
    if (this.status.canTalk("share")) return "share"
    return "tweet"
  }

  randomSelectTarget() {
    return this.manager.lot(this.no)
  }

  randomVote() {
    this.vote({ target: this.randomSelectTarget() })
  }

  randomUseAbility(type: IAbility) {
    this.useAbility(
      {
        type: type,
        target: this.randomSelectTarget(),
      },
      true
    )
  }

  canTalkNow(talkType: ITalkType) {
    if (this.isNull) return false
    const date = this.date
    const hasStatus = this.status.canTalk(talkType)

    switch (talkType) {
      case "discuss":
        return (
          (date.canTalk(talkType) && this.isAlive && !this.isGM) ||
          date.is("epilogue") ||
          date.is("prologue")
        )

      case "tweet":
      case "share":
      case "fox":
      case "wolf":
        return date.canTalk(talkType) && hasStatus

      case "grave":
        return hasStatus || this.isGM

      case "gmMessage":
        return this.isGM
    }
    return false
  }

  canVote(data: voteData) {
    if (this.isNull) return false

    if (!this.date.canVote()) return false

    if (!this.manager.pick(data.target)) return false
    if (this.no == data.target) return false
    if (this.isDead) return false

    return true
  }

  canUseAbility(data: abilityData) {
    if (this.isNull) return false

    if (!this.date.canUseAbility()) return false

    const target = this.manager.pick(data.target)
    if (!target) return false

    if (!this.status.can(data.type)) return false

    switch (data.type) {
      case "fortune":
        if (this.isUsedAbility) return false
        break

      case "guard":
        break

      case "bite":
        if (target.has("notBitten")) return false
        break

      case "revive":
        if (target.isAlive) return false
        if (this.date.day < 3) return false
        break
    }
    return true
  }

  startRollcall() {
    this.waitCall = true
  }

  call() {
    this.waitCall = false
  }

  judgeWinOrLose(winSide: string) {
    const isWin = this.status.judgeWinOrLose(winSide)
    const result = isWin ? "win" : "lose"
    this.log.add("result", result, {
      player: this.cn,
    })
  }
}
