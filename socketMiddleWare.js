const moment = require("moment")

var smw = function(io){
	this.io = io
	this.players = {}
	this.game = {
		phase: "idle",
		flg:null,
		phases:{
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
		},
		words: {
			villager: "",
			wolf: "",
			preparer: ""
		}
	}
	this.log = []
	this.limit = null
}

smw.prototype.listen = function(){
	var io = this.io
	var players = this.players
	var game = this.game
	var log = this.log
	var limit = this.limit

	io.on("connection", function(socket){

		var session = socket.request.session
		var id = session.userid
		var player = id in players ? players[id] : null
		var socketid = socket.id



		function systemMessage(mes){
			let d = {
				name : "system",
				date : moment().format("YYYY-MM-DD hh:mm:ss"),
				color : null,
				message : mes.trim()	
			}

			log.push(d)

			io.emit("system message", {message: mes})
		}

		function message(plr,mes){
			let d = {
				name : plr.name,
				date : moment().format("YYYY-MM-DD hh:mm:ss"),
				color : plr.color,
				message : mes.trim()	
			}

			log.push(d)

			io.emit('chat message', d);
		}

		function emitPlayers(){
			io.emit("player list", players)
		}

		function changePhase(p, mes){
			game.phase = p
			io.emit("change phase", game.phases[p])
			systemMessage(mes)

			if(game.phases[p].sec){
				limit = moment().add(game.phases[p].sec, "seconds").format()
			} else{
				limit = null
			}
			console.log("limit: "+limit)
		}

		function reset(){
			clearTimeout(game.flg)
			systemMessage(`村ワードは${game.words.villager}、狼ワードは${game.words.wolf}でした。`)
			for(var k in players){
				players[k].job = "villager"
				players[k].vote = null
				players[k].votenum = 0
			}
		}

		Array.prototype.lot = function(){
			return this[Math.floor(Math.random()*this.length)]
		}

		Array.prototype.remove = function(target){
			if(this.includes(target)){
				let i = this.indexOf(target)
				return [...this.slice(0,i), ...this.slice(i+1)]
			} else {
				return this
			}
		}
				
		console.log('player connect');


		if(id in players){

			console.log("come back: " + id)

			socket.join("chatroom");
			socket.emit("login success")
			player.isonline = true
			player.socketid = socketid

			emitPlayers()

			//systemMessage(player.name + "さんが復帰しました。")
		}

		var idata = {
			log: log,
			players: players,
			phase: game.phases[game.phase]
		}

		if(limit){
			idata.phase.sec = moment(limit).diff(moment(), "seconds")
			console.log(moment().format(), limit)			
		}

		socket.emit("initial data", idata)

		socket.on('disconnect', function(data){
			if(id in players){
				console.log('player disconnected: '+ id);
				if(id in players){
					//systemMessage(player.name + "さんが切断しました。")	
					player.isonline = false						
				}
	

				emitPlayers()					
			}
		});

		socket.on("login", function(data){
		
			console.log("login: "+id)

			socket.join("chatroom");
			socket.emit("login success")

			players[id] = {
				id: id,
				socketid: socketid,
				name: data.name,
				color: data.color,
				isonline : true,
				isgm: false,
				job : "villager",
				vote: null,
				votenum: 0
			}

			player = players[id]

			systemMessage(data.name + "さんが入室しました。")
			emitPlayers()

			if(Object.keys(players).length == 1){
				socket.emit("appo gm")
				player.isgm = true
			}
		})

		socket.on("logout",function(data){
			console.log("logout")

			socket.leave("chatroom");
			socket.emit("logout success");

			systemMessage(player.name + "さんが退出しました。")
			delete players[id]
			emitPlayers()
		});

		socket.on('chat message', function(data){
			if(id in players){
				message(player, data.message)				
			}
		});

		socket.on("game start", function(data){
			if(game.phase != "idle") return false
			if(Object.keys(players).length >= 4){

				console.log("start!")

				var preparer = players[Object.keys(players).lot()]
				preparer.job = "preparer"


				changePhase("set", "ゲーム開始 出題者は" + preparer.name + "さんです")
				io.to(preparer.socketid).emit("appo preparer", {message: "あなたは出題者です。ワードを設定してください"})

				game.flg = setTimeout(function(){
					changePhase("idle", "キャンセルされました")
				}, 1000 * 60 * 2)
			} else {
				systemMessage("ゲームの開始には最低4人必要です。")
			}
		})

		socket.on("game setword",function(data){
			if(game.phase != "set") return false

			clearTimeout(game.flg)
			game.words = {
				villager: `<strong>${data.vword}</strong>`,
				wolf: `<strong>${data.wword}</strong>`,
				preparer: `<strong>${data.vword}</strong>(村) <strong>${data.wword}</strong>(狼)`
			}

			var wolf = null
			while(!wolf || wolf.job == "preparer"){
				wolf = players[Object.keys(players).lot()]
			}
			wolf.job = "wolf"
			
			changePhase("discuss", "議論開始")

			for(var i in players){
				var player = players[i]
				io.to(player.socketid).emit("teach word", {message: "お題:" + game.words[player.job]})
			}

			game.flg = setTimeout(function(){
				var max = 0
				var maxers = []
				for(var id in players){
					var pl = players[id]
					if(pl.votenum > max){
						max = pl.votenum
						maxers = [id]
					} else if (pl.votenum == max){
						maxers.push(id)
					}
				}
				if(maxers.length == 1){
					var exec = players[maxers[0]]
					if(exec.job == "wolf"){
						changePhase("inversion", "人狼が追放されました。村ワードを当ててください。")	
						clearTimeout(game.flg)
						game.flg = setTimeout(function(){
							changePhase("idle", "狼がワードを当てられなかったため、村人の勝利です。")
							reset()
						}, 1000 * 90)						
					} else {
						changePhase("idle", exec.name + "さんは村人でした。人狼の勝利です。")	
						reset()			
					}
				} else {
					changePhase("idle", "最多票が複数のため、人狼の勝利です。")
					reset()		
				}

			}, 1000 * 60 * 2)	
		})

		socket.on("judge", function(data){
			if(game.phase != "inversion") return false
			clearTimeout(game.flg)
			if(data.judge == "correct"){
				changePhase("idle", "人狼の勝利です。")
			} else {
				changePhase("idle", "村人の勝利です。")
			}
			reset()

		})

		socket.on("vote", function(data){
			if(game.phase != "discuss") return false
			if(!data.id in players) return false
			if(players[data.id].job == "preparer" || player.job == "preparer") return false
			players[id].vote = data.id
			for(let key in players){
				players[key].votenum = Object.keys(players).filter((p) => players[p].vote == key).length
			}
			emitPlayers()
		})
	})	
}

module.exports = smw