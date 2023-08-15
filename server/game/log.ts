import { messageTemplate, MessageFormat, MessageOption, TalkOption } from "./messageTemplate"
import { VillageDate } from "./villageDate"
import { IPhase, ITalkType } from "./constants"
import { Player } from "./player"
import { IController } from "./IController"

export type LogTarget = "all" | "personal" | "wolf" | "share" | "fox" | "grave"

export interface SystemLog {
    target: LogTarget
    type: "system"
    no?: number
    day: number
    phase: IPhase
    message: string
    class: string

    res?: {
        no: number
        quote: string
        anchor: string
    }
}
export interface TalkLog {
    cn: string
    color: string
    size: string
    target: LogTarget
    type: "talk"
    no?: number
    day: number
    phase: IPhase
    message: string
    class: string

    res?: {
        no: number
        quote: string
        anchor: string
    }
}

export type EachLog = SystemLog | TalkLog

export class Log {
    list: EachLog[]
    io: IController
    date: VillageDate
    count: number

    formatter: MessageFormat

    constructor(controller: IController, date: VillageDate) {
        this.list = []
        this.io = controller
        this.date = date
        this.count = 1

        this.formatter = new MessageFormat(this)
    }

    all() {
        return this.list
    }

    initial(player?: Player) {
        const logs: EachLog[] = []
        const rooms = player?.rooms ?? new Set<string>()
        const canWatchAllLog = rooms.has("gm") || rooms.has("all")

        for (const log of this.list) {
            const isTarget = rooms.has(log.target)
            const isPersonal = log.target == "personal" && rooms.has("player-" + log.no)
            const isGlobal = log.target == "all"

            if (canWatchAllLog || isTarget || isPersonal || isGlobal) {
                logs.push(log)
            }
        }

        return logs
    }

    resetCount() {
        this.count = 1
    }

    quoteDiscuss(anchor: string) {
        return this.list.find((log) => log.res?.anchor == anchor)
    }

    replaceQuote(txt: string, num: number) {
        let cnt = 0
        txt = txt.replace(/&gt;&gt;\d{1,2}-\d{1,3}/g, (match: string) => {
            if (cnt >= num) return match
            cnt++
            const q = this.quoteDiscuss(match)
            return q?.res?.quote ?? match
        })
        return txt
    }

    add(type: keyof typeof messageTemplate, detail: string, option: Partial<MessageOption> = {}) {
        const log: EachLog = this.formatter.makeLog(type, detail, option)

        this.list.push(log)
        this.emit(log)
    }

    addTalk(talkType: ITalkType, option: TalkOption) {
        const log: EachLog = this.formatter.makeTalkLog(talkType, option)

        if (log.class == "discuss") {
            const resno = this.count
            const anchor = `&gt;&gt;${log.day}-${resno}`
            log.res = {
                anchor,
                quote: `<blockquote><div class="resno">${anchor}</div>${log.message}</blockquote>`,
                no: resno,
            }

            log.message = this.replaceQuote(log.message, 3)
            this.count++
        }

        this.list.push(log)
        this.emit(log)
    }

    private emit(log: EachLog) {
        switch (log.target) {
            case "all":
                this.io.emit("talk", log)
                break
            case "wolf":
                this.io.emitRoom("talk", log, "wolf")
                break
            case "personal":
                this.io.emitPersonal("talk", log, log.no!)
                break
            case "share":
                this.io.emitRoom("talk", log, "share")
                break
            case "fox":
                this.io.emitRoom("talk", log, "fox")
                break
            case "grave":
                this.io.emitRoom("talk", log, "grave")
                break
        }
    }
}
