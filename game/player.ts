import { PlayerManager } from "./playerManager"
import { PlayerSocket } from "./socket"
import { Log } from "./log"
import { VillageDate } from "./villageDate"
import { Status } from "./status"

import { User } from "../schema"
import { messageOption } from "./messageTemplate"

export class Visitor {
    manager: PlayerManager
    userid: string
    isPlayer: boolean
    socket: PlayerSocket
    isGM: boolean
    isKariGM: boolean
    log: Log

    constructor(data: any, manager: PlayerManager) {
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

    talk(data) {}

    vote(target) {}

    update(data) {}

    useAbility(data, isAuto?: false) {}

    emitInitialLog() {
        var logs = this.log.initial(this)
        this.socket.emit("initialLog", logs)
    }
}

interface voteData {
    target: Player | number | string
}

interface abilityData {
    target: Player | number | string
    type: string
}

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
    status: Status
    socket: PlayerSocket
    constructor(data, manager) {
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

        this.status = new Status(this)
        this.socket = new PlayerSocket(data.socket)

        this.getTrip()
    }

    async getTrip() {
        if (this.isBot) return false
        let user = await User.findOne({ userid: this.userid }).exec()
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

    has(attr) {
        return this.status.has(attr)
    }

    hasnot(attr) {
        return this.status.hasnot(attr)
    }

    winCondhas(attr) {
        return this.status.winCondhas(attr)
    }

    except(attr) {
        this.status.except(attr)
    }

    can(ability) {
        return this.status.can(ability)
    }

    update(data) {
        var cn = data.cn.trim()
        if (cn.length == 0 || cn.length > 8) return false

        this.cn = cn
        this.color = data.color
    }

    forClientSummary() {
        return {
            type: "summary",
            no: this.no,
            cn: this.cn,
            color: this.color,
            isAlive: this.isAlive,
            waitCall: this.waitCall,
        }
    }

    forClientDetail() {
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

    talk(data) {
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

        let option: messageOption = {
            cn: this.cn,
            color: this.color,
            size: data.size,
            input: data.message,
            no: this.no,
        }

        this.log.add("talk", data.type, option)
    }

    vote<voteData2 extends voteData>(data: voteData2) {
        var target = this.pick(data.target)

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

    kill(reason) {
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

    useAbility<T extends abilityData>(data: T, isAuto?) {
        isAuto = isAuto || false

        let target = this.pick(data.target)

        this.setTarget(target)
        this.log.add("ability", data.type, {
            player: this.cn,
            target: target.cn,
            fortuneResult: target.status.fortuneResult,
            necroResult: target.status.necroResult,
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
            result: damy.status.nameja,
        })
    }

    nightTalkType() {
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

    randomUseAbility(type: string) {
        this.useAbility(
            {
                type: type,
                target: this.randomSelectTarget(),
            },
            true
        )
    }

    canTalkNow(data) {
        if (this.isNull) return false
        let date = this.date
        let hasStatus = this.status.canTalk(data.type)

        switch (data.type) {
            case "discuss":
                return (
                    (date.canTalk(data.type) && this.isAlive && !this.isGM) ||
                    date.is("epilogue") ||
                    date.is("prologue")
                )

            case "tweet":
            case "share":
            case "fox":
            case "wolf":
                return date.canTalk(data.type) && hasStatus

            case "grave":
                return hasStatus || this.isGM

            case "gmMessage":
                return this.isGM
        }
        return false
    }

    canVote(data) {
        if (this.isNull) return false

        if (!this.date.canVote()) return false

        if (!this.manager.pick(data.target)) return false
        if (this.no == data.target) return false
        if (this.isDead) return false

        return true
    }

    canUseAbility(data) {
        if (this.isNull) return false

        if (!this.date.canUseAbility()) return false

        var target = this.manager.pick(data.target)
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

    judgeWinOrLose(winSide) {
        let isWin = this.status.judgeWinOrLose(winSide)
        let result = isWin ? "win" : "lose"
        this.log.add("result", result, {
            player: this.cn,
        })
    }
}
