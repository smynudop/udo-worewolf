const moment = require("moment")
const schema = require("../schema")
const GameSchema = schema.Wordwolf
const User = schema.User

const PlayerSocket = require("./socket")

import { Log } from "./word-log"

const fs = require("fs")
const ejs = require("ejs")
const e = require("express")

class Player {
    no: number
    userid: string
    cn: string
    color: string
    isRM: boolean
    isNPC: boolean
    trip: string
    job: string
    vote: any
    manager: PlayerManager
    log: Log
    socket: any

    constructor(data, manager) {
        this.no = data.no === undefined ? 997 : data.no
        this.userid = data.userid || "null"

        this.cn = data.cn || "kari"
        this.color = data.color || "red"
        this.isRM = data.isRM || false
        this.isNPC = data.isNPC || false
        this.trip = ""

        this.job = ""
        this.vote = {
            target: null,
            targetName: "",
            get: 0,
        }

        this.manager = manager
        this.log = manager.log

        this.socket = new PlayerSocket(data.socket)
        this.socket.join("player-" + this.no)

        this.getTrip()
    }

    async getTrip() {
        let user = await User.findOne({ userid: this.userid }).exec()
        this.trip = user.trip
    }

    changeVote(target) {
        if (this.vote.target === target.no) return false
        if (this.no == target.no) return false
        if (this.isGM) return false

        this.vote.target = target.no
        this.vote.targetName = target.cn
    }

    cancelVote() {
        this.vote.target = null
        this.vote.targetName = ""
    }

    setJob(job) {
        this.job = job
    }

    reset() {
        this.job = ""
        this.vote = {
            target: null,
            targetName: "",
            get: 0,
        }
    }

    forClientSummary() {
        return {
            no: this.no,
            userid: this.userid,
            trip: this.trip,
            color: this.color,
            cn: this.cn,
            vote: this.vote,
            isGM: this.isGM,
        }
    }

    forClientDetail() {
        return {
            no: this.no,
            userid: this.userid,
            trip: this.trip,
            color: this.color,
            cn: this.cn,
            job: this.job,
            vote: this.vote,
            isRM: this.isRM,
            isGM: this.isGM,
        }
    }

    get isVillager() {
        return this.job == "villager"
    }

    get isWolf() {
        return this.job == "wolf"
    }

    get isGM() {
        return this.job == "GM"
    }

    get hasJob() {
        return this.job !== ""
    }

    canJudge() {
        return this.isGM
    }

    canSetWord() {
        return this.isGM
    }

    hasPermittionOfRMCommand() {
        return this.isRM
    }

    update(cn, color) {
        this.cn = cn
        this.color = color
    }
}

class PlayerManager {
    players: { [k: number]: Player }
    list: Player[]
    listAll: Player[]
    userid2no: any
    count: number
    npcNames: string[]
    log: Log
    constructor(game) {
        this.players = {}
        this.list = []
        this.listAll = []
        this.userid2no = {}
        this.count = 0
        this.npcNames = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N"]

        this.log = game.log
    }

    add(data) {
        var no = this.count
        data.no = no
        var p = new Player(data, this)

        var userid = data.userid

        this.userid2no[userid] = no
        this.players[no] = p
        this.count++
        this.refreshList()

        this.log.add("addPlayer", {
            player: p.cn,
        })

        return p
    }

    leave(userid) {
        var id = this.pick(userid).no
        var p = this.players[id]
        p.socket.emit("leaveSuccess")

        this.log.add("leavePlayer", {
            player: p.cn,
        })
        delete this.players[id]
        delete this.userid2no[userid]
        this.refreshList()
    }

    kick(target) {
        if (!(target in this.players)) return false
        var p = this.pick(target)

        if (p.isRM) return false

        var userid = p.userid
        p.socket.emit("leaveSuccess")

        this.log.add("kick", {
            player: p.cn,
        })
        delete this.players[target]
        delete this.userid2no[userid]
        this.refreshList()
    }

    in(userid) {
        return userid in this.userid2no
    }

    pick(id) {
        if (typeof id == "string") {
            if (isNaN(parseInt(id))) {
                id = this.userid2no[id]
            } else {
                id = parseInt(id)
            }
        }
        return this.players[id]
    }

    refreshList() {
        this.list = Object.values(this.players).filter((p) => p.no < 990)
        this.listAll = Object.values(this.players)
    }

    forClientSummary() {
        return this.listAll.map((p) => p.forClientSummary())
    }

    forClientDetail() {
        return this.listAll.map((p) => p.forClientDetail())
    }

    reset() {
        for (var player of this) {
            player.reset()
        }
    }

    selectGM() {
        this.reset()
        let gm = this.list.lot()
        gm.setJob("GM")
        this.log.add("selectGM", { gm: gm })
    }

    casting(wnum, vword, wword) {
        let players = this.list.filter((p) => !p.isGM)
        for (let cnt = 0; cnt < wnum; cnt++) {
            let i = Math.floor(Math.random() * players.length)
            players[i].setJob("wolf")
            players.splice(i, 1)
        }

        for (let player of players) {
            if (!player.hasJob) player.setJob("villager")
        }

        this.log.add("discussStart")

        for (let player of this.list) {
            if (player.isVillager) {
                this.log.add("word", { word: vword, player: player })
            }
            if (player.isWolf) {
                this.log.add("word", { word: wword, player: player })
            }
            if (player.isGM) {
                this.log.add("gmword", { vword: vword, wword: wword, player: player })
            }
        }
    }

    get num() {
        return this.list.length
    }

    setRM(rmid) {
        this.add({
            userid: rmid,
            socket: null,
            cn: "ルームマスター",
            color: "orange",
            isRM: true,
        })
        return false
    }

    compileVote() {
        let gets = this.list.map((p) => p.vote.get)
        console.log(gets)
        let getmax = Math.max(...gets)

        let maxGetters = this.list.filter((p) => p.vote.get == getmax)
        let exec: Player | null = maxGetters[0]
        if (maxGetters.length >= 2 || getmax == 0) {
            exec = null
        }
        return {
            exec: exec,
        }
    }

    countVote() {
        for (let player of this) {
            player.vote.get = 0
        }
        for (let player of this) {
            if (player.vote.target === null) continue
            let target = this.pick(player.vote.target)
            target.vote.get++
        }
    }

    *[Symbol.iterator]() {
        yield* this.list
    }
}

class Game {
    io: any
    vno: number
    name: string
    pr: string
    time: { [key: string]: number }
    RMid: string
    phase: string
    limit: any
    vword: string
    wword: string
    wolfNum: number
    log: Log
    players: PlayerManager
    timerFlg: any
    capacity: number

    constructor(io, data) {
        this.io = io

        this.vno = data.vno || 1
        this.name = data.name || "とある村"
        this.pr = data.pr || "宣伝文が設定されていません"
        this.time = data.time || {
            setWord: 120,
            discuss: 180,
            counter: 60,
        }
        this.RMid = data.GMid
        this.phase = "idol"
        this.capacity = 20

        this.limit = null

        this.vword = ""
        this.wword = ""
        this.wolfNum = 1

        this.log = new Log(io)
        this.players = new PlayerManager(this)

        this.timerFlg = null

        this.log.add("vinfo", this.villageInfo())

        this.players.setRM(this.RMid)
    }

    setLimit(sec) {
        this.limit = moment().add(sec, "seconds").format()
    }

    clearLimit() {
        this.limit = null
    }

    leftSeconds() {
        return this.limit ? moment().diff(this.limit, "seconds") * -1 : null
    }

    fixInfo(data) {
        for (var key in data) {
            if (this[key] === undefined) continue
            this[key] = data[key]
        }

        GameIO.update(this.vno, data)
        this.log.add("vinfo", this.villageInfo())
    }

    fixPersonalInfo(player, data) {
        var cn = data.cn.trim()
        if (cn.length == 0 || cn.length > 8) return false
        player.update(cn, data.color)

        this.emitPlayer()
    }

    villageInfo() {
        return {
            name: this.name,
            pr: this.pr,
            no: this.vno,
            time: this.time,
            RMid: this.RMid,
        }
    }

    emitPlayer() {
        if (this.phaseIs("discuss")) {
            this.io.emit("player", this.players.forClientSummary())
        } else {
            this.io.emit("player", this.players.forClientDetail())
        }
    }

    emitPhase() {
        this.io.emit("changePhase", {
            phase: this.phase,
            villageInfo: this.villageInfo(),
            targets: {},
            left: this.leftSeconds(),
        })
    }

    talk(player, data) {
        data.cn = player.cn
        data.color = player.color

        this.log.add("talk", data)
    }

    vote(player, data) {
        if (!player) return false
        if (!this.phaseIs("discuss")) return false

        if (data.target === null) {
            player.cancelVote()
        } else {
            var target = this.players.pick(data.target)
            if (!target) return false
            player.changeVote(target)
        }

        this.players.countVote()
        this.emitPlayer()
    }

    phaseIs(phase) {
        return this.phase == phase
    }

    canStart() {
        return this.players.num >= 4 && this.phaseIs("idol")
    }

    setWord(data) {
        if (this.phase != "setWord") return false

        this.vword = data.vword
        this.wword = data.wword
        this.wolfNum = data.wolfNum

        if (this.wolfNum >= this.players.num / 2) {
            this.wolfNum = Math.floor(this.players.num / 2) - 1
        }

        this.changePhase("discuss")
    }

    start() {
        if (!this.canStart()) return false
        this.changePhase("setWord")
    }

    casting() {
        this.players.casting(this.wolfNum, this.vword, this.wword)
    }

    counter() {
        this.log.add("counter")
    }

    finish(side) {
        this.log.add("release", { vword: this.vword, wword: this.wword })
        this.log.add("finish", { side: side })
        this.players.reset()

        this.changePhase("idol")
    }

    compileVote() {
        let result = this.players.compileVote()
        if (result.exec) {
            this.log.add("exec", { player: result.exec })
            return result.exec.isWolf
        } else {
            this.log.add("noexec")
            return false
        }
    }

    break() {
        this.log.add("break")
        this.changePhase("idol")
    }

    changePhase(phase) {
        this.phase = phase
        this.setTimer(phase)

        switch (phase) {
            case "setWord":
                this.players.selectGM()
                this.emitPersonalData()
                this.emitPlayer()
                this.emitPhase()
                break
            case "discuss":
                this.casting()
                this.emitPhase()
                break
            case "exec":
                let isExecutionWolf = this.compileVote()
                if (isExecutionWolf) {
                    this.changePhase("counter")
                    return false
                } else {
                    this.changePhase("wolfWin")
                    return false
                }
                break
            case "counter":
                this.counter()
                this.emitPhase()
                this.emitPlayer()
                break
            case "villageWin":
                this.finish("village")
                break
            case "wolfWin":
                this.finish("wolf")
                break
            case "break":
                this.break()
                break
            case "idol":
                this.emitPhase()
                this.emitPlayer()
                break
        }
    }

    setTimer(phase) {
        clearTimeout(this.timerFlg)
        this.clearLimit()

        switch (phase) {
            case "setWord":
                this.timerFlg = setTimeout(() => {
                    this.changePhase("break")
                }, this.time.setWord * 1000)
                this.setLimit(this.time.setWord)
                break

            case "discuss":
                this.timerFlg = setTimeout(() => {
                    this.changePhase("exec")
                }, this.time.discuss * 1000)
                this.setLimit(this.time.discuss)

                break

            case "counter":
                this.timerFlg = setTimeout(() => {
                    this.changePhase("wolfWin")
                }, this.time.counter * 1000)
                this.setLimit(this.time.counter)
                break
        }
    }

    emitPersonalData() {
        for (var player of this.players) {
            player.socket.emit("you", player.forClientDetail())
        }
    }

    emitInitialLog(userid, socket) {
        socket.emit("initialLog", this.log.initial())
    }

    listen() {
        this.io.on("connection", (socket) => {
            var session = socket.request.session
            var userid = session.userid
            var player: Player | null = null

            this.emitPlayer()

            if (this.players.in(userid)) {
                player = this.players.pick(userid)

                socket.emit("enterSuccess", player.forClientDetail())

                player.socket.updateSocket(socket)

                this.emitPlayer()
            }

            this.emitPhase()
            this.emitInitialLog(userid, socket)

            socket.on("enter", (data) => {
                if (this.players.in(userid)) return false
                if (this.players.num >= this.capacity) return false

                data.userid = userid
                data.socket = socket
                player = this.players.add(data)

                socket.emit("enterSuccess", player.forClientDetail())
                this.emitPlayer()
            })

            socket.on("leave", (data) => {
                if (!player || player.isRM) return false
                this.players.leave(userid)
                this.emitPlayer()
            })

            socket.on("fix-player", (data) => {
                if (!player) return false
                this.fixPersonalInfo(player, data)
            })

            socket.on("talk", (data) => {
                if (!player) return false
                this.talk(player, data)
            })

            socket.on("vote", (data) => {
                if (!player) return false
                this.vote(player, data)
            })

            socket.on("setWord", (data) => {
                if (!player || !player.canSetWord()) return false
                this.setWord(data)
            })

            socket.on("wolfWin", (data) => {
                if (!player || !player.canJudge()) return false
                this.changePhase("wolfWin")
            })

            socket.on("villageWin", (data) => {
                if (!player || !player.canJudge()) return false
                this.changePhase("villageWin")
            })

            socket.on("start", (data) => {
                if (!player || !player.hasPermittionOfRMCommand) return false
                this.start()
            })

            socket.on("kick", (data) => {
                if (!player || !player.hasPermittionOfRMCommand) return false

                this.players.kick(data.target)
                this.emitPlayer()
            })

            socket.on("fix-rm", (data) => {
                if (!player || !player.hasPermittionOfRMCommand) return false

                this.fixInfo(data)
            })
        })
        this.io.emit("refresh")
    }

    close() {
        GameIO.writeHTML(this.log.all(), this.players.list, this.villageInfo())
        GameIO.update(this.vno, { state: "logged" })
    }
}

export class GameIO {
    static writeHTML(log, player, vinfo) {
        ejs.renderFile(
            "./views/worewolf_html.ejs",
            {
                logs: log,
                players: player,
                vinfo: vinfo,
            },
            function (err, html) {
                if (err) console.log(err)
                html = html.replace(/\n{3,}/, "\n")
                fs.writeFile("./public/log/" + vinfo.no + ".html", html, "utf8", function (err) {
                    console.log(err)
                })
            }
        )
    }

    static update(vno, data) {
        GameSchema.updateOne({ vno: vno }, { $set: data }, (err) => {
            if (err) console.log(err)
        })
    }

    static find(vno) {
        return GameSchema.findOne({ vno: vno }).exec()
    }
}

class GameManager {
    io: any
    games: number[]

    constructor(io) {
        this.io = io
        this.games = []
        this.listen()
    }

    listen() {
        console.log("listen!")
        var mgr = this

        var rd = this.io.of(/^\/wordroom-\d+$/).on("connect", async function (socket) {
            var nsp = socket.nsp
            var vno = nsp.name.match(/\d+/)[0] - 0
            if (mgr.games.includes(vno)) return false

            mgr.games.push(vno)

            var result = await GameIO.find(vno)

            if (result) {
                var village = new Game(nsp, result)
                village.listen()
                console.log("listen room-" + vno)
            }
        })
    }
}

module.exports = GameManager
