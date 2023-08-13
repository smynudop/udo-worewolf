import { Player } from "./player"
import { PlayerManager } from "./playerManager"
import { VillageDate } from "./villageDate"
import { Job, JobName } from "./job"
import { abilityInfo, talkInfo, ITalkDetail, IAbilityDetail, IAbilityType } from "./command"
import {
    Status,
    IStatus,
    IAbility,
    ITemporaryuStatus as ITemporaryStatus,
    IPassiveAbilities,
} from "./status"
import { keyof } from "../common/utilities"

export interface IStatusForClient {
    name: string
    nameja: string
    desc: string
    ability: string[]
    target: number | null
    vote: number | null
    command: ICommand[]
    talkCommand: ITalkDetail[]
}

export interface IStatusAttribute {
    name: IStatus | IAbility | ITemporaryStatus
    limit: number
}

type ICommand = IAbilityDetail & {
    target: { [key in number]: string }
}

export class StatusManager {
    job: Job

    isAlive: boolean
    knowText: string
    attributes: IStatusAttribute[]
    player: Player
    playerManager: PlayerManager
    date: VillageDate

    target: number | null
    vote: number | null

    constructor(player: Player) {
        this.job = new Job("damy")

        this.attributes = []

        this.isAlive = true

        this.knowText = ""

        this.target = null
        this.vote = null

        this.player = player
        this.playerManager = player.manager
        this.date = player.date
    }

    get isUsedAbility() {
        return this.target !== null
    }

    get isVote() {
        return this.vote !== null
    }

    get hasAliveDecoy() {
        return this.player.manager.select((p) => p.status.job.name == "slave").length > 0
    }

    get isDead() {
        return !this.isAlive
    }

    command(): ICommand[] {
        return this.job.ability
            .map((a) => {
                const info = abilityInfo[a]
                if (!info) return null
                const target = this.player.manager.makeTargets(info.targetType)
                return { ...info, target }
            })
            .filter((a): a is ICommand => a !== null)
    }

    talkCommand(): ITalkDetail[] {
        const commands: ITalkDetail[] = []
        for (const type of keyof(talkInfo)) {
            const t = talkInfo[type]
            if (this.player.canTalkNow(type)) {
                commands.push(t)
            }
        }
        return commands
    }

    forClient(): IStatusForClient {
        const desc = this.job.desc
            ? `あなたは【${this.job.nameja}】です。<br>${this.job.desc}${this.knowText}`
            : ""
        return {
            name: this.job.name,
            nameja: this.job.nameja,
            desc: desc,
            ability: this.job.ability,
            target: this.target,
            vote: this.vote,
            command: this.command(),
            talkCommand: this.talkCommand(),
        }
    }

    set(job: Job) {
        this.job = job
        this.attributes = job.forever.map((a) => {
            return { name: a, limit: 999 }
        })
    }

    add(attr: IAbility | IStatus | ITemporaryStatus, player?: Player) {
        this.attributes.push({ name: attr, limit: this.date.day })

        if (this.has("standoff") && attr == "bitten" && player) {
            player.status.add("stand")
        }
        if (this.has("standoff") && attr == "maxVoted") {
            const s = this.player.randomSelectTarget()
            s.status.add("stand")
        }
    }

    except(attr: string) {
        this.attributes = this.attributes.filter((a) => a.name != attr)
    }

    can(ability: IAbility | IPassiveAbilities) {
        return (
            this.job.ability.includes(ability as IAbility) ||
            this.job.passiveAbility.includes(ability as IPassiveAbilities)
        )
    }

    canTalk(type: string) {
        switch (type) {
            case "share":
            case "fox":
            case "wolf":
                return this.job.talk.includes(type) && this.isAlive

            case "discuss":
            case "tweet":
                return this.isAlive

            case "grave":
                return this.isDead

            case "gmMessage":
                return true
        }
    }

    canWatch(type: string) {
        return this.job.talk.includes(type) || this.job.watch.includes(type)
    }

    canKnow(job: string) {
        return (
            this.job.knowFriend.includes(job) ||
            this.job.watch.includes(job) ||
            this.job.talk.includes(job)
        )
    }

    has(attr: string) {
        return this.attributes.some((a) => a.name == attr)
    }

    hasnot(attr: string) {
        return !this.has(attr)
    }

    winCondhas(attr: string) {
        return this.job.winCond.includes(attr)
    }

    update() {
        this.attributes = this.attributes.filter((a) => a.limit >= this.date.day)
    }

    isDeadRival() {
        const result = this.job.rival.every((rival) => this.playerManager.isDeadAllJob(rival))
        return result
    }

    judgeWinOrLose(winSide: string) {
        let isWin = true
        if (this.winCondhas("winCamp") && this.job.camp != winSide) {
            isWin = false
        }
        if (this.winCondhas("alive") && this.isDead) {
            isWin = false
        }
        if (this.winCondhas("killRival") && !this.isDeadRival()) {
            isWin = false
        }
        return isWin
    }
}
