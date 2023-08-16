import { PlayerManager } from "./playerManager"
import { Log } from "./log"
import { VillageDate } from "./villageDate"
import { IStatusForClient, StatusManager } from "./statusManager"

import { User } from "../db/instance"
import { MessageOption as MessageOption, TalkOption } from "./messageTemplate"
import { ITalkType } from "./constants"
import { IAbility, IPassiveAbilities } from "./status"

export type IVoteData = {
    target: number
}

export type IAbilityData = {
    target: number
    type: IAbility | IPassiveAbilities
}

export type ITalkData = {
    size: string
    type: ITalkType
    message: string
}

export type IUpdatePlayerData = {
    cn: string
    color: string
}

export interface IPlayerData {
    userid: string
    no: number
    cn: string
    color: string
    isGM?: boolean
    isKariGM?: boolean
    isDamy?: boolean
    isNPC?: boolean
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

export class Player {
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
    rooms: Set<string> = new Set<string>()
    constructor(data: IPlayerData, manager: PlayerManager) {
        this.userid = data.userid
        this.isPlayer = true
        this.no = data.no

        this.cn = data.cn || "kari"
        this.color = data.color || "red"
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

        this.getTrip()
    }

    async getTrip() {
        if (this.isBot) return false
        const user = await User.findOne({ userid: this.userid })
        this.trip = user?.trip ?? ""
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

    update(data: IUpdatePlayerData) {
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

    talk(data: ITalkData): "success" | "nsec" {


        if (this.waitCall) {
            this.call()
        }

        const option: TalkOption = {
            cn: this.cn,
            color: this.color,
            size: data.size,
            input: data.message,
            no: this.no,
        }

        this.log.addTalk(data.type, option)
        return "success"
    }

    vote(data: IVoteData) {
        const target = this.manager.getPlayerByNo(data.target)
        if (!target) return

        if (this.status.vote == target.no) return
        this.status.vote = target.no
        this.log.add("vote", "success", {
            no: this.no,
            player: this.cn,
            target: target.cn,
        })
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

    useAbility(data: IAbilityData, isAuto: boolean = false) {
        const target = this.manager.getPlayerByNo(data.target)
        if (!target) return

        this.setTarget(target)
        this.log.add("ability", data.type, {
            player: this.cn,
            target: target.cn,
            fortuneResult: target.status.job.fortuneResult,
            necroResult: target.status.job.necroResult,
            isAuto: isAuto,
            no: this.no,
        })

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
        this.vote({ target: this.randomSelectTarget().no })
    }

    randomUseAbility(type: IAbility) {
        this.useAbility(
            {
                type: type,
                target: this.randomSelectTarget().no,
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

    canVote(data: IVoteData) {
        if (this.isNull) return false

        if (!this.date.canVote()) return false

        if (!this.manager.getPlayerByNo(data.target)) return false
        if (this.no == data.target) return false
        if (this.isDead) return false

        return true
    }

    canUseAbility(data: IAbilityData) {
        if (this.isNull) return false

        if (!this.date.canUseAbility()) return false

        const target = this.manager.getPlayerByNo(data.target)
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
