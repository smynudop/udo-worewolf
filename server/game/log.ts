import SocketIO from "socket.io"
import {
  messageTemplate,
  MessageFormat,
  messageOption,
} from "./messageTemplate"
import { Visitor } from "./player"
import { VillageDate } from "./villageDate"
import { GameNsManager } from "./GameNsManager"

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
  io: GameNsManager
  date: VillageDate
  count: number

  formatter: MessageFormat

  constructor(nsp: GameNsManager, date: VillageDate) {
    this.list = []
    this.io = nsp
    this.date = date
    this.count = 1

    this.formatter = new MessageFormat(this)
  }

  all() {
    return this.list
  }

  initial(visitor: Visitor) {
    const logs: eachLog[] = []
    const rooms = visitor.socket.rooms

    for (const log of this.list) {
      const canWatchAllLog = rooms.has("gm") || rooms.has("all")
      const isTarget = rooms.has(log.target)
      const isPersonal =
        log.target == "personal" && rooms.has("player-" + log.no)
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
    const logs = this.list.filter((log) => log.anchor == anchor)
    return logs.length ? logs[0] : null
  }

  replaceQuote(txt: string, num: number) {
    let cnt = 0
    txt = txt.replace(/&gt;&gt;\d{1,2}-\d{1,3}/g, (match: string) => {
      if (cnt >= num) return match
      cnt++
      const q = this.quoteDiscuss(match)
      return q ? q.quote : match
    })
    return txt
  }

  add(
    type: keyof typeof messageTemplate,
    detail: string,
    option: messageOption = {}
  ) {
    const log: eachLog = this.formatter.makeLog(type, detail, option)

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
