import SocketIO from "socket.io"
import { messageTemplate, MessageFormat, messageOption } from "./messageTemplate"
import { Visitor } from "./player"
import {VillageDate} from "./villageDate"

export interface eachLog {
    target: string
    type: string
    no?: number
    day: number
    phase: string
    resno?: number
    anchor?: string
    quote: string
    message: string
    class?: string
    cn?: string
    color?: string
    size?: string
}

export class Log {
    list: eachLog[]
    nsp: SocketIO.Namespace
    date: VillageDate
    count: number

    formatter: MessageFormat

    constructor(nsp:SocketIO.Namespace, date:VillageDate) {
        this.list = []
        this.nsp = nsp
        this.date = date
        this.count = 1

        this.formatter = new MessageFormat(this)
    }

    all() {
        return this.list
    }

    initial(visitor: Visitor) {
        var logs: eachLog[] = []
        var rooms = visitor.socket.rooms

        for (var log of this.list) {
            let canWatchAllLog = rooms.has("gm") || rooms.has("all")
            let isTarget = rooms.has(log.target)
            let isPersonal = log.target == "personal" && rooms.has("player-" + log.no)
            let isGlobal = log.target == "all"

            if (canWatchAllLog || isTarget || isPersonal || isGlobal) {
                logs.push(log)
            }
        }

        return logs
    }

    resetCount() {
        this.count = 1
    }

    quoteDiscuss(anchor:string) {
        var logs = this.list.filter((log) => log.anchor == anchor)
        return logs.length ? logs[0] : null
    }

    replaceQuote(txt:string, num:number) {
        let cnt = 0
        txt = txt.replace(/&gt;&gt;\d{1,2}-\d{1,3}/g, (match:string) => {
            if (cnt >= num) return match
            cnt++
            var q = this.quoteDiscuss(match)
            return q ? q.quote : match
        })
        return txt
    }

    add(type: keyof typeof messageTemplate, detail: string, option: messageOption = {}) {
        let log: eachLog = this.formatter.makeLog(type, detail, option)

        if (log.type == "talk" && log.class == "discuss") {
            log.resno = this.count
            log.anchor = `&gt;&gt;${log.day}-${log.resno}`
            log.quote = `<blockquote><div class="resno">${log.anchor}</div>${log.message}</blockquote>`

            log.message = this.replaceQuote(log.message, 3)
            this.count++
        }

        this.list.push(log)

        switch (log.target) {
            case "all":
                this.nsp.emit("talk", log)
                break
            case "wolf":
                this.nsp.to("wolf").to("gm").to("all").emit("talk", log)
                break
            case "personal":
                this.nsp
                    .to("player-" + log.no)
                    .to("gm")
                    .to("all")
                    .emit("talk", log)
                break
            case "share":
                this.nsp.to("share").to("gm").to("all").emit("talk", log)
                break
            case "fox":
                this.nsp.to("fox").to("gm").to("all").emit("talk", log)
                break
            case "grave":
                this.nsp.to("grave").to("gm").to("all").emit("talk", log)
                break
        }
    }
}
