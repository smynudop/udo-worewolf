const Cast = require("./cast")
class Log {
    constructor(nsp, date) {
        this.list = []
        this.nsp = nsp
        this.date = date
        this.count = 1
    }

    all() {
        return this.list
    }

    initial(player) {
        var logs = []
        var isAppendAll = false
        var rooms = new Set()

        if (player) {
            if (!player.isAlive || player.isGM) isAppendAll = true
            rooms = player.socket.rooms
        }

        for (var log of this.list) {
            if (rooms.has("gm") || rooms.has("all")) {
                logs.push(log)
                continue
            }

            switch (log.type) {
                case "system":
                case "info":
                case "gmMessage":
                case "discuss":
                case "restrict":
                case "progress":
                case "wolfNeigh":
                    logs.push(log)
                    break
                case "wolf":
                case "wolf-system":
                    if (rooms.has("wolf")) {
                        logs.push(log)
                    }
                    break

                case "vote":
                case "personal":
                case "tweet":
                    if (rooms.has("player-" + log.no)) {
                        logs.push(log)
                    }
                    break

                case "share":
                    if (rooms.has("share")) {
                        logs.push(log)
                    }
                    break

                case "fox":
                    if (rooms.has("fox")) {
                        logs.push(log)
                    }
                    break
                case "grave":
                    if (rooms.has("grave")) {
                        logs.push(log)
                    }
                    break
            }
        }

        return logs
    }

    resetCount() {
        this.count = 1
    }

    quoteDiscuss(day, resno) {
        var logs = this.list.filter(
            (log) => log.type == "discuss" && log.day == day && log.resno == resno
        )
        if (logs.length) {
            return logs[0]
        } else {
            return null
        }
    }

    escape(text) {
        text = text
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/'/g, "&#039;")
        return text
    }

    replaceQuote(txt, num) {
        var logObj = this
        for (var i = 0; i < num; i++) {
            txt = txt.replace(/&gt;&gt;(\d{1,2})-(\d{1,3})/, function (match, day, resno) {
                var q = logObj.quoteDiscuss(day - 0, resno - 0)
                if (q) {
                    return q.quote
                } else {
                    return match
                }
            })
        }
        return txt
    }

    add(type, option) {
        var data
        switch (type) {
            case "info":
                data = {
                    type: "system",
                    class: "info",
                    message: option.message,
                }
                break

            case "talk":
                data = option
                data.message = this.escape(data.message)
                data.day = this.date.day

                if (data.type == "discuss") {
                    data.resno = this.count
                    data.quote = `<blockquote>◆${data.cn}:\n${data.message}<div class="resno">>>${data.day}-${data.resno}</div></blockquote>`
                    this.count++

                    data.message = this.replaceQuote(data.message, 3)
                } else {
                    data.message = this.replaceQuote(data.message, 1)
                }

                break

            case "vote":
                data = {
                    no: option.no,
                    type: "vote",
                    message: `${option.player}さんが${option.target}さんに投票しました`,
                }
                break

            case "voteSummary":
                data = {
                    type: "system",
                    class: "votedetail",
                    message: option.message,
                }
                break

            case "fortune":
                var isAuto = option.isAuto ? "【自動実行】" : ""
                data = {
                    no: option.player.no,
                    type: "personal",
                    message:
                        `<img src='../images/fortune.png'/>` +
                        `【占い】${option.player.cn}さんは${option.target.cn}さんを占い、` +
                        `結果は【<strong>${option.target.status.fortuneResult}</strong>】でした。${isAuto}`,
                }
                break

            case "necro":
                data = {
                    no: option.player.no,
                    type: "personal",
                    message:
                        `<img src='../images/necro.png'/>` +
                        `【霊能】前日処刑された${option.target.cn}さんは【<strong>${option.target.status.necroResult}</strong>】でした。`,
                }
                break

            case "guard":
                var isAuto = option.isAuto ? "【自動実行】" : ""
                data = {
                    no: option.player.no,
                    type: "personal",
                    message: `<img src='../images/guard.png'/>【護衛】${option.player.cn}さんは${option.target.cn}を護衛します。${isAuto}`,
                }
                break

            case "bite":
                var isAuto = option.isAuto ? "【自動実行】" : ""
                data = {
                    no: option.player.no,
                    type: "wolf-system",
                    message: `<img src='../images/wolf.png'/>【襲撃】${option.player.cn}さんは${option.target.cn}を狙います。${isAuto}`,
                }
                break

            case "revive":
                var isAuto = option.isAuto ? "【自動実行】" : ""
                data = {
                    no: option.player.no,
                    type: "personal",
                    message: `【蘇生】${option.player.cn}さんは${option.target.cn}の蘇生を試みます。${isAuto}`,
                }
                break

            case "wolfNeigh":
                data = {
                    no: 998,
                    cn: "狼たち",
                    color: "black",
                    type: "wolfNeigh",
                    message: "アオォーン・・・",
                }
                break

            case "reiko":
                data = {
                    no: option.no,
                    type: "personal",
                    message: `【霊狐】初日犠牲者の役職は「${option.job}」です。`,
                }
                break

            case "system":
                data = {
                    type: "system",
                    class: "system",
                    message: option.message,
                }
                break

            case "gameend":
                if (option.side == "引き分け") {
                    data = {
                        type: "system",
                        class: "system",
                        message: `【引き分け】です！`,
                    }
                    break
                }
                data = {
                    type: "system",
                    class: "system",
                    message: `【${option.side}】の勝利です！`,
                }
                break

            case "changePhase":
                switch (option.phase) {
                    case "day":
                        data = {
                            type: "system",
                            class: "progress",
                            message: `<img src="../images/sun.png" />${option.day}日目の朝になりました。`,
                        }
                        break
                    case "vote":
                        data = {
                            type: "system",
                            class: "progress",
                            message: `<img src='../images/vote.png'/>まもなく日暮れです。投票してください。`,
                        }
                        break
                    case "revote":
                        data = {
                            type: "system",
                            class: "system",
                            message: `<img src='../images/vote.png'/>再投票になりました。あと${option.left}回で決まらなければ引き分けになります。`,
                        }
                        break
                    case "night":
                        data = {
                            type: "system",
                            class: "progress",
                            message: `<img src="../images/moon.png" />${option.day}日目の夜になりました。`,
                        }
                        break
                    case "ability":
                        data = {
                            type: "system",
                            class: "progress",
                            message: `<img src='../images/ability.png'/>もうすぐ夜が明けます。行動対象を決定してください`,
                        }
                        break
                }
                break

            case "comeback":
                data = {
                    type: "system",
                    class: "system",
                    message: option.player.cn + "さんは奇跡的に蘇生しました。",
                }
                break
            case "death":
                switch (option.reason) {
                    case "bite":
                        data = {
                            type: "system",
                            message:
                                "<img src='../images/bite.png'/>" +
                                `<strong>${option.player}</strong>` +
                                "さんは無残な姿で発見された……",
                        }
                        break

                    case "exec":
                        data = {
                            type: "system",
                            message:
                                "<img src='../images/exec.png'/>" +
                                `<strong>${option.player}</strong>` +
                                "さんは村民協議の結果処刑された……",
                        }
                        break

                    case "standoff":
                        data = {
                            type: "system",
                            message: `<strong>${option.player}</strong>さんは猫又の呪いで死亡しました……`,
                        }
                        break

                    case "fellow":
                        data = {
                            type: "system",
                            message: `<strong>${option.player}</strong>さんは妖狐の後を追って死を選びました……`,
                        }
                        break
                }
                break

            case "result":
                let result
                switch (option.result) {
                    case "win":
                        result = "勝利しました。"
                        break

                    case "lose":
                        result = "敗北しました。"
                        break

                    case "draw":
                        result = "引き分けました。"
                        break
                }
                data = {
                    no: option.player.no,
                    type: "personal",
                    message: `${option.player.cn}さんは${result}`,
                }
                break

            case "addPlayer":
                data = {
                    type: "system",
                    class: "info",
                    message: `${option.player}さんが入村しました`,
                }
                break

            case "leavePlayer":
                data = {
                    type: "system",
                    class: "info",
                    message: `${option.player}さんが退村しました`,
                }
                break
            case "kick":
                data = {
                    type: "system",
                    class: "info",
                    message: `${option.player}さんが村八分になりました`,
                }
                break
            case "vinfo":
                let casttype = Cast.txt2ja(option.casttype)
                let day = option.time.day
                let vote = option.time.vote
                let night = option.time.night
                let ability = option.time.ability
                let nsec = option.time.nsec ? option.time.nsec + "秒" : "なし"
                let isShow = option.isShowJobDead ? "あり" : "なし"
                data = {
                    type: "system",
                    class: "info",
                    no: 999,
                    cn: "システム",
                    message: `【村の情報】

${option.name}
【定員】${option.capacity}名
【配役】${casttype}
【霊界表示】${isShow}
昼：${day}秒　投票：${vote}秒　夜：${night}秒　能力実行：${ability}秒　n秒：${nsec}

GM：${option.GMid}`,
                }
                break
        }
        data.day = this.date.day
        data.phase = this.date.phase
        this.list.push(data)

        switch (data.type) {
            case "system":
            case "info":
            case "gmMessage":
            case "discuss":
            case "restrict":
            case "progress":
            case "wolfNeigh":
                this.nsp.emit("talk", data)
                break
            case "wolf":
            case "wolf-system":
                this.nsp.to("wolf").to("gm").to("all").emit("talk", data)
                break
            case "vote":
            case "personal":
            case "tweet":
                this.nsp
                    .to("player-" + data.no)
                    .to("gm")
                    .to("all")
                    .emit("talk", data)
                break
            case "share":
                this.nsp.to("share").to("gm").to("all").emit("talk", data)
                break
            case "fox":
                this.nsp.to("fox").to("gm").to("all").emit("talk", data)
                break
            case "grave":
                this.nsp.to("grave").to("gm").to("all").emit("talk", data)
                break
        }
    }
}

module.exports = Log
