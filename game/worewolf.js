const moment = require("moment")
const schema = require("../schema")
const GameSchema = schema.Game
const User = schema.User

const Log = require("./log")
const fs = require("fs")
const ejs = require("ejs")
const Cast = require("./cast")
const e = require("express")

const talkTemplate = {
    discuss: ["おはよ", "おはようこ", "おはよー", "おはようございます"],
    wolf: ["誰噛む？", "よろしく", "騙ります 即抜き"],
    share: ["誰吊る？", "怪しいとこあった？", "霊能COしていい？"],
    fox: ["占いは嫌だ", "コンコン", "特攻いくかｗ"],
    tweet: ["暇だな", "誰が狼や……", "あ、ヒヒ落ちたw"],
}

class socketLike {
    constructor() {
        this.id = "this is not socket"
        this.rooms = {}
    }
    emit() {
        return false
    }
    join() {
        return false
    }
    leave() {
        return false
    }
}

class PlayerSocket {
    constructor(socket) {
        this.socket = socket || new socketLike()
        this.rooms = new Set()
    }

    emit(type, data) {
        this.socket.emit(type, data)
    }

    join(name) {
        this.socket.join(name)
        this.rooms.add(name)
    }

    leave(name) {
        this.socket.leave(name)
        this.rooms.delete(name)
    }

    leaveAll() {
        for (var room of this.rooms) {
            this.leave(room)
        }
    }

    updateSocket(socket) {
        this.socket = socket
        for (var room of this.rooms) {
            this.join(room)
        }
    }
}

class Player {
    constructor(data, manager) {
        this.no = data.no === undefined ? 997 : data.no
        this.userid = data.userid || "null"

        this.cn = data.cn || "kari"
        this.color = data.color || "red"
        this.job = null
        this.isGM = data.isGM || false
        this.isKariGM = data.isKariGM || false
        this.isDamy = data.isDamy || false
        this.isNPC = data.isNPC || false
        this.isAlive = true
        this.voteTarget = null
        this.ability = {
            isUsed: false,
            target: null,
        }
        this.guarded = false

        this.manager = manager
        this.log = manager.log
        this.date = manager.date

        this.socket = new PlayerSocket(data.socket)

        this.getTrip()
    }

    async getTrip() {
        if (this.isDamy || this.isNPC || this.isNull) return false
        let user = await User.findOne({ userid: this.userid }).exec()
        this.trip = user.trip
    }

    get isDead() {
        return !this.isAlive
    }

    get hasPermittionOfGMCommand() {
        return this.isGM || (this.isKariGM && this.date.is("prologue"))
    }

    get isNull() {
        return this.no == 997
    }

    update(cn, color) {
        this.cn = cn
        this.color = color
    }

    forClientSummary() {
        return {
            no: this.no,
            cn: this.cn,
            color: this.color,
            isAlive: this.isAlive,
        }
    }

    forClientDetail() {
        return {
            no: this.no,
            userid: this.userid,
            trip: this.trip,
            cn: this.cn,
            color: this.color,
            job: this.job,
            isGM: this.isGM,
            isKariGM: this.isKariGM,
            isAlive: this.isAlive,
            vote: this.voteTarget,
            ability: {
                isUsed: this.ability.isUsed,
                target: this.ability.target,
            },
        }
    }

    vote(target) {
        if (this.voteTarget == target.no) return false
        this.voteTarget = target.no
        this.log.add("vote", {
            no: this.no,
            player: this.cn,
            target: target.cn,
        })
        this.socket.emit("voteSuccess")
    }

    setTarget(target) {
        this.ability.target = target.no
        this.ability.isUsed = true
    }

    kill(reason) {
        this.isAlive = false
        this.log.add("death", {
            reason: reason,
            player: this.cn,
            no: this.no,
        })
    }

    revive() {
        this.isAlive = true
        this.log.add("comeback", {
            player: this,
        })
    }

    isVote() {
        return this.voteTarget !== null
    }

    reset() {
        this.voteTarget = null
        this.ability.isUsed = false
        this.ability.target = null
        this.guarded = false
    }

    useAbility(type, target, isAuto) {
        isAuto = isAuto || false
        this.setTarget(target)
        this.log.add(type, { player: this, target: target, isAuto: isAuto })
        this.socket.emit("useAbilitySuccess")
    }

    noticeDamy(damy) {
        this.log.add("reiko", {
            no: this.no,
            job: damy.job.nameja,
        })
    }

    nightTalkType() {
        if (this.job.canWolfTalk) return "wolf"
        if (this.job.canFoxTalk) return "fox"
        if (this.job.canShareTalk) return "share"
        return "tweet"
    }

    randomSelectTarget() {
        return this.manager.lot(this.no)
    }

    randomVote() {
        this.vote(this.randomSelectTarget())
    }

    randomUseAbility(type) {
        this.useAbility(type, this.randomSelectTarget(), true)
    }

    canTalkNow(data) {
        if (this.isNull) return false
        let date = this.date
        switch (data.type) {
            case "discuss":
                return (date.canDiscuss() && this.isAlive) || date.is("epilogue")

            case "tweet":
                return date.canTweet() && this.isAlive

            case "share":
                return date.canNightTalk() && this.job.canShareTalk && this.isAlive

            case "fox":
                return date.canNightTalk() && this.job.canFoxTalk && this.isAlive

            case "wolf":
                return date.canWolfTalk() && this.job.canWolfTalk && this.isAlive

            case "grave":
                return this.isDead || this.isGM
        }
        return true
    }

    canVote(data) {
        if (this.isNull) return false

        if (!this.date.canVote()) return false

        if (!this.manager.pick(data.target)) return false
        if (this.no == data.target) return false
        if (this.isDead) return false

        return true
    }

    canUseAbility(data) {
        if (this.isNull) return false

        if (!this.date.canUseAbility()) return false

        var target = this.manager.pick(data.target)
        if (!target) return false

        switch (data.type) {
            case "fortune":
                if (!this.job.canFortune) return false
                if (this.ability.isUsed) return false
                break

            case "guard":
                if (!this.job.canGuard) return false
                break

            case "bite":
                if (!this.job.canBite) return false
                if (target.job.canBite) return false
                break

            case "revive":
                if (!this.job.canRevive) return false
                if (target.isAlive) return false
                if (this.date.day < 3) return false
                break
        }
        return true
    }
}

class PlayerManager {
    constructor(game) {
        this.players = {}
        this.list = []
        this.listAll = []
        this.userid2no = {}
        this.count = 0
        this.npcNames = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N"]

        this.nullPlayer = new Player({ no: 997 }, this)

        this.log = game.log
        this.date = game.date
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

        if (p.isGM || p.isKariGM || p.isDamy) return false

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

    resetVote() {
        for (var player of this) {
            player.voteTarget = null
        }
    }

    get num() {
        return this.list.length
    }

    numBySpecies() {
        var human = this.species("human").length
        var wolf = this.species("wolf").length
        var fox = this.species("fox").length

        return {
            human: human,
            wolf: wolf,
            fox: fox,
        }
    }

    alive() {
        return this.list.filter((p) => p.isAlive)
    }

    dead() {
        return this.list.filter((p) => !p.isAlive)
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

    damy() {
        return this.players[0]
    }

    NPC() {
        return this.alive().filter((p) => p.isNPC)
    }

    lot(ignore) {
        return this.alive()
            .filter((p) => p.no != ignore)
            .lot()
    }

    species(species) {
        return this.alive().filter((p) => p.job.species == species)
    }

    select(cond, reverse) {
        return this.alive().filter((p) => p.job[cond])
    }

    exclude(cond) {
        return this.alive().filter((p) => !p.job[cond])
    }

    compileVote() {
        var votes = {}
        var table = `<table class="votesummary"><tbody>`

        for (var player of this.alive()) {
            var target = this.pick(player.voteTarget)
            var get = this.alive().filter((p) => p.voteTarget == player.no).length
            votes[player.no] = get

            table += `<tr class="votedetail"><td>${player.cn}</td><td>(${get})</td><td>→</td><td>${target.cn}</td></tr>`
        }

        table += "</tbody></table>"

        var max = Math.max(...Object.values(votes))
        var maxers = Object.keys(votes).filter((v) => votes[v] == max)

        var exec = maxers.length == 1 ? this.pick(maxers[0]) : null

        return {
            table: table,
            exec: exec,
        }
    }

    setKnow() {
        var wolf = this.select("canBite").map((p) => p.cn)
        wolf = "【能力発動】人狼は" + wolf.join("、")

        var share = this.select("canShareTalk").map((p) => p.cn)
        share = "【能力発動】共有者は" + share.join("、")

        var fox = this.species("fox").map((p) => p.cn)
        fox = "【能力発動】妖狐は" + fox.join("、")

        var noble = this.select("isUseDecoy").map((p) => p.cn)
        noble = "【能力発動】貴族は" + noble.join("、")

        for (var player of this) {
            if (player.job.canKnowWolf) {
                player.job.know += wolf
            }
            if (player.job.canKnowShare) {
                player.job.know += share
            }
            if (player.job.canKnowFox) {
                player.job.know += fox
            }
            if (player.job.canKnowNoble) {
                player.job.know += noble
            }
        }
    }

    fellowFox() {
        if (this.species("fox").length == 0) {
            var imos = this.select("isFellowFox")
            for (var imo of imos) {
                imo.kill("fellow")
            }
        }
    }

    summonDamy() {
        this.add({
            userid: "shonichi",
            socket: null,
            cn: "初日犠牲者",
            color: "orange",
            isDamy: true,
            isNPC: true,
        })
    }

    summonNPC() {
        var cn = this.npcNames.shift()
        this.add({
            userid: "damy-" + cn,
            socket: null,
            cn: cn,
            color: "orange",
            isNPC: true,
        })
    }

    setGM(gmid, isKari) {
        if (isKari) {
            this.add({
                userid: gmid,
                socket: null,
                cn: "仮GM",
                color: "orange",
                isKariGM: true,
            })
        } else {
            var gm = new Player(
                {
                    userid: gmid,
                    socket: null,
                    no: 999,
                    isGM: true,
                    cn: "ゲームマスター",
                    color: "gm",
                },
                this
            )
            this.players[999] = gm

            this.userid2no[gmid] = 999

            gm.job = Cast.job("GM")
        }
    }

    isCompleteVote() {
        return this.alive().every((p) => p.isVote())
    }

    savoVote() {
        return this.alive().filter((p) => !p.isVote())
    }

    savoAbility(cond) {
        return this.alive().filter((p) => !p.ability.isUsed && p.job[cond])
    }

    makeTargets() {
        var targets = {}
        for (var player of this.alive()) {
            targets[player.no] = player.cn
        }
        return targets
    }

    makeDeathTargets() {
        var targets = {}
        for (var player of this.dead()) {
            targets[player.no] = player.cn
        }
        return targets
    }

    npcVote() {
        for (var npc of this.NPC()) {
            npc.randomVote()
        }
    }

    *[Symbol.iterator]() {
        yield* this.list
    }
}

class Room {
    constructor(PlayerManager, isShowJobDead) {
        this.players = PlayerManager
        this.isShowJobDead = isShowJobDead
    }

    assign() {
        for (var player of this.players.listAll) {
            var socket = player.socket

            socket.join("player-" + player.no)

            if (player.isGM) {
                socket.join("gm")
            }

            if (player.isDead) {
                socket.join("grave")
                if (this.isShowJobDead) {
                    socket.join("all")
                }
            } else {
                socket.leave("grave")
            }

            if (!player.job) continue

            if (player.job.canShareTalk) {
                socket.join("share")
            }

            if (player.job.canWolfTalk) {
                socket.join("wolf")
            }

            if (player.job.canFoxTalk) {
                socket.join("fox")
            }
        }
    }
}

class Date {
    constructor() {
        this.day = 1
        this.phase = "prologue"
        this.phaseLimit = null
    }

    setLimit(sec) {
        this.phaseLimit = moment().add(sec, "seconds").format()
    }

    clearLimit() {
        this.phaseLimit = null
    }

    leftSeconds() {
        return this.phaseLimit ? moment().diff(this.phaseLimit, "seconds") * -1 : null
    }

    sunrise() {
        this.day++
    }

    pass(phase) {
        this.phase = phase
    }

    forLog() {
        return { day: this.day, phase: this.phase }
    }

    is(phase) {
        return phase == this.phase
    }

    canWolfTalk() {
        return this.phase == "night"
    }

    canNightTalk() {
        return this.phase == "night" || this.phase == "ability"
    }

    canDiscuss() {
        return ["prologue", "day", "epilogue"].includes(this.phase)
    }

    canTweet() {
        return ["day", "vote", "night", "ability"].includes(this.phase)
    }

    canVote() {
        return ["day", "vote"].includes(this.phase)
    }

    canUseAbility() {
        return ["night", "ability"].includes(this.phase)
    }
}

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

        this.date = new Date()
        this.log = new Log(io, this.date)
        this.players = new PlayerManager(this)
        this.room = new Room(this.players, this.isShowJobDead)

        this.timerFlg = null
        this.leftVoteNum = 4
        this.isBanTalk = false

        this.win = null
        this.exec = null

        this.bite = null
        this.biter = null
        this.fortuned = []

        this.nullPlayer = this.players.nullPlayer

        this.log.add("vinfo", this.villageInfo())

        this.players.summonDamy()

        this.players.setGM(data.GMid, this.isKariGM)
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

    npcTalk() {
        for (var player of this.players.NPC()) {
            var data = {
                no: player.no,
                cn: player.cn,
                color: player.color,
            }

            if (this.date.is("day")) {
                data.type = "discuss"
            } else if (this.date.is("night")) {
                data.type = player.nightTalkType()
            } else {
                break
            }

            data.message = talkTemplate[data.type].lot()
            this.log.add("talk", data)

            if (data.type == "wolf") {
                this.log.add("wolfNeigh")
            }
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

    emitPlayer(socket) {
        var summary = this.players.forClientSummary()
        var detail = this.players.forClientDetail()
        if (this.date.is("epilogue")) {
            if (socket) {
                socket.emit("player", detail)
            } else {
                this.io.emit("player", detail)
            }
        } else {
            if (socket) {
                socket.emit("player", summary)
            } else {
                this.io.emit("player", summary)
                this.io.to("gm").to("all").emit("player", detail)
            }
        }
    }

    talk(userid, data) {
        var player = this.players.pick(userid)
        if (!player) return false

        if (data.type == "discuss" && this.isBanTalk) {
            this.log.add("talk", {
                cn: "???",
                color: "black",
                type: "restrict",
                message: "まだ発言できません",
            })
            player.socket.emit("banTalk")
            return false
        }

        data.cn = player.cn
        data.color = player.color

        this.log.add("talk", data)
    }

    vote(userid, data) {
        var player = this.players.pick(userid)
        var target = this.players.pick(data.target)

        player.vote(target)

        if (this.players.isCompleteVote()) {
            this.changePhase("night")
        }
    }

    useAbility(userid, data) {
        var player = this.players.pick(userid)
        var target = this.players.pick(data.target)
        if (!player || !target) return false

        switch (data.type) {
            case "fortune":
                player.useAbility("fortune", target)
                this.fortuned.push(target.no)
                break

            case "guard":
                player.useAbility("guard", target)
                break

            case "bite":
                player.useAbility("bite", target)

                this.bite = target
                this.biter = player

                for (var wolf of this.players.select("canBite")) {
                    player.setTarget(target)
                }

                this.io.to("wolf").emit("useAbilitySuccess")
                break
            case "revive":
                player.useAbility("revive", target)
                break
        }
    }

    canStart() {
        return this.players.num >= 4 && this.date.is("prologue")
    }

    start() {
        if (!this.canStart()) return false

        GameIO.update(this.vno, { state: "playing" })

        this.date.pass("vote") // これをやらないとログが出ない
        this.casting()

        this.emitPersonalData()
        this.changePhase("night")
    }

    casting() {
        var castlist = Cast.makeJobs(this.casttype, this.players.num)
        var job, i
        for (var player of this.players) {
            do {
                i = Math.floor(Math.random() * castlist.length)
                job = castlist[i]
            } while (player.isDamy && job.onlyNotDamy)

            player.job = job
            castlist.splice(i, 1)
        }
        this.room.assign()
        this.players.setKnow()

        var txt = Cast.makeCastTxt(this.casttype, this.players.num)
        this.log.add("system", {
            message: `配役は${txt}です。`,
        })
    }

    checkCast() {
        var txt = Cast.makeCastTxtAll(this.players.num)
        this.log.add("info", {
            message: txt,
        })
    }

    endCheck() {
        var alives = this.players.numBySpecies()
        var human = alives.human,
            wolf = alives.wolf,
            fox = alives.fox

        if (wolf == 0) {
            if (fox >= 1) {
                this.win = "fox"
            } else {
                this.win = "human"
            }
            this.finish()
            return true
        } else if (wolf >= human) {
            if (fox >= 1) {
                this.win = "fox"
            } else {
                this.win = "wolf"
            }
            this.finish()
            return true
        }
        return false
    }

    draw() {
        this.win = "draw"
        this.finish()
    }

    execution() {
        if (this.date.day == 1) return true

        for (var player of this.players.savoVote()) {
            player.randomVote()
        }

        var voteResult = this.players.compileVote()

        this.log.add("voteSummary", {
            message:
                `<img src='../images/voteResult.png'/>${this.date.day}日目 投票結果` +
                voteResult.table,
        })

        if (!voteResult.exec) return false

        var exec = voteResult.exec
        exec.kill("exec")
        this.exec = exec

        if (exec.job.isStandOff) {
            this.players.lot(exec.no).kill("standoff")
        }

        this.players.fellowFox()

        return true
    }

    useFirstNightAbility() {
        var damy = this.players.damy()
        this.bite = damy
        this.log.add("bite", { player: { cn: "狼", no: 998 }, target: damy })

        for (var reiko of this.players.select("canKnowDamyJob")) {
            reiko.noticeDamy(damy)
        }
    }

    autoUseAbility() {
        /*自動噛み処理*/
        if (this.bite === null) {
            var biter = this.players.select("canBite").lot()
            var target = this.players.exclude("canBite").lot()

            this.bite = target
            this.biter = biter

            biter.useAbility("bite", target, true)
        }

        /*自動占い*/
        for (var player of this.players.savoAbility("canFortune")) {
            player.randomUseAbility("fortune")
        }

        /*自動護衛*/
        if (this.date.day < 2) return false

        for (var player of this.players.savoAbility("canGuard")) {
            player.randomUseAbility("guard")
        }
    }

    guard() {
        if (this.date.day >= 2) {
            for (var player of this.players.select("canGuard")) {
                var target = this.players.pick(player.ability.target)
                target.guarded = true
            }
        }
    }

    revive() {
        for (let player of this.players.select("canRevive")) {
            if (player.ability.target === null) continue

            let target = this.players.pick(player.ability.target)
            let threshold = target.isDamy ? 50 : 30
            if (Math.floor(Math.random() * 100) < threshold) {
                target.revive()
            }
        }
    }

    attack() {
        var kills = []

        var bite = this.bite
        if (!bite.guarded && !bite.job.isResistBite) {
            var slave = this.players.select("isDecoy")
            if (bite.job.isUseDecoy && slave.length) {
                kills = kills.concat(slave)
            } else {
                kills.push(bite)
            }

            if (bite.job.isStandOff) {
                kills.push(this.biter)
            }
        }

        for (var f of this.fortuned) {
            var fortuned = this.players.pick(f)
            if (fortuned.job.ismelt) {
                kills.push(fortuned)
            }
        }

        for (var kill of kills) {
            kill.kill("bite")
        }

        this.players.fellowFox()
    }

    nightReset() {
        this.players.reset()
        this.room.assign()

        this.fortuned = []
        this.bite = null
        this.biter = null
        this.leftVoteNum = 4
    }

    useNightAbility() {
        if (this.date.day < 2) return false
        for (var player of this.players.select("canNecro")) {
            player.useAbility("necro", this.exec)
        }
    }

    setnsec() {
        if (!this.time.nsec) return false
        this.isBanTalk = true
        setTimeout(() => {
            this.isBanTalk = false
        }, this.time.nsec * 1000)
    }

    changePhase(phase) {
        switch (phase) {
            case "night":
                this.date.pass("vote")
                let isExecSuccess = this.execution()
                if (!isExecSuccess) {
                    this.changePhase("revote")
                    return false
                }
                if (this.endCheck()) return false

                this.nightReset()
                this.pass("night")

                if (this.date.day == 1) {
                    this.useFirstNightAbility()
                }
                this.useNightAbility()

                break

            case "ability":
                this.pass("ability")
                break

            case "day":
                this.autoUseAbility()

                this.guard()
                this.revive()
                this.attack()

                if (this.endCheck()) return false

                this.room.assign()
                this.date.sunrise()
                this.pass("day")

                this.setnsec()

                break

            case "vote":
                this.pass("vote")

                this.players.npcVote()
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

                this.log.add("changePhase", {
                    phase: "revote",
                    left: this.leftVoteNum,
                })

                this.players.resetVote()

                this.pass("revote")

                this.players.npcVote()
                if (this.players.isCompleteVote()) {
                    this.changePhase("night")
                    return false
                }

                break
        }

        this.npcTalk()
    }

    finish() {
        var sides = { human: "村人", wolf: "人狼", fox: "妖狐", draw: "引き分け" }

        this.log.add("gameend", { side: sides[this.win] })

        this.date.pass("epilogue")

        this.emitPersonalData()
        this.emitChangePhase("epilogue")

        clearTimeout(this.timerFlg)
        this.date.clearLimit()

        this.emitResult()

        this.emitPlayer()
        this.emitInitialLog()

        GameIO.update(this.vno, { state: "finish" })

        var logtime = moment().add(10, "minute").format("YYYY/MM/DD HH:mm:ss")
        this.log.add("system", {
            message: "この村は" + logtime + "にhtml化されます。",
        })

        setTimeout(() => {
            this.close()
        }, 1000 * 60 * 10)
    }

    emitResult() {
        if (this.win == "draw") {
            for (let player of this.players) {
                this.log.add("result", { result: "draw", player: player })
            }
            return false
        }

        for (let player of this.players) {
            let isWin = true
            if (!player.job.ignoreCamp && player.job.camp != this.win) {
                isWin = false
            }
            if (player.job.mustAlive && player.isDead) {
                isWin = false
            }
            if (player.killNoble) {
                if (this.players.select("isUseDecoy").length != 0) {
                    isWin = false
                }
            }
            this.log.add("result", { result: isWin ? "win" : "lose", player: player })
        }
    }

    emitChangePhase(phase) {
        var nsec = phase == "day" && this.time.nsec ? this.time.nsec : null
        this.io.emit("changePhase", {
            phase: phase,
            left: this.time[phase],
            nsec: nsec,
            targets: this.players.makeTargets(),
            deathTargets: this.players.makeDeathTargets(),
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
        for (var player of this.players) {
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
            this.log.add("changePhase", this.date.forLog())
        }

        this.emitPersonalData()
        this.emitPlayer()
        this.emitChangePhase(phase)

        clearTimeout(this.timerFlg)

        this.timerFlg = setTimeout(() => {
            this.changePhase(next[phase])
        }, 1000 * this.time[phase])

        this.date.setLimit(this.time[phase])
    }

    emitInitialLog(userid, socket) {
        if (this.date.is("epilogue")) {
            this.io.emit("initialLog", this.log.all())
            return false
        }
        var player = this.players.pick(userid)
        var logs = this.log.initial(player)
        socket.emit("initialLog", logs)
    }

    listen() {
        this.io.on("connection", (socket) => {
            var session = socket.request.session
            var userid = session.userid
            var player = this.nullPlayer

            this.emitPlayer(socket)

            if (this.players.in(userid)) {
                player = this.players.pick(userid)

                socket.emit("enterSuccess", player.forClientDetail())

                player.socket.updateSocket(socket)

                this.room.assign()

                this.emitPlayer()
            }

            this.emitInitialPhase(socket)
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
                if (!player || player.isGM || player.isKariGM) return false
                this.players.leave(userid)
                this.emitPlayer()
            })

            socket.on("fix-player", (data) => {
                if (!player) return false
                this.fixPersonalInfo(player, data)
            })

            socket.on("talk", (data) => {
                if (!player.canTalkNow(data)) return false
                this.talk(userid, data)
            })

            socket.on("vote", (data) => {
                if (!player.canVote(data)) return false
                this.vote(userid, data)
            })

            socket.on("ability", (data) => {
                if (!player.canUseAbility(data)) return false
                this.useAbility(userid, data)
            })

            socket.on("start", (data) => {
                if (!player.hasPermittionOfGMCommand) return false
                this.start()
            })

            socket.on("summonNPC", (data) => {
                if (!player.hasPermittionOfGMCommand) return false
                this.players.summonNPC()
                this.emitPlayer()
            })

            socket.on("checkCast", (data) => {
                if (!player.hasPermittionOfGMCommand) return false

                this.checkCast()
            })

            socket.on("kick", (data) => {
                if (!player.hasPermittionOfGMCommand) return false

                this.players.kick(data.target)
                this.emitPlayer()
            })

            socket.on("fix-gm", (data) => {
                if (!player.hasPermittionOfGMCommand) return false

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

class GameIO {
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
    constructor(io) {
        this.io = io
        this.games = []
        this.listen()
    }

    listen() {
        console.log("listen!")
        var mgr = this

        var rd = this.io
            .of((name, query, next) => {
                next(null, /^\/room-\d+$/.test(name))
            })
            .on("connect", async function (socket) {
                var nsp = socket.nsp
                var vno = nsp.name.match(/\d+/)[0] - 0
                if (!mgr.games.includes(vno)) {
                    mgr.games.push(vno)

                    var result = await GameIO.find(vno)

                    if (result) {
                        var village = new Game(nsp, result)
                        village.listen()
                        console.log("listen room-" + vno)
                    }
                }
            })
    }
}

module.exports = GameManager
