var socket
var players
var phase,targets,deathTargets, day=0
var sec,nsec, timerflg
var isVote = true, isUseAbility = true
var size = "normal"


$(function(){
    socket = io("/room-" + vno);

    $("#enter").click(function(){
        //入室申請
        var data = {
            cn: $("#name").val(),
            color: $("#color").val()
        }
        if(data.cn.length > 8 || data.cn.length == 0){
            alert("名前は8文字以内にしてください")
            return false
        }
        socket.emit("enter",data);
        return false;
    });

    $(".exit").click(function(){
        socket.emit("leave","");
        return false;
    });

    $('#chat').click(function(){
        sendMessage()
        return false;
    });

    $('#vote').click(function(){
        var v = $("#voteTarget").val()
        if(v=="▼選択") return false
            
        socket.emit("vote", {
            target: v
        })
        return false;
    });

    $('#ability').click(function(){
        var v = $("#abilityTarget").val()
        if(v=="▼選択") return false

        socket.emit("ability", {
            type: $(this).data("type"),
            target: v
        })
        return false;
    });

    $('#gameStart').click(function(){
        socket.emit("start")
        return false;
    });

    $('#summonNPC').click(function(){
        socket.emit("summonNPC")
        return false;
    });

    $('#checkCast').click(function(){
        socket.emit("checkCast")
        return false;
    });

    $("#kick").click(function(){
        var target = $("#gmTarget").val()
        if(target === null) return false

        socket.emit("kick",{target: target})
    })

    $("#fix-player").click(function(){
        socket.emit("fix-player",{
            cn: $("#fix-cn").val(),
            color:   $("#fix-color").val(),
        })
    })

    $("#fix-gm").click(function(){
        socket.emit("fix-gm",{
            name: $("#fix-name").val(),
            pr:   $("#fix-pr").val(),
            casttype: $("#fix-casttype").val(),
            capacity: $("#fix-capacity").val()-0,
            time:{
                day: $("#fix-time-day").val()-0,
                vote: $("#fix-time-vote").val()-0,
                night: $("#fix-time-night").val()-0,
                ability: $("#fix-time-ability").val()-0,
                nsec: $("#fix-time-nsec").val()-0
            },
            isShowJobDead: $("#fix-isShowJobDead").val() == 1
        })
        $("#vinfo").hide()
    })

    $(".handle").click(function(){
        console.log($(this).closest("div"))
        $(this).parent().find(".detail").toggle()
    })

    $(".size").click(function(){
    	var s = $(this).data("size")
    	$(".size").removeClass("selected")
    	if(size == s){
    		size = "normal"

    	} else {
    		size = s
    		$(this).addClass("selected")
    	}
    })

    $("#fixVillageInfo").click(()=>{
        $("#vinfo").toggle()
    })

    $("#discuss").on("click",".quote",function(e){
        console.log(this)
        var day = $(this).data("day")
        var resno = $(this).data("resno")
        var res = `>>${day}-${resno}`
        $("#message").val($("#message").val()+res)
    })

    $("#memoDiscussTable").on("click",".quote",function(e){
        console.log(this)
        var day = $(this).data("day")
        var resno = $(this).data("resno")
        var res = `>>${day}-${resno}`
        $("#message").val($("#message").val()+res)
    })



    $(window).keydown(function(e){
        if(e.ctrlKey && e.keyCode == 13){
            sendMessage()
            return false;
        }
    });

    // メッセージを受信する
    socket.on('talk', function(data){
        appendTalk(data);
    });

    socket.on("you", function(data){
        setMe(data)
    })

    socket.on("player", function(data){
        refreshPlayers(data)
    });

    socket.on("initialLog", function(data){
        $("#discuss").empty()
        $("#memoDiscussTable").empty()
        appendTalks(data)
    });

    socket.on("enterSuccess", function(data){
        $("#talk").removeClass("hide")
        setMe(data)
        refresh()
    })

    socket.on("leaveSuccess", function(no){
        $("#command > div").hide()
        $("#command-login").show()
        $("#talk").removeClass("hide")
    })

    socket.on("voteSuccess", function(no){
        isVote = true
        $("#command-vote .alert").addClass("hide")
        $("#menu-sp-discuss").removeClass("alert") 
    })

    socket.on("useAbilitySuccess", function(no){
        isUseAbility = true
        $("#command-ability .alert").addClass("hide")
        $("#menu-sp-discuss").removeClass("alert") 
    })


    socket.on("changePhase", function(data){
        changePhase(data)
    })


    socket.on("disconnect", function(data){
        $("#command > div").hide()
        /*$("#command-login").show()*/
        $("#talk").addClass("hide")
        $("#command-reload").show()

    });

    socket.on("refresh",function(){
        location.reload()
    })

    $("#command-login").show()

})
function setMe(data){
    me = data
    if(me.job){
        var know = me.job.know ? "<br>"+me.job.know : ""
        var jobtxt = `あなたは【${me.job.nameja}】です。<br>${me.job.desc}${know}`
        $("#job").show().html(jobtxt)
    } else {
        $("#job").hide()
    }   
}

function changePhase(data){

    phase = data.phase
    targets = data.targets
    deathTargets = data.deathTargets

    if(data.day > day){
        for(var d = day+1; d<=data.day; d++){
            $("<li></li>").html(d+"日目")
                          .data("day", d)
                          .appendTo("#memoDiscussDay")
        }
        day = data.day        
    }


    vinfo = data.villageInfo
    if(vinfo){
        $("#title").html(vinfo.name)
        $("#pr").html(vinfo.pr)
        $("title").html(vinfo.name+" - 焼肉鯖")

        for(var key in vinfo){
            if(key == "time"){
                for(var key2 in vinfo.time){
                    $(`#fix-time-${key2}`).val(vinfo.time[key2])
                }
            } else {
                $(`#fix-${key}`).val(vinfo[key])
            }
        }
    }

    $("body").removeClass().addClass(data.phase)

    sec = data.left
    nsec = data.nsec || 0

    clearInterval(timerflg)
    if(sec){
        var nsectxt = ""
        if(data.nsec){
            nsectxt = `<span id="n-second">${nsec}</span>`
        }
        $("#timer").html(` あと<span id="second">${sec}</span>秒${nsectxt}`)
        timerflg = setInterval(function(){
            sec--
            $("#second").html(sec)

            if(--nsec <= 0){
                $("#n-second").remove()
            } else {
                $("#n-second").html(nsec)
            }
        },1000)
    } else {
        $("#timer").html("")
    }


    if(phase == "day"){
        $("#discuss tr").not(".votedetail")
                          .not(`.day${day}-day`)
                          .not(`.day${day-1}-ability`)
                          .remove()
    }

    if(phase == "night"){
        $("#discuss tr").not(".votedetail")
                          .not(`.day${day}-night`)
                          .not(`.day${day}-vote`)
                          .remove()
    }

    refresh()
}

function refresh(){
    $("#command > div").hide()
    if(me.isWatch){
        if(phase == "prologue"){
            $("#command-login").show()
        }
    } else {
        var commands
        if(me.isGM || me.isKariGM && phase == "prologue"){
             $("#command-gm").show()
        }
        if(phase == "prologue"){
            if(!me.isGM){
                $("#command-logout").show()
            }
            commands = [["discuss", "発言"]] 

        } else if(phase == "epilogue") {
            commands = [["discuss", "発言"]] 

        } else if(!me.isGM && me.isAlive){
            commands = [["tweet", "独り言"]]
            switch(phase){
                case "day":
                case "vote":

			        isVote = me.vote !== null

                    $("#command-vote").show()
                    updateVoteTarget(targets)

                    if(phase == "day"){
                        commands.unshift(["discuss", "発言"])   
                        $("#command-vote .alert").addClass("hide")   
                        $("#menu-sp-discuss").removeClass("alert")        
                    } else {
			        	$("#command-vote .alert").toggleClass("hide", isVote)
                        $("#menu-sp-discuss").toggleClass("alert",!isVote)                  	
                    }

                    break

                case "night":
                case "ability":

                	isUseAbility = me.ability.isUsed

                    if(me.job.canFortune 
                    || (me.job.canGuard  && day >= 2)
                    || (me.job.canBite && day >= 2)
                    || (me.job.canRevive && day >= 3)){
                        $("#command-ability").show()
                        $("#command-ability").addClass("personal")

                        updateAbilityTarget(targets)

                        if(me.job.canGuard){
                            $("#ability").data("type", "guard").val("護衛")
                        } else if(me.job.canFortune){
                            $("#ability").data("type", "fortune").val("占う")
                        } else if(me.job.canBite){
                            $("#ability").data("type", "bite").val("襲撃")
                            $("#command-ability").addClass("wolf")
                        } else if(me.job.canRevive){
                            $("#ability").data("type", "revive").val("蘇生")
                            updateAbilityTarget(deathTargets)
                        }       
                    }
                    if(me.job.canShareTalk){
                        commands.unshift(["share", "会話"])                    
                    }
                    if(me.job.canFoxTalk){
                        commands.unshift(["fox", "会話"])                    
                    }

                    if(phase == "night"){
                        if(me.job.canWolfTalk){
                            commands.unshift(["wolf", "会話"])                    
                        }
    			    	$("#command-ability .alert").addClass("hide")
                        $("#menu-sp-discuss").removeClass("alert") 
                    } else {
    			    	$("#command-ability .alert").toggleClass("hide", isUseAbility) 
                        $("#menu-sp-discuss").toggleClass("alert", !isUseAbility)                    	
                    }


                    break
            }  
        } else if(!me.isGM && !me.isAlive) {
            commands = [["grave", "霊話"]]
        } else {
            commands = [["grave", "霊話"],["gmMessage", "全体へ発言"]]
        }

        updateCommand(commands)
    }
}

function updateAbilityTarget(targets){
    var select = $("#abilityTarget")
    var v = select.val()
    select.empty()
    $("<option></option").html("▼選択")
                         .val("")
                         .appendTo(select)   
    for(var key in targets){
        if(me.no == key) continue
        $("<option></option").html(targets[key])
                             .val(key)
                             .appendTo(select)
    }
    select.val(v)
}

function updateVoteTarget(targets){
    var select = $("#voteTarget")
    var v = select.val()
    select.empty()
    $("<option></option").html("▼選択")
                         .val("")
                         .appendTo(select)   
    for(var key in targets){
        if(me.no == key) continue
        $("<option></option").html(targets[key])
                             .val(key)
                             .appendTo(select)
    }
    select.val(v)
}

function updateCommand(commands){
    var select = $("#talkType")
    select.empty() 
    for(var command of commands){
        $("<option></option").html(command[1])
                             .val(command[0])
                             .appendTo(select)
    }
    select.val(commands[0][0])
}

function refreshPlayers(data){

    players = data

    var ul = $("#playerlist")
    var memoul = $("#memoDiscussPlayer")

    ul.empty()
    memoul.empty()
    var a = 0, d = 0
    for(let player of data){

        if(player.no>990) continue
 
        var alive = player.isAlive ? "alive" : "dead"
        var li = $("<li></li>")
        li.html(`<span class="${player.color}">◆</span>${player.cn}`)
          .data("no", player.no)
          .addClass(alive)

        li.clone(true).appendTo(memoul)

        var job = player.job ? `[${player.job.nameja}]` : ""
        var userid = player.userid ? `<br>${player.userid}`: ""
        var trip = player.trip ? " "+player.trip : ""
        li.html(li.html()+job+userid+trip)
        li.appendTo(ul)

        player.isAlive ? a++ : d++
    }
    var join = "参加者:"+(a+d)
    var dora =` 生存:${a} 死亡${d}`
    $("#playernum").html(join + dora)

    $("<li></li>").html("全員表示")
                  .data("no","all")
                  .appendTo(memoul)



    if(me.isGM || me.isKariGM){
        var select = $("#gmTarget")
        select.empty()
        $("<option></option>").html("▼選択")
                              .appendTo(select)

        for(let no in data){
            if(no>=990 || no==0) continue
            var player = data[no]
            $("<option></option>").html(player.cn)
                                  .val(player.no)
                                  .appendTo(select)
        }
    }
}

function sendMessage(){
    var data = {
        no: me.no,
        message: $("#message").val().trim(),
        type: $("#talkType").val(),
        size: size
    }
    if(data.message == "") return false
    socket.emit('talk', data);
    $('#message').val('');
    $(".size").removeClass("selected")
    size = "normal"
}

function appendTalk(data){
    var tab = $("#discuss")
    var memo = $("#memoDiscussTable")

    var d = "day"+data.day
    var phase = "day"+data.day+"-"+data.phase

    var tr = $("<tr></tr>").addClass(d).addClass(phase).addClass(data.type)

    if(["system","wolf-system", "progress", "vote", "personal", "info"].includes(data.type) ){
        tr.append(`<td colspan="2">${data.message.replace(/\n/g,"<br>")}</td>`)
    } else {
        if(data.type == "wolfNeigh" && ((me.job && me.job.canWolfTalk) || me.isGM)) return false

        $("<td></td>").addClass("name")
                           .html(`<span class="${data.color}">◆</span>${data.cn}`)
                           .appendTo(tr)
        var td = $("<td></td>").addClass("talk")
                           .addClass(data.size)
                           .html(data.message.replace(/\n/g,"<br>"))
        if(data.type == "discuss"){
            $("<div></div>").addClass("quote")
                            .data("day",data.day)
                            .data("resno",data.resno)
                            .appendTo(td)
        }
        td.appendTo(tr)

        if(data.no){
            tr.addClass("player-"+data.no)
        }
 
    }
    
    tr.clone(true).prependTo(tab)

    if(["progress","discuss"].includes(data.type)){
        tr.prependTo(memo)        
    }
        
 
}

function appendTalks(data){
    for(let t of data){
        appendTalk(t)
    }

    if(phase == "day" || phase == "vote"){
        $("#discuss tr").not(".votedetail")
                          .not(`.day${day}-vote`)
                          .not(`.day${day}-day`)
                          .not(`.day${day-1}-ability`)
                          .remove()
    }

    if(phase == "night" || phase == "ability"){
        $("#discuss tr").not(".votedetail")
                        .not(`.day${day}-ability`)
                          .not(`.day${day}-night`)
                          .not(`.day${day}-vote`)
                          .remove()
    }
}