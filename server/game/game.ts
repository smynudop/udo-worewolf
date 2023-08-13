import { Player, Visitor } from "./player"
import { PlayerManager } from "./playerManager"
import { FlagManager } from "./flagManager"
import { Log } from "./log"
import { VillageDate } from "./villageDate"
import { GameIO } from "./gameIO"
import { talkTemplate } from "./command"
import { castManager } from "./cast"
import { VillageSetting } from "./VillageSetting"
import SocketIO from "socket.io"
import { GameNsManager } from "./GameNsManager"
import { IGame } from "../db/schema/game"

import moment from "moment"
import { IPhase, IResult, ITalkType } from "./constants"

export type IChangePhaseInfo = {
    phase: IPhase
    left: number | null
    nsec: number | null
    targets: Record<number, string>
    deathTargets: Record<number, string>
    day: number
}

export class Game {
    io: GameNsManager
    villageSetting: VillageSetting
    isKariGM: boolean
    date: VillageDate
    log: Log
    players: PlayerManager
    flagManager: FlagManager
    leftVoteNum: number
    win: IResult | null = null

    constructor(io: SocketIO.Namespace, data: IGame) {
        this.io = new GameNsManager(io)

        this.villageSetting = new VillageSetting(data)
        this.isKariGM = data.kariGM || false

        this.date = new VillageDate(this)
        this.log = new Log(this.io, this.date)
        this.players = new PlayerManager(this)
        this.flagManager = new FlagManager(this.players)

        this.leftVoteNum = 4

        this.log.add("system", "vinfo", { message: this.villageSetting.text() })

        this.players.summonDamy()

        this.players.setGM(data.GMid, this.isKariGM)

        this.listen()
    }

    fixInfo(data: IGame) {
        this.villageSetting.update(data)
        GameIO.update(this.villageSetting.vno, data)
        this.log.add("system", "vinfo", { message: this.villageSetting.text() })
    }

    startRollcall() {
        this.flagManager.startRollcall()
        this.emitPlayerAll()
        this.log.add("system", "startRollCall")
    }

    assignRoom() {
        this.flagManager.assignRoom(this.villageSetting.isShowJobDead)
        this.io.assignRoom()
    }

    npcTalk() {
        for (const player of this.players.NPC()) {
            const talkType: ITalkType = this.date.is("day") ? "discuss" : player.nightTalkType()
            const data = {
                no: player.no,
                cn: player.cn,
                color: player.color,
                input: talkTemplate[talkType].lot(),
                size: "",
            }

            this.log.addTalk(talkType, data)
        }
    }

    emitPlayerAll() {
        if (this.date.is("epilogue")) {
            this.io.emit("player", this.players.forClientDetail())
        } else {
            this.io.emit("player", this.players.forClientSummary())
            this.io.emitPlayer("player", this.players.forClientDetail())
        }
    }

    emitPlayer(socket: SocketIO.Socket) {
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

        GameIO.update(this.villageSetting.vno, { state: "playing" })

        this.date.pass("vote") // これをやらないとログが出ない
        this.casting()

        this.emitPersonalData()
        this.changePhase("night")
    }

    casting() {
        const castlist = castManager.jobList(this.villageSetting.casttype, this.players.num)
        if (!castlist) return false

        for (let i = 0; i < this.players.num; i++) {
            const player = this.players.list[i]
            player.status.set(castlist[i])
        }

        this.assignRoom()
        this.players.setKnow()

        const txt = castManager.makeCastTxt(this.villageSetting.casttype, this.players.num)
        this.log.add("system", "cast", { message: txt })
    }

    checkCast() {
        if (!this.canStart()) return false

        const txt = castManager.makeCastTxtAll(this.players.num)
        if (!txt) return false
        this.log.add("system", "info", { message: txt })
    }

    endCheck() {
        const alives = this.players.numBySpecies()
        const human = alives.human,
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

        for (const player of this.players.savoVote()) {
            player.randomVote()
        }

        const voteResult = this.players.compileVote()

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
        if (!this.villageSetting.time.nsec) return false
        this.date.setNsec(this.villageSetting.time.nsec)
    }

    checkAllVote() {
        if (this.players.isCompleteVote()) {
            this.changePhase("night")
        }
    }

    changePhase(phase: string) {
        switch (phase) {
            case "night":
                this.date.pass("vote")

                if (!this.compileVote()) {
                    this.changePhase("revote")
                    return false
                }

                this.flagManager.nightProgress()

                if (this.endCheck()) return false

                this.nightReset()
                this.pass("night")

                this.flagManager.useNightAbility()
                //this.npcTalk()

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
                this.npcTalk()

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
        const sides: { [k in IResult]: string } = {
            human: "村人",
            wolf: "人狼",
            fox: "妖狐",
            draw: "引き分け",
        }
        if (this.win != "draw") {
            this.log.add("gameend", "win", { side: sides[this.win!] })
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

        GameIO.update(this.villageSetting.vno, { state: "finish" })

        const logtime = moment().add(10, "minute").format("YYYY/MM/DD HH:mm:ss")
        this.log.add("system", "loggedDate", { message: logtime })

        setTimeout(
            () => {
                this.close()
            },
            1000 * 60 * 10
        )
    }

    emitResult() {
        if (this.win == "draw") {
            for (const player of this.players) {
                this.log.add("result", "draw", { player: player.cn })
            }
            return false
        }

        for (const player of this.players) {
            player.judgeWinOrLose(this.win!)
        }
    }

    emitChangePhase(phase: IPhase) {
        const nsec =
            phase == "day" && this.villageSetting.time.nsec ? this.villageSetting.time.nsec : null
        this.io.emit("changePhase", {
            phase: phase,
            left: this.villageSetting.getTime(phase),
            nsec: nsec,
            targets: this.players.makeTargets(),
            deathTargets: this.players.makeTargets("death"),
            day: this.date.day,
        })
    }

    emitInitialPhase(socket: SocketIO.Socket) {
        const time = this.date.leftSeconds()
        socket.emit("changePhase", {
            phase: this.date.phase,
            left: time,
            targets: this.players.makeTargets(),
            day: this.date.day,
            villageInfo: this.villageSetting.villageInfo(),
        })
    }

    emitPersonalData() {
        for (const player of this.players.listAll) {
            this.io.emitPersonal("you", player.forClientDetail(), player.no)
        }
    }

    pass(phase: IPhase | "revote") {
        const next = {
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

        this.date.setTimer(next[phase as keyof typeof next], this.villageSetting.getTime(phase)!)
    }

    emitAllLog() {
        this.io.emit("initialLog", this.log.all())
    }

    listen() {
        this.io.listen((socket: SocketIO.Socket) => {
            // @ts-ignore
            const userid = socket.request.session.userid

            let visitor: Visitor

            this.emitPlayer(socket)

            if (this.players.in(userid)) {
                visitor = this.players.pick(userid)
                const player = visitor as Player

                //player.socket.updateSocket(socket)
                //player.emitPersonalInfo()
                this.io.emitPersonal("enterSuccess", player.forClientDetail(), player.no)
                this.assignRoom()

                this.emitPlayerAll()
            } else {
                const data = { userid: userid, socket: socket }
                visitor = this.players.newVisitor(data)
            }

            this.emitInitialPhase(socket)
            this.io.emitPersonal("initialLog", this.log.initial(visitor), 0) // TODO

            socket.on("enter", (data) => {
                if (this.players.in(userid)) return false
                if (this.players.num >= this.villageSetting.capacity) return false

                data.userid = userid
                data.socket = socket
                visitor = this.players.add(data)
                const player = visitor as Player

                this.io.emitPersonal("enterSuccess", player.forClientDetail(), player.no)
                this.emitPlayerAll()
            })

            socket.on("leave", (data) => {
                if (!visitor || visitor.isGM || visitor.isKariGM) return false

                const p = this.players.leave(userid)
                if (p != null) {
                    this.io.emitPersonal("leaveSuccess", true, p.no)
                }
                this.emitPlayerAll()
            })

            socket.on("fix-player", (data) => {
                visitor.update(data)
                this.emitPlayerAll()
            })

            socket.on("talk", (data) => {
                const result = visitor.talk(data)
                if (result == "nsec") {
                    this.io.emitPersonal("banTalk", true, 0) // 要改善
                }
                this.emitPlayerAll() // 要改善
            })

            socket.on("vote", (data) => {
                visitor.vote(data)
                this.io.emitPersonal("voteSuccess", true, 0) // TODO
                this.checkAllVote()
            })

            socket.on("ability", (data) => {
                switch (data.type) {
                    case "bite":
                        for (const biter of this.players.has("biter")) {
                            biter.except("biter")
                        }

                        this.io.emitRoom("useAbilitySuccess", true, "wolf")
                        break
                }
                visitor.useAbility(data)
                this.io.emitPersonal("useAbilitySuccess", true, 0) // TODO
            })

            socket.on("rollcall", (data) => {
                if (!visitor.hasPermittionOfGMCommand) return false
                this.startRollcall()
            })

            socket.on("start", (data) => {
                if (!visitor.hasPermittionOfGMCommand) return false
                this.start()
            })

            socket.on("summonNPC", (data) => {
                if (!visitor.hasPermittionOfGMCommand) return false
                this.players.summonNPC()
                this.emitPlayerAll()
            })

            socket.on("checkCast", (data) => {
                if (!visitor.hasPermittionOfGMCommand) return false
                this.checkCast()
            })

            socket.on("kick", (data) => {
                if (!visitor.hasPermittionOfGMCommand) return false

                const p = this.players.kick(data.target)
                if (p != null) {
                    this.io.emitPersonal("leaveSuccess", true, p.no)
                }
                this.emitPlayerAll()
            })

            socket.on("fix-gm", (data) => {
                if (!visitor.hasPermittionOfGMCommand) return false

                this.fixInfo(data)
            })
        })
        this.io.emit("refresh", true)
    }

    close() {
        GameIO.writeHTML({
            log: this.log.all(),
            player: this.players.list,
            vinfo: this.villageSetting.villageInfo(),
        })
        GameIO.update(this.villageSetting.vno, { state: "logged" })
    }
}
