const moment = require("moment")

class Players{
	constructor(){
		this.players = {}
		this.list = []
	}

	add(id, socket, data){
		this.players[id] = {
			id: id,
			socket: socket,
			name: data.name,
			color: data.color,
			isonline : true,
			isgm: false,
			job : "villager",
			vote: null,
			votenum: 0
		}
		this.list = Object.values(this.players)
	}

	leave(id){
		delete this.players[id]
		this.list = Object.values(this.players)
	}

	pick(id){
		return this.players[id]
	}

	in(id){
		return id in this.players
	}

	lot(){
		return this.list.lot()
	}

	lotWolf(num){
		this.list.filter((p) => p.job != "preparer").lot().job = "wolf"
	}

	maxers(){
		var votes = this.list.map((p) => p.votenum)
		var max = Math.max(...votes)
		return this.list.filter((p) => p.votenum == max)
	}

	forSend(){
		var send = {}
		for(var player of this){
			send[player.id]={
				id : player.id,
				name: player.name,
				color: player.color,
				vote: player.vote,
				votenum: player.votenum
			}
		}
		return send
	}

	reset(){
		for(var player of this){
			player.job = "villager"
			player.vote = null
			player.votenum = null
		}
	}

	num(){
		return this.list.length
	}

    *[Symbol.iterator]() {
        yield* this.list;
    }

}

class Game{
	constructor(io){
		this.io = io
		this.players = new Players()
		this.phases = {
			"idle":{
				phase: "idle",
				phaseinfo: "ゲーム開始までお待ち下さい",
				sec: null
			},
			"set":{
				phase: "set",
				phaseinfo: "ワード設定中",
				sec: 120
			},
			"discuss":{
				phase: "discuss",
				phaseinfo: "議論中",
				sec: 120
			},
			"inversion":{
				phase: "inversion",
				phaseinfo: "狼は村のワードを当ててください",
				sec: 90
			}
		}
		this.phase = "idle"
		this.wword = null
		this.vword = null
		this.log = []
		this.limit = null
		this.limitFlg = null

		console.log("open!")
		this.listen()
	}

	systemMessage(mes){
		let d = {
			name : "system",
			message : mes.trim()	
		}

		this.log.push(d)
		this.io.emit("systemMessage", {message: mes})		
	}

	message(plr,mes){
		let d = {
			name : plr.name,
			color : plr.color,
			message : mes.trim()	
		}

		this.log.push(d)
		this.io.emit('talk', d);
	}

	emitPlayers(){
		this.io.emit("player", this.players.forSend())
	}

	changePhase(phase, data){
		clearTimeout(this.limitFlg)
		switch(phase){

			case "set":
				var preparer = this.players.lot()
				preparer.job = "preparer"
				preparer.socket.emit("appoPreparer", {message: "あなたは出題者です。ワードを設定してください"})
				this.systemMessage("ゲーム開始 出題者は" + preparer.name + "さんです")

				this.limitFlg = setTimeout(()=>{
					this.changePhase("cancel")
				}, this.phases.set.sec * 1000)
				break

			case "discuss":

				this.players.lotWolf(num)
				
				this.systemMessage("議論開始")

				for(var player of this.players){
					var word
					switch(player.job){
						case "villager":
							word = `お題:${vword}`
							break
						case "wolf":
							word = `お題:${wword}`
							break
						case "preparer":
							word = `出題者も一緒に推理してください。(村:${vword}、狼:${wword})`
							break
					}
					player.socket.emit("yourWord", {message: word})
				}
				setTimeout(()=>{
					this.changePhase("exec")
				}, this.phases.discuss.sec * 1000)
				break

			case "exec":
				var maxers = this.players.maxers()
				if(maxers.length == 1){
					var exec = players[maxers[0]]

					if(exec.job == "wolf"){
						this.changePhase("inversion")					
					} else {
						this.systemMessage(exec.name + "さんは村人でした。人狼の勝利です。")	
						this.changePhase("idle")		
						return false
					}
				} else {
					this.systemMessage("最多票が複数のため、人狼の勝利です。")
					this.changePhase("idle")
					return false
				}

				break

			case "inversion":
				this.systemMessage("狼が追放されました。村ワードを当ててください。")
				setTimeout(()=>{
					this.systemMessage("時間切れ、村の勝利です。")
					this.changePhase("idle")
				},this.phases.inversion.sec * 1000)
				break

			case "judge":
				if(data.judge == "correct"){
					this.systemMessage("人狼の勝利です。")
				} else {
					this.systemMessage("村人の勝利です。")
				}
				this.changePhase("idle")
				return false
				break

			case "idle":
				this.systemMessage(`村ワードは${this.vword}、狼ワードは${this.wword}でした。`)
				this.players.reset()

				break

			case "cancel":
				phase = "idle"
				this.systemMessage("キャンセルされました")
				this.players.reset()
				break
		}
		this.phase = p
		this.io.emit("changePhase", this.phases[phase])

		if(game.phases[phase].sec){
			this.limit = moment().add(game.phases[phase].sec, "seconds").format()
		} else{
			this.limit = null
		}
	}

	listen(){

		this.io.on("connection", (socket) =>{

			var session = socket.request.session
			var id = session.userid

			var idata = {
				log: this.log,
				players: this.players.forSend(),
				phase: this.phases[this.phase]
			}

			if(this.limit){
				idata.phase.sec = moment(limit).diff(moment(), "seconds")
			}

			socket.emit("initialData", idata)

			if(this.players.in(id)){

				socket.join("chatroom");
				socket.emit("loginSuccess")

				var player = this.players.pick(id)
				player.isonline = true
				player.socket = socket

				this.emitPlayers()

			}


			socket.on('disconnect', (data) => {
				if(this.players.in(id)){
					player.isonline = false		
					this.emitPlayers()					
				}
				
			});

			socket.on("login", (data) => {

				if(this.players.in(id)) return false
			
				socket.join("chatroom");
				socket.emit("loginSuccess")

				this.players.add(id,socket,data)


				this.systemMessage(data.name + "さんが入室しました。")
				this.emitPlayers()

				var player = this.players.pick(id)
				if(this.players.num() == 1){
					socket.emit("appoGM")
					player.isgm = true
				}
			})

			socket.on("logout",(data) => {

				socket.leave("chatroom");
				socket.emit("logoutSuccess");

				this.systemMessage(player.name + "さんが退出しました。")
				this.players.leave(id)
				this.emitPlayers()
			});

			socket.on('talk', (data) => {
				if(this.players.in(id)){
					player = this.players.pick(id)
					this.message(player, data.message)				
				}
			});

			socket.on("start", (data) => {
				if(this.phase != "idle") return false
				if(this.players.num() >= 4){
					this.systemMessage("ゲームの開始には最低4人必要です。")
					return false
				}

				this.changePhase("set")
			})

			socket.on("setword",(data) => {
				if(this.phase != "set") return false

				this.vword = data.vword
				this.wword = data.wword

				changePhase("discuss")	
			})

			socket.on("judge", (data) => {
				if(this.phase != "inversion") return false
				changePhase("judge", data)
			})

			socket.on("vote", (data) => {
				if(this.phase != "discuss") return false
				if(!this.players.in(id)) return false

				var player = this.players.pick(id)
				var vote = this.players.pick(data.id)

				if(vote.job == "preparer" || player.job == "preparer") return false

				player.vote = data.id
				this.players.compileVote()
				emitPlayers()
			})
		})	
	}
}

module.exports = Game