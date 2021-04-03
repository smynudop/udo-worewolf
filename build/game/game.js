"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.Game = void 0
const playerManager_1 = require("./playerManager")
const flagManager_1 = require("./flagManager")
const log_1 = require("./log")
const villageDate_1 = require("./villageDate")
const gameIO_1 = require("./gameIO")
const command_1 = require("./command")
const cast_1 = require("./cast")
const moment = require("moment")
class Game {
    constructor(io, data) {
        this.io = io
        this.vno = data.vno || 1
        this.name = data.name || "とある村"
        this.pr = data.pr || "宣伝文が設定されていません"
        this.casttype = data.casttype || "Y"
        this.time = data.time || {
            day: 285,
            vote: 150,
            night: 180,
            ability: 120,
            nsec: 15,
        }
        this.GMid = data.GMid
        this.capacity = data.capacity || 17
        this.isShowJobDead = data.isShowJobDead || true
        this.isKariGM = data.kariGM
        this.date = new villageDate_1.VillageDate(this)
        this.log = new log_1.Log(io, this.date)
        this.players = new playerManager_1.PlayerManager(this)
        this.flagManager = new flagManager_1.FlagManager(this.players)
        this.leftVoteNum = 4
        this.win = ""
        //this.log.add("system", "vinfo", this.villageInfo())
        this.players.summonDamy()
        this.players.setGM(data.GMid, this.isKariGM)
        this.listen()
    }
    fixInfo(data) {
        for (var key in data) {
            if (this[key] === undefined) continue
            this[key] = data[key]
        }
        gameIO_1.GameIO.update(this.vno, data)
        //this.log.add("system", "vinfo", this.villageInfo())
    }
    startRollcall() {
        this.flagManager.startRollcall()
        this.emitPlayerAll()
        this.log.add("system", "startRollCall")
    }
    assignRoom() {
        this.flagManager.assignRoom(this.isShowJobDead)
    }
    npcTalk() {
        for (var player of this.players.NPC()) {
            let talkType = player.nightTalkType()
            var data = {
                no: player.no,
                cn: player.cn,
                color: player.color,
                input: command_1.talkTemplate[talkType].lot(),
                type: talkType,
            }
            this.log.add("talk", talkType, data)
        }
    }
    villageInfo() {
        return {
            name: this.name,
            pr: this.pr,
            no: this.vno,
            time: this.time,
            GMid: this.GMid,
            capacity: this.capacity,
            casttype: this.casttype,
            isShowJobDead: this.isShowJobDead,
        }
    }
    emitPlayerAll() {
        if (this.date.is("epilogue")) {
            this.io.emit("player", this.players.forClientDetail())
        } else {
            this.io.emit("player", this.players.forClientSummary())
            this.io.to("gm").to("all").emit("player", this.players.forClientDetail())
        }
    }
    emitPlayer(socket) {
        if (!socket) return false
        if (this.date.is("epilogue")) {
            socket.emit("player", this.players.forClientDetail())
        } else {
            socket.emit("player", this.players.forClientSummary())
        }
    }
    canStart() {
        return this.players.num >= 4 && this.date.is("prologue")
    }
    start() {
        if (!this.canStart()) return false
        gameIO_1.GameIO.update(this.vno, { state: "playing" })
        this.date.pass("vote") // これをやらないとログが出ない
        this.casting()
        this.emitPersonalData()
        this.changePhase("night")
    }
    casting() {
        var castlist = cast_1.castManager.jobList(this.casttype, this.players.num)
        if (!castlist) return false
        for (let i = 0; i < this.players.num; i++) {
            let player = this.players.list[i]
            player.status.set(castlist[i])
        }
        this.assignRoom()
        this.players.setKnow()
        var txt = cast_1.castManager.makeCastTxt(this.casttype, this.players.num)
        this.log.add("system", "cast", { message: txt })
    }
    checkCast() {
        if (!this.canStart()) return false
        var txt = cast_1.castManager.makeCastTxtAll(this.players.num)
        if (!txt) return false
        this.log.add("system", "info", { message: txt })
    }
    endCheck() {
        var alives = this.players.numBySpecies()
        var human = alives.human,
            wolf = alives.wolf,
            fox = alives.fox
        if (wolf == 0) {
            this.win = fox ? "fox" : "human"
            this.finish()
            return true
        }
        if (wolf >= human) {
            this.win = fox ? "fox" : "wolf"
            this.finish()
            return true
        }
        return false
    }
    draw() {
        this.win = "draw"
        this.finish()
    }
    compileVote() {
        if (this.date.day == 1) return true
        for (var player of this.players.savoVote()) {
            player.randomVote()
        }
        var voteResult = this.players.compileVote()
        this.log.add("vote", "summary", {
            message: voteResult.table,
            day: this.date.day,
        })
        if (voteResult.exec) {
            voteResult.exec.status.add("maxVoted")
        }
        return voteResult.exec
    }
    nightReset() {
        this.flagManager.reset()
        this.assignRoom()
        this.leftVoteNum = 4
    }
    morningReset() {
        this.flagManager.updateStatus()
        this.assignRoom()
    }
    setnsec() {
        if (!this.time.nsec) return false
        this.date.setNsec(this.time.nsec)
    }
    checkAllVote() {
        if (this.players.isCompleteVote()) {
            this.changePhase("night")
        }
    }
    changePhase(phase) {
        switch (phase) {
            case "night":
                this.date.pass("vote")
                let isExec = this.compileVote()
                if (!isExec) {
                    this.changePhase("revote")
                    return false
                }
                this.flagManager.nightProgress()
                if (this.endCheck()) return false
                this.nightReset()
                this.pass("night")
                this.flagManager.useNightAbility()
                this.npcTalk()
                break
            case "ability":
                this.pass("ability")
                break
            case "day":
                this.flagManager.morningProgress()
                if (this.endCheck()) return false
                this.pass("day")
                this.morningReset()
                this.setnsec()
                break
            case "vote":
                this.pass("vote")
                this.flagManager.npcVote()
                if (this.players.isCompleteVote()) {
                    this.changePhase("night")
                    return false
                }
                break
            case "revote":
                this.leftVoteNum--
                if (!this.leftVoteNum) {
                    this.draw()
                    return false
                }
                this.log.add("phase", "revote", {
                    left: this.leftVoteNum,
                })
                this.flagManager.resetVote()
                this.pass("revote")
                this.flagManager.npcVote()
                this.checkAllVote()
                break
        }
    }
    finish() {
        var sides = {
            human: "村人",
            wolf: "人狼",
            fox: "妖狐",
            draw: "引き分け",
        }
        if (this.win != "draw") {
            this.log.add("gameend", "win", { side: sides[this.win] })
        } else {
            this.log.add("gameend", "draw")
        }
        this.date.pass("epilogue")
        this.date.clearTimer()
        this.emitPersonalData()
        this.emitChangePhase("epilogue")
        this.emitResult()
        this.emitPlayerAll()
        this.emitAllLog()
        gameIO_1.GameIO.update(this.vno, { state: "finish" })
        var logtime = moment().add(10, "minute").format("YYYY/MM/DD HH:mm:ss")
        this.log.add("system", "loggedDate", { message: logtime })
        setTimeout(() => {
            this.close()
        }, 1000 * 60 * 10)
    }
    emitResult() {
        if (this.win == "draw") {
            for (let player of this.players) {
                this.log.add("result", "draw", { player: player.cn })
            }
            return false
        }
        for (let player of this.players) {
            player.judgeWinOrLose(this.win)
        }
    }
    emitChangePhase(phase) {
        var nsec = phase == "day" && this.time.nsec ? this.time.nsec : null
        this.io.emit("changePhase", {
            phase: phase,
            left: this.time[phase],
            nsec: nsec,
            targets: this.players.makeTargets(),
            deathTargets: this.players.makeTargets("death"),
            day: this.date.day,
        })
    }
    emitInitialPhase(socket) {
        var time = this.date.leftSeconds()
        socket.emit("changePhase", {
            phase: this.date.phase,
            left: time,
            targets: this.players.makeTargets(),
            day: this.date.day,
            villageInfo: this.villageInfo(),
        })
    }
    emitPersonalData() {
        for (var player of this.players.listAll) {
            player.socket.emit("you", player.forClientDetail())
        }
    }
    pass(phase) {
        var next = {
            day: "vote",
            vote: "night",
            night: "ability",
            ability: "day",
        }
        if (phase == "revote") {
            phase = "vote"
            this.date.pass("vote")
        } else {
            this.date.pass(phase)
            this.log.add("phase", this.date.phase, { day: this.date.day })
        }
        this.emitPersonalData()
        this.emitPlayerAll()
        this.emitChangePhase(phase)
        this.date.setTimer(next[phase], this.time[phase])
    }
    emitAllLog() {
        this.io.emit("initialLog", this.log.all())
    }
    listen() {
        this.io.on("connection", (socket) => {
            console.dir(socket.request, { depth: 0 })
            var userid = socket.request.session.userid
            var player
            this.emitPlayer(socket)
            if (this.players.in(userid)) {
                player = this.players.pick(userid)
                player.socket.updateSocket(socket)
                player.emitPersonalInfo()
                this.assignRoom()
                this.emitPlayerAll()
            } else {
                let data = { userid: userid, socket: socket }
                player = this.players.newVisitor(data)
            }
            this.emitInitialPhase(socket)
            player.emitInitialLog()
            socket.on("enter", (data) => {
                if (this.players.in(userid)) return false
                if (this.players.num >= this.capacity) return false
                data.userid = userid
                data.socket = socket
                player = this.players.add(data)
                player.emitPersonalInfo()
                this.emitPlayerAll()
            })
            socket.on("leave", (data) => {
                if (!player || player.isGM || player.isKariGM) return false
                this.players.leave(userid)
                this.emitPlayerAll()
            })
            socket.on("fix-player", (data) => {
                player.update(data)
                this.emitPlayerAll()
            })
            socket.on("talk", (data) => {
                player.talk(data)
                this.emitPlayerAll() // 要改善
            })
            socket.on("vote", (data) => {
                player.vote(data)
                this.checkAllVote()
            })
            socket.on("ability", (data) => {
                player.useAbility(data)
                switch (data.type) {
                    case "bite":
                        for (var biter of this.players.has("biter")) {
                            biter.except("biter")
                        }
                        this.io.to("wolf").emit("useAbilitySuccess")
                        break
                }
            })
            socket.on("rollcall", (data) => {
                if (!player.hasPermittionOfGMCommand) return false
                this.startRollcall()
            })
            socket.on("start", (data) => {
                if (!player.hasPermittionOfGMCommand) return false
                this.start()
            })
            socket.on("summonNPC", (data) => {
                if (!player.hasPermittionOfGMCommand) return false
                this.players.summonNPC()
                this.emitPlayerAll()
            })
            socket.on("checkCast", (data) => {
                if (!player.hasPermittionOfGMCommand) return false
                this.checkCast()
            })
            socket.on("kick", (data) => {
                if (!player.hasPermittionOfGMCommand) return false
                this.players.kick(data.target)
                this.emitPlayerAll()
            })
            socket.on("fix-gm", (data) => {
                if (!player.hasPermittionOfGMCommand) return false
                this.fixInfo(data)
            })
        })
        this.io.emit("refresh")
    }
    close() {
        gameIO_1.GameIO.writeHTML(this.log.all(), this.players.list, this.villageInfo())
        gameIO_1.GameIO.update(this.vno, { state: "logged" })
    }
}
exports.Game = Game
//# sourceMappingURL=game.js.map
