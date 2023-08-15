import $ from "jquery"

import { eachLog } from "../server/game/log"
import { IPlayerForClient, IPlayerforPlayer } from "../server/game/player"
import { IGame } from "../server/db/schema/game"
import { ITalkDetail } from "../server/game/command"
import IO, { Socket } from "socket.io-client"

declare const io: typeof IO
declare const vno: number
declare const me: any

interface IChangePhaseData {
    phase: string
    left: number
    nsec?: number
    targets: Record<number, string>
    deathTargets?: Record<number, string>
    day: number
    villageInfo?: IGame
}

export class Client2 {
    socket: Socket
    villageData: IGame | null
    me: IPlayerforPlayer & { isWatch?: true }
    msgtmp: string
    phase: string
    targets: Record<number, string>
    day: number
    size: string
    isVote: boolean
    isUseAbility: boolean
    timerflg: NodeJS.Timeout | null
    players: IPlayerForClient[]

    constructor() {
        this.socket = this.connect()
        this.villageData = null
        this.msgtmp = ""
        this.me = me
        this.size = "normal"
        this.day = 0
        this.targets = {}
        this.timerflg = null
        this.phase = "prologue"
        this.isVote = true
        this.isUseAbility = true
        this.players = []
        this.listen()
        this.on()
    }

    connect(): Socket {
        return io("/room-" + vno, {
            path: /localhost/.test(location.href) ? "/socket.io" : "/worewolf/socket.io",
        })
    }

    setMe(data: IPlayerforPlayer) {
        this.me = data
        if (this.me.status?.desc != "") {
            $("#job").show().html(this.me.status!.desc)
        } else {
            $("#job").hide()
        }
    }

    changePhase(data: IChangePhaseData) {
        this.phase = data.phase
        this.targets = data.targets

        if (data.day > this.day) {
            for (let d = this.day + 1; d <= data.day; d++) {
                $("<li></li>")
                    .html(d + "日目")
                    .data("day", d)
                    .appendTo("#memoDiscussDay")
            }
            this.day = data.day
        }

        const vinfo = data.villageInfo
        if (vinfo) {
            $("#title").html(vinfo.name)
            $("#pr").html(vinfo.pr)
            $("title").html(vinfo.name + " - 焼肉鯖")

            for (const key in vinfo) {
                if (key == "time") {
                    for (const key2 in vinfo.time) {
                        $(`#fix-time-${key2}`).val(vinfo.time[key2])
                    }
                } else if (key == "isShowJobDead") {
                    $("fix-isShowJobDead").val(vinfo[key] ? 1 : 0)
                } else {
                    $(`#fix-${key}`).val(vinfo[key as keyof IGame] as string)
                }
            }
        }

        $("body").removeClass().addClass(data.phase)

        let sec = data.left
        let nsec = data.nsec || 0

        if (this.timerflg) clearInterval(this.timerflg)
        if (sec) {
            let nsectxt = ""
            if (data.nsec) {
                nsectxt = ` <span id="nsec">発言解禁まで<span id="n-second">${nsec}</span>秒</span>`
            }
            $("#timer").html(` あと<span id="second">${sec}</span>秒${nsectxt}`)
            this.timerflg = setInterval(function () {
                sec--
                $("#second").html(String(sec))

                if (--nsec <= 0) {
                    $("#nsec").remove()
                } else {
                    $("#n-second").html(String(nsec))
                }
            }, 1000)
        } else {
            $("#timer").html("")
        }

        this.slim()
        this.refresh()
    }

    refresh() {
        $("#command > div").hide()
        if (this.me.status) {
            this.updateCommand(this.me.status.talkCommand)
        }

        const me = this.me

        if (this.me.isWatch) {
            if (this.phase == "prologue") {
                $("#command-login").show()
            }
            return false
        }

        if (me.isGM || (me.isKariGM && this.phase == "prologue")) {
            $("#command-gm").show()
        }
        if (!me.isGM && this.phase == "prologue") {
            $("#command-logout").show()
        }
        if (!me.isGM && me.isAlive) {
            switch (this.phase) {
                case "day":
                    $("#command-vote").show()
                    this.updateVoteTarget(this.targets)

                    $("#command-vote .alert").addClass("hide")
                    $("#menu-sp-discuss").removeClass("alert")
                    break

                case "vote":
                    $("#command-vote").show()
                    this.updateVoteTarget(this.targets)

                    this.isVote = me.vote !== null
                    $("#command-vote .alert").toggleClass("hide", this.isVote)
                    $("#menu-sp-discuss").toggleClass("alert", !this.isVote)

                    break

                case "night":
                    for (const com of me.status!.command) {
                        if (com.since <= this.day) {
                            console.log(com.type)
                            $("#command-ability").show()
                            $("#ability").data("type", com.type).val(com.text)
                            this.updateAbilityTarget(com.target!)
                        }
                    }

                    $("#command-ability .alert").addClass("hide")
                    $("#menu-sp-discuss").removeClass("alert")
                    break

                case "ability":
                    this.isUseAbility = me.ability !== null

                    for (const com of me.status!.command) {
                        if (com.since <= this.day) {
                            $("#command-ability").show()
                            $("#ability").data("type", com.type).val(com.text)
                            this.updateAbilityTarget(com.target!)
                        }
                    }

                    $("#command-ability .alert").toggleClass("hide", this.isUseAbility)
                    $("#menu-sp-discuss").toggleClass("alert", !this.isUseAbility)

                    break
            }
        }
    }

    slim() {
        if (this.phase == "day") {
            $("#discuss tr")
                .not(".eachVote")
                .not(".votedetail")
                .not(`.day${this.day}-day`)
                .not(`.day${this.day - 1}-ability.system`)
                .not(".personal")
                .not(".wolf-system")
                .remove()
        }

        if (this.phase == "night") {
            $("#discuss tr")
                .not(".eachVote")
                .not(`.day${this.day}.vote`)
                .not(`.day${this.day}-night`)
                .not(`.day${this.day}-vote.system`)
                .remove()
        }
    }

    appendTalks(data: eachLog[]) {
        for (const t of data) {
            this.appendTalk(t)
        }
        this.slim()
    }

    appendTalk(data: eachLog) {
        const tab = $("#discuss")
        const memo = $("#memoDiscussTable")

        const d = "day" + data.day
        const phase = "day" + data.day + "-" + data.phase
        const cl = data.class

        const tr = $("<tr></tr>").addClass(d).addClass(phase)
        if (cl) tr.addClass(cl)

        if (data.type == "system") {
            tr.append(`<td colspan="2">${data.message.replace(/\n/g, "<br>")}</td>`)
        } else {
            $("<td></td>")
                .addClass("name")
                .html(`<span class="${data.color}">◆</span>${data.cn}`)
                .appendTo(tr)
            const td = $("<td></td>")
                .addClass("talk")
                .addClass(data.size || "")
                .html(data.message.replace(/\n/g, "<br>"))
            if (data.class == "discuss") {
                $("<div></div>")
                    .addClass("quote")
                    .data("day", data.day)
                    .data("resno", data.resno || "")
                    .appendTo(td)
            }
            td.appendTo(tr)

            if (data.no) {
                tr.addClass("player-" + data.no)
            }
        }

        tr.clone(true).prependTo(tab)

        if (["discuss"].includes(data.class!)) {
            tr.prependTo(memo)
        }
    }

    refreshPlayers(data: IPlayerForClient[]) {
        this.players = data

        const ul = $("#playerlist")
        const memoul = $("#memoDiscussPlayer")

        ul.empty()
        memoul.empty()

        for (const player of data) {
            if (player.no && player.no > 990) continue

            const alive = player.isAlive ? "alive" : "dead"
            const li = $("<li></li>")
            li.html(`<span class="${player.color}">◆</span>${player.cn}`)
                .data("no", Number(player.no))
                .addClass(alive)
                .toggleClass("uncall", player.waitCall)

            li.clone(true).appendTo(memoul)

            if (player.type == "detail") {
                const job = `[${player.status.nameja}]`
                const userid = `<br>${player.userid}`
                const trip = " " + player.trip
                li.html(li.html() + job + userid + trip)
            }
            li.appendTo(ul)
        }

        const a = this.players.filter((p) => p.no! < 990 && p.isAlive).length
        const d = this.players.filter((p) => p.no! < 990 && !p.isAlive).length

        const join = `参加者:${a + d} 生存:${a} 死亡${d}`
        $("#playernum").html(join)

        $("<li></li>").html("全員表示").data("no", "all").appendTo(memoul)

        if (this.me.isGM || this.me.isKariGM) {
            const select = $("#gmTarget")
            select.empty()
            $("<option></option>").html("▼選択").appendTo(select)

            for (const key in data) {
                const no = +key
                if (no >= 990 || no == 0) continue
                const player = data[no]
                $("<option></option>").html(player.cn!).val(player.no!).appendTo(select)
            }
        }
    }

    sendMessage() {
        const data = {
            no: this.me.no,
            message: String($("#message").val()).trim(),
            type: $("#talkType").val(),
            size: this.size,
        }
        if (data.message == "") return false

        this.msgtmp = data.message
        this.socket.emit("talk", data)
        $("#message").val("")
        $(".size").removeClass("selected")
        this.size = "normal"
    }

    updateCommand(commands: ITalkDetail[]) {
        const select = $("#talkType")
        const v = select.val()!
        select.empty()

        let flg = false
        for (const command of commands) {
            $("<option></option").html(command.text).val(command.type).appendTo(select)
            if (command.type == v) {
                flg = true
            }
        }
        if (this.phase == "day" || this.phase == "night") flg = false
        select.val(flg ? v : commands[0].type)
    }

    updateVoteTarget(targets: Record<number, string>) {
        const select = $("#voteTarget")
        const v = select.val()!
        select.empty()
        $("<option></option").html("▼選択").val("damy").appendTo(select)
        let flg = false

        for (const key in targets) {
            if (this.me.no == +key) continue
            $("<option></option").html(targets[key]).val(key).appendTo(select)
            if (key == v) {
                flg = true
            }
        }
        select.val(flg ? v : "damy")
    }

    updateAbilityTarget(targets: Record<number, string>) {
        const select = $("#abilityTarget")
        const v = select.val()!

        select.empty()
        $("<option></option").html("▼選択").val("damy").appendTo(select)
        for (const key in targets) {
            if (this.me.no == +key) continue
            $("<option></option").html(targets[key]).val(key).appendTo(select)
        }
        select.val(v)
    }

    listen() {
        this.socket.on("talk", (data) => {
            this.appendTalk(data)
        })

        this.socket.on("you", (data: IPlayerforPlayer) => {
            this.setMe(data)
        })

        this.socket.on("player", (data) => {
            this.refreshPlayers(data)
        })

        this.socket.on("initialLog", (data) => {
            $("#discuss").empty()
            $("#memoDiscussTable").empty()
            this.appendTalks(data)
        })

        this.socket.on("enterSuccess", (data) => {
            $("#talk").removeClass("hide")
            this.setMe(data)
            this.refresh()
        })

        this.socket.on("leaveSuccess", function (no) {
            $("#command > div").hide()
            $("#command-login").show()
            $("#talk").addClass("hide")
        })

        this.socket.on("voteSuccess", (no) => {
            this.isVote = true
            $("#command-vote .alert").addClass("hide")
            $("#menu-sp-discuss").removeClass("alert")
        })

        this.socket.on("useAbilitySuccess", (no) => {
            this.isUseAbility = true
            $("#command-ability .alert").addClass("hide")
            $("#menu-sp-discuss").removeClass("alert")
        })

        this.socket.on("changePhase", (data) => {
            this.changePhase(data)
        })

        this.socket.on("disconnect", (data) => {
            $("#command > div").hide()
            $("#talk").addClass("hide")
            $("#command-reload").show()
        })

        this.socket.on("refresh", () => {
            location.reload()
        })

        this.socket.on("banTalk", () => {
            $("#message").val(this.msgtmp)
        })
    }

    on() {
        $("#enter").click(() => {
            //入室申請
            const data = {
                cn: String($("#name").val()),
                color: String($("#color").val()),
            }
            if (data.cn.length > 8 || data.cn.length == 0) {
                alert("名前は8文字以内にしてください")
                return false
            }
            this.socket.emit("enter", data)
            return false
        })

        $(".exit").click(() => {
            this.socket.emit("leave", "")
            return false
        })

        $("#chat").click(() => {
            this.sendMessage()
            return false
        })

        $("#vote").click(() => {
            const v = $("#voteTarget").val()
            if (v == "damy") return false

            this.socket.emit("vote", {
                target: v,
            })
            return false
        })

        $("#ability").click(() => {
            const v = $("#abilityTarget").val()
            if (v == "damy") return false

            this.socket.emit("ability", {
                type: $("#ability").data("type"),
                target: v,
            })
            return false
        })

        $("#gameStart").click(() => {
            this.socket.emit("start")
            return false
        })

        $("#summonNPC").click(() => {
            this.socket.emit("summonNPC")
            return false
        })

        $("#checkCast").click(() => {
            this.socket.emit("checkCast")
            return false
        })

        $("#rollcall").click(() => {
            this.socket.emit("rollcall")
            return false
        })

        $("#kick").click(() => {
            const target = $("#gmTarget").val()
            if (target === null) return false

            this.socket.emit("kick", { target: target })
        })

        $("#fix-player").click(() => {
            this.socket.emit("fix-player", {
                cn: $("#fix-cn").val(),
                color: $("#fix-color").val(),
            })
        })

        $("#fix-gm").click(() => {
            this.socket.emit("fix-gm", {
                name: $("#fix-name").val(),
                pr: $("#fix-pr").val(),
                casttype: $("#fix-casttype").val(),
                capacity: +$("#fix-capacity").val()!,
                time: {
                    day: +$("#fix-time-day").val()!,
                    vote: +$("#fix-time-vote").val()!,
                    night: +$("#fix-time-night").val()!,
                    ability: +$("#fix-time-ability").val()!,
                    nsec: +$("#fix-time-nsec").val()!,
                },
                isShowJobDead: $("#fix-isShowJobDead").val() == 1,
            })
            $("#vinfo").hide()
        })

        $(".handle").click(function () {
            $(this).parent().find(".detail").toggle()
        })

        $(".size").click(() => {
            const s = $(this).data("size")
            $(".size").removeClass("selected")
            if (this.size == s) {
                this.size = "normal"
            } else {
                this.size = s
                $(this).addClass("selected")
            }
        })

        $("#fixVillageInfo").click(() => {
            $("#vinfo").toggle()
        })

        $("#discuss").on("click", ".quote", function (e) {
            const day = $(this).data("day")
            const resno = $(this).data("resno")
            const res = `>>${day}-${resno}`
            $("#message").val($("#message").val() + res)
        })

        $("#memoDiscussTable").on("click", ".quote", function (e) {
            const day = $(this).data("day")
            const resno = $(this).data("resno")
            const res = `>>${day}-${resno}`
            $("#message").val($("#message").val() + res)
        })

        $(window).keydown((e) => {
            if (e.ctrlKey && e.keyCode == 13) {
                this.sendMessage()
                return false
            }
        })

        // メッセージを受信する

        $("#command-login").show()
    }
}
