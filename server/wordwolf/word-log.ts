import SocketIO from "socket.io"

export interface ILog {
  type: string
  class?: string
  message: string
  color?: string
  no?: number
  cn?: string
}

export class Log {
  list: ILog[]
  nsp: SocketIO.Namespace
  count: number
  constructor(nsp: SocketIO.Namespace) {
    this.list = []
    this.nsp = nsp
    this.count = 1
  }

  all() {
    return this.list
  }

  initial() {
    return this.list.filter((l) => l.type != "personal")
  }

  escape(text: string) {
    text = text
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/'/g, "&#039;")
    return text
  }

  add(type: string, option?: any) {
    var data: ILog = {
      type: "system",
      message: "このメッセージが出ている場合は分岐に失敗しています",
    }
    switch (type) {
      case "addPlayer":
        data = {
          type: "system",
          message: `${option.player}さんが入室しました`,
        }
        break
      case "leavePlayer":
        data = {
          type: "system",
          message: `${option.player}さんが退室しました`,
        }
        break
      case "kick":
        data = {
          type: "system",
          message: `${option.player}さんが村八分になりました`,
        }
        break
      case "talk":
        data = {
          type: "discuss",
          message: this.escape(option.message),
          color: option.color,
          cn: option.cn,
        }

        break

      case "selectGM":
        data = {
          type: "system",
          class: "progress",
          message: `${option.gm.cn}さんが出題者です。お題を考えて下さい`,
        }
        break
      case "discussStart":
        data = {
          type: "system",
          class: "progress",
          message: "議論を開始して下さい。",
        }
        break

      case "word":
        data = {
          type: "personal",
          message: `お題は${option.word}です。`,
          no: option.player.no,
        }
        break
      case "gmword":
        data = {
          type: "personal",
          message: `村のお題は${option.vword}、狼のお題は${option.wword}です`,
          no: option.player.no,
        }
        break
      case "counter":
        data = {
          type: "system",
          class: "progress",
          message: `逆転のチャンスです。村人陣営のお題を当てて下さい`,
        }
        break
      case "release":
        data = {
          type: "system",
          message: `村ワードは${option.vword}、狼ワードは${option.wword}でした`,
        }
        break
      case "finish":
        data = {
          type: "system",
          class: "progress",
          message: `${option.side}陣営の勝利です`,
        }
        break
      case "exec":
        data = {
          type: "system",
          message: `${option.player.cn}さんが処刑されました。${option.player.cn}さんは${option.player.job}でした`,
        }
        break
      case "noexec":
        data = {
          type: "system",
          message: `処刑は行われませんでした。`,
        }
        break
      case "break":
        data = {
          type: "system",
          message: `ゲームを中断しました。`,
        }
        break

      case "vinfo":
        data = {
          type: "system",
          message: `${option.no}番 ${option.name}村
お題設定:${option.time.setWord}秒 議論:${option.time.discuss}秒 逆転:${option.time.counter}秒
ルームマスター：${option.RMid}`,
        }
        break
    }

    this.list.push(data)

    switch (data.type) {
      case "system":
      case "discuss":
        this.nsp.emit("talk", data)
        break
      case "personal":
        this.nsp.to("player-" + data.no).emit("talk", data)
        break
    }
  }
}
