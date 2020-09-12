const moment = require("moment")
const schema = require("../schema")
const GameSchema = schema.Game
const User = schema.User

const PlayerSocket = require("./socket")

const commandInfo = require("./command")
const abilityInfo = commandInfo.ability
const talkInfo = commandInfo.talk

const Log = require("./log")
const fs = require("fs")
const ejs = require("ejs")
const Cast = require("./cast")
const e = require("express")
const { runInThisContext } = require("vm")

const talkTemplate = {
    discuss: ["おはよ", "おはようこ", "おはよー", "おはようございます"],
    wolf: ["誰噛む？", "よろしく", "騙ります 即抜き"],
    share: ["誰吊る？", "怪しいとこあった？", "霊能COしていい？"],
    fox: ["占いは嫌だ", "コンコン", "特攻いくかｗ"],
    tweet: ["暇だな", "誰が狼や……", "あ、ヒヒ落ちたw"],
}

class Status {
    constructor(player) {
        this.name = ""
        this.nameja = ""
        this.camp = "" //陣営
        this.species = "" //種族(勝敗判定に使う)

        this.isAlive = true

        this.fortuneResult = "村人"
        this.necroResult = "村人"

        this.desc = ""
        this.knowText = ""

        //永続の属性(呪殺・噛み耐性など)
        this.forever = []

        //一時的な属性(噛まれた、占われた)
        this.temporary = []

        //窓に発言する
        this.talk = []

        //窓を見る
        this.watch = []

        //能力
        this.ability = []

        //役職を知る
        this.know = []

        this.winCond = []

        this.limit = {}

        this.target = null
        this.vote = null

        this.player = player
        this.date = player.date
    }

    command() {
        return this.ability
            .map((a) => {
                let info = abilityInfo[a]
                if (!info) return null
                info.target = this.player.manager.makeTargets(info.targetType)
                return info
            })
            .filter((a) => a !== null)
    }

    talkCommand() {
        let commands = []
        for (let type in talkInfo) {
            let t = talkInfo[type]
            if (this.player.canTalkNow({ type: type })) {
                commands.push(t)
            }
        }
        return commands
    }

    forClient() {
        let desc = this.desc
            ? `あなたは【${this.nameja}】です。<br>${this.desc}${this.knowText}`
            : ""
        return {
            name: this.name,
            nameja: this.nameja,
            desc: desc,
            ability: this.ability,
            target: this.target,
            vote: this.vote,
            command: this.command(),
            talkCommand: this.talkCommand(),
        }
    }

    set(job) {
        this.name = job.name
        this.nameja = job.nameja
        this.camp = job.camp //陣営
        this.species = job.species //種族(勝敗判定に使う)

        this.fortuneResult = job.fortuneResult
        this.necroResult = job.necroResult

        this.desc = job.desc

        this.talk = job.talk
        this.watch = job.watch
        this.ability = job.ability
        this.know = job.knowFriend
        this.forever = job.forever
        this.winCond = job.winCond
    }

    get isUsedAbility() {
        return this.target !== null
    }

    get isVote() {
        return this.vote !== null
    }

    add(attr, player) {
        this.temporary.push(attr)
        this.limit[attr] = this.date.day

        if (this.has("standoff") && attr == "bitten" && player) {
            player.status.add("stand")
        }
        if (this.has("standoff") && attr == "maxVoted") {
            let s = this.player.randomSelectTarget()
            s.status.add("stand")
        }
    }

    except(attr) {
        if (this.temporary.includes(attr)) {
            this.temprary = this.temporary.filter((a) => a != attr)
            delete this.limit[attr]
        }
    }

    can(ability) {
        return this.ability.includes(ability)
    }

    canTalk(type) {
        return this.talk.includes(type)
    }

    canWatch(type) {
        return this.talk.includes(type) || this.watch.includes(type)
    }

    canKnow(job) {
        return this.know.includes(job) || this.watch.includes(job) || this.talk.includes(job)
    }

    has(attr) {
        return this.forever.includes(attr) || this.temporary.includes(attr)
    }

    hasnot(attr) {
        return !this.has(attr)
    }

    winCondhas(attr) {
        return this.winCond.includes(attr)
    }

    get hasAliveDecoy() {
        return this.player.manager.select((p) => p.status.name == "slave").length > 0
    }

    get isDead() {
        return !this.isAlive
    }

    update() {
        let newTemporary = []
        for (let attr of this.temporary) {
            if (!this.limit[attr]) continue
            if (this.limit[attr] >= this.date.day) {
                newTemporary.push(attr)
            } else {
                delete this.limit[attr]
            }
        }
        this.temporary = newTemporary
    }
}

class Player {
    constructor(data, manager) {
        this.no = data.no === undefined ? 997 : data.no
        this.userid = data.userid || "null"

        this.cn = data.cn || "kari"
        this.color = data.color || "red"
        this.isGM = data.isGM || false
        this.isKariGM = data.isKariGM || false
        this.isDamy = data.isDamy || false
        this.isNPC = data.isNPC || false
        this.waitCall = false
        this.trip = ""

        this.manager = manager
        this.log = manager.log
        this.date = manager.date

        this.status = new Status(this)
        this.socket = new PlayerSocket(data.socket)

        this.getTrip()
    }

    async getTrip() {
        if (this.isBot) return false
        let user = await User.findOne({ userid: this.userid }).exec()
        this.trip = user.trip
    }

    get isAlive() {
        return this.status.isAlive
    }

    get isDead() {
        return !this.status.isAlive
    }

    get hasPermittionOfGMCommand() {
        return (this.isGM || this.isKariGM) && this.date.is("prologue")
    }

    get isNull() {
        return this.no == 997
    }

    get isBot() {
        return this.isDamy || this.isNPC || this.isNull
    }

    get isUsedAbility() {
        return this.status.isUsedAbility
    }

    get isVote() {
        return this.status.isVote
    }

    has(attr) {
        return this.status.has(attr)
    }

    hasnot(attr) {
        return this.status.hasnot(attr)
    }

    winCondhas(attr) {
        return this.status.winCondhas(attr)
    }

    except(attr) {
        this.status.except(attr)
    }

    can(ability) {
        return this.status.can(ability)
    }

    update(cn, color) {
        this.cn = cn
        this.color = color
    }

    forClientSummary() {
        return {
            type: "summary",
            no: this.no,
            cn: this.cn,
            color: this.color,
            isAlive: this.isAlive,
            waitCall: this.waitCall,
        }
    }

    forClientDetail() {
        return {
            type: "detail",
            no: this.no,
            userid: this.userid,
            trip: this.trip,
            cn: this.cn,
            color: this.color,
            status: this.status.forClient(),
            isGM: this.isGM,
            isKariGM: this.isKariGM,
            isAlive: this.isAlive,
            vote: this.status.vote,
            ability: this.status.target,
            waitCall: this.waitCall,
        }
    }

    vote(target) {
        if (this.status.vote == target.no) return false
        this.status.vote = target.no
        this.log.add("vote", {
            no: this.no,
            player: this.cn,
            target: target.cn,
        })
        this.socket.emit("voteSuccess")
    }

    setTarget(target) {
        this.status.target = target.no
    }

    kill(reason) {
        this.status.isAlive = false
        this.log.add("death", {
            reason: reason,
            player: this.cn,
            no: this.no,
        })
    }

    revive() {
        this.status.isAlive = true
        this.log.add("comeback", {
            player: this,
        })
    }

    isVote() {
        return this.status.isVote
    }

    reset() {
        this.status.vote = null
        this.status.target = null
    }

    useAbility(type, target, isAuto) {
        isAuto = isAuto || false
        this.setTarget(target)
        this.log.add(type, { player: this, target: target, isAuto: isAuto })
        this.socket.emit("useAbilitySuccess")

        if (type == "bite") {
            this.status.add("biter")
        }
    }

    noticeDamy(damy) {
        this.log.add("reiko", {
            no: this.no,
            job: damy.status.nameja,
        })
    }

    nightTalkType() {
        if (this.status.canTalk("wolf")) return "wolf"
        if (this.status.canTalk("fox")) return "fox"
        if (this.status.canTalk("share")) return "share"
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
                return (
                    (date.canDiscuss() && this.isAlive && !this.isGM) ||
                    date.is("epilogue") ||
                    date.is("prologue")
                )

            case "tweet":
                return date.canTweet() && this.isAlive

            case "share":
                return date.canNightTalk() && this.status.canTalk("share") && this.isAlive

            case "fox":
                return date.canNightTalk() && this.status.canTalk("fox") && this.isAlive

            case "wolf":
                return date.canWolfTalk() && this.status.canTalk("wolf") && this.isAlive

            case "grave":
                return this.isDead || this.isGM

            case "gmMessage":
                return this.isGM
        }
        return false
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

        if (!this.status.can(data.type)) return false

        switch (data.type) {
            case "fortune":
                if (this.isUsedAbility) return false
                break

            case "guard":
                break

            case "bite":
                if (target.has("notBitten")) return false
                break

            case "revive":
                if (target.isAlive) return false
                if (this.date.day < 3) return false
                break
        }
        return true
    }

    startRollcall() {
        this.waitCall = true
    }

    call() {
        this.waitCall = false
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
            player.status.vote = null
        }
    }

    startRollcall() {
        for (let player of this) {
            if (player.isBot) continue
            player.startRollcall()
        }
    }

    get num() {
        return this.list.length
    }

    numBySpecies() {
        var human = this.select((p) => p.status.species == "human").length
        var wolf = this.select((p) => p.status.species == "wolf").length
        var fox = this.select((p) => p.status.species == "fox").length

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

    select(func) {
        return this.alive().filter((p) => func(p))
    }

    has(attr) {
        return this.alive().filter((p) => p.has(attr))
    }

    selectAll(func) {
        return this.list.filter((p) => func(p))
    }

    compileVote() {
        var votes = {}
        var table = `<table class="votesummary"><tbody>`

        for (var player of this.alive()) {
            var target = this.pick(player.status.vote)
            var get = this.alive().filter((p) => p.status.vote == player.no).length
            votes[player.no] = get

            table += `<tr class="eachVote"><td>${player.cn}</td><td>(${get})</td><td>→</td><td>${target.cn}</td></tr>`
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
        var wolf = this.select((p) => p.status.species == "wolf")
            .map((p) => p.cn)
            .join("、")
        var share = this.select((p) => p.status.name == "share")
            .map((p) => p.cn)
            .join("、")
        var fox = this.select((p) => p.status.species == "fox")
            .map((p) => p.cn)
            .join("、")
        var noble = this.select((p) => p.status.name == "noble")
            .map((p) => p.cn)
            .join("、")

        let texts = {
            wolf: "<br>【能力発動】人狼は" + wolf,
            share: "<br>【能力発動】共有者は" + share,
            fox: "<br>【能力発動】妖狐は" + fox,
            noble: "<br>【能力発動】貴族は" + noble,
        }

        for (var player of this) {
            for (let job in texts) {
                if (player.status.canKnow(job)) {
                    player.status.knowText += texts[job]
                }
            }
        }
    }

    updateStatus() {
        for (let player of this) {
            player.status.update()
        }
    }

    isDeadAllFox() {
        return this.select((p) => p.status.species == "fox").length == 0
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
            return false
        }
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
        gm.status.set(Cast.job("GM"))
        this.refreshList()
    }

    isCompleteVote() {
        return this.alive().every((p) => p.isVote())
    }

    savoVote() {
        return this.alive().filter((p) => !p.isVote())
    }

    savoAbility(ability) {
        return this.alive().filter((p) => !p.isUsedAbility && p.status.can(ability))
    }

    makeTargets(type) {
        type = type || "alive"
        var targets = {}
        if (type == "alive") {
            for (var player of this.alive()) {
                targets[player.no] = player.cn
            }
        } else {
            for (var player of this.dead()) {
                targets[player.no] = player.cn
            }
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

            if (player.status.canWatch("share")) {
                socket.join("share")
            }

            if (player.status.canWatch("wolf")) {
                socket.join("wolf")
            }

            if (player.status.canWatch("fox")) {
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

    startRollcall() {
        this.players.startRollcall()
        this.emitPlayer()
        this.log.add("system", {
            message: "点呼が開始されました。参加者は発言してください。",
        })
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

        if (player.waitCall) {
            player.call()
            this.emitPlayer()
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
            case "bite":
                for (var biter of this.players.has("biter")) {
                    biter.except("biter")
                }

                this.io.to("wolf").emit("useAbilitySuccess")
                break
        }

        player.useAbility(data.type, target)
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

            player.status.set(job)
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
        if (!this.canStart()) return false

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

        this.log.add("voteSummary", {
            message:
                `<img src='../images/voteResult.png'/>${this.date.day}日目 投票結果` +
                voteResult.table,
        })

        if (voteResult.exec) {
            voteResult.exec.status.add("maxVoted")
        }

        return voteResult.exec
    }

    exection() {
        for (let player of this.players.has("maxVoted")) {
            player.kill("exec")
        }
    }

    killStandoff() {
        for (let player of this.players.has("stand")) {
            player.kill("standoff")
        }
    }

    useFirstNightAbility() {
        var damy = this.players.damy()
        damy.status.add("bitten")
        this.log.add("bite", { player: { cn: "狼", no: 998 }, target: damy })

        for (var reiko of this.players.has("knowdamy")) {
            reiko.noticeDamy(damy)
        }
    }

    autoUseAbility() {
        /*自動噛み処理*/

        let biter = this.players.has("biter")
        if (!biter.length && this.date.day >= 2) {
            var autobiter = this.players.select((p) => p.status.can("bite")).lot()
            var target = this.players.select((p) => !p.status.can("bite")).lot()

            autobiter.useAbility("bite", target, true)
        }

        /*自動占い*/
        for (var player of this.players.savoAbility("fortune")) {
            player.randomUseAbility("fortune")
        }

        /*自動護衛*/
        if (this.date.day < 2) return false

        for (var player of this.players.savoAbility("guard")) {
            player.randomUseAbility("guard")
        }
    }

    guard() {
        if (this.date.day >= 2) {
            for (var player of this.players.select((p) => p.status.can("guard"))) {
                var target = this.players.pick(player.status.target)
                target.status.add("guarded")
            }
        }
    }

    revive() {
        for (let player of this.players.select((p) => p.status.can("revive"))) {
            if (!player.isUsedAbility) continue

            let target = this.players.pick(player.status.target)
            let threshold = target.isDamy ? 50 : 30
            if (Math.floor(Math.random() * 100) < threshold) {
                target.status.add("revive")
            }
        }

        for (let player of this.players.has("revive")) {
            player.revive()
        }
    }

    attack() {
        for (let player of this.players.has("biter")) {
            let target = this.players.pick(player.status.target)
            target.status.add("bitten", player)
        }

        for (let player of this.players.has("bitten")) {
            if (player.has("guarded") || player.has("resistBite")) continue

            if (player.has("useDecoy") && player.status.hasAliveDecoy) {
                for (let decoy of this.players.select((p) => p.status.name == "slave")) {
                    decoy.status.add("stand")
                }
                continue
            }

            player.status.add("eaten")
        }

        for (var fortune of this.players.select((p) => p.can("fortune"))) {
            var target = this.players.pick(fortune.status.target)
            target.status.add("fortuned")
        }

        for (var fortuned of this.players.has("fortuned")) {
            if (fortuned.has("melt")) {
                fortuned.status.add("eaten")
            }
        }

        for (var eaten of this.players.has("eaten")) {
            eaten.kill("bite")
        }
    }

    killStand() {
        for (var stand of this.players.has("stand")) {
            stand.kill("bite")
        }
    }

    fellow() {
        if (this.players.isDeadAllFox()) {
            for (var imo of this.players.has("fellowFox")) {
                imo.kill("fellow")
            }
        }
    }

    nightReset() {
        this.players.reset()
        this.room.assign()

        this.leftVoteNum = 4
    }

    updateStatus() {
        this.players.updateStatus()
    }

    useNightAbility() {
        if (this.date.day < 2) return false

        let exec = this.players.selectAll((p) => p.has("executed"))[0]
        if (!exec) return false

        for (var player of this.players.select((p) => p.status.can("necro"))) {
            player.useAbility("necro", exec)
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
                let isExec = this.compileVote()
                if (!isExec) {
                    this.changePhase("revote")
                    return false
                }

                this.exection()
                this.killStandoff()
                this.fellow()

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
                this.attack()
                this.killStand()
                this.revive()
                this.fellow()

                if (this.endCheck()) return false

                this.room.assign()
                this.date.sunrise()
                this.pass("day")

                this.updateStatus()

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
            if (player.winCondhas("winCamp") && player.status.camp != this.win) {
                isWin = false
            }
            if (player.winCondhas("alive") && player.isDead) {
                isWin = false
            }
            if (
                player.winCondhas("killNoble") &&
                this.players.select((p) => p.status.name == "noble").length
            ) {
                isWin = false
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

        var rd = this.io.of(/^\/room-\d+$/).on("connect", async function (socket) {
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
