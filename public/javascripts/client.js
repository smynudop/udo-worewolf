var socket = io("/wordwolf");

var myinfo = {
    name: null,
    color: null,
    isgm: false
}

var players
var phase

$("#enter").click(function(){
    //入室申請
    var data = {
        name: $("#name").val(),
        color: $("#color").val()
    }
    if(data.name.length > 8 || data.name.length == 0){
        alert("名前は8文字以内にしてください")
        return false
    }
    socket.emit("login",data);
    return false;
});

$(".exit").click(function(){
    socket.emit("logout","");
    return false;
});

$('#chat').click(function(){
    sendMessage()
    return false;
});

$("#game-start").click(function(){
    socket.emit("start", {})
})

$("#game-setword").click(function(){
    var vword = $("#vword").val().trim()
    var wword = $("#wword").val().trim()
    if(vword == "" || wword == ""){
        alert("ワードが空です。")
        return false
    }
    socket.emit("setword",{
        vword: vword,
        wword: wword
    })
})

$("#correct").click(function(){
    socket.emit("judge",{
        judge: "correct"
    })
})

$("#incorrect").click(function(){
    socket.emit("judge",{
        judge: "incorrect"
    })
})


$(window).keydown(function(e){
    if(e.ctrlKey && e.keyCode == 13){
        sendMessage()
        return false;
    }
});

// メッセージを受信する
socket.on('talk', function(data){
    appendChatMessage(data);
    $("#message").val("");
});

socket.on('systemMessage', function(data){
    appendSystemMessage(data);
});

socket.on("player", function(data){
    refreshPlayers(data)
});

socket.on("loginSuccess", function(data){
    $("#command > div").hide()
    $("#command-logout").show()
    $("#talk").removeClass("hide")
});

socket.on("logoutSuccess", function(data){
    $("#command > div").hide()
    $("#command-login").show()
    $("#talk").addClass("hide")
});

socket.on("disconnect", function(data){
    $("#command > div").hide()
    $("#command-login").show()
    $("#talk").addClass("hide")

});

socket.on("appoGM", function(data){
    $("#command > div").hide()
    $("#command-gm").show()
    me.isgm = true
});

socket.on("initialData", function(data){
    refreshPlayers(data.players)
    appendInitialLog(data.log)
    changePhase(data.phase)
})

socket.on("appoPreparer", function(data){
    $("#command > div").hide()
    $("#command-setword").show()
    appendPersonalMessage(data)
})

socket.on("yourWord", function(data){
    appendPersonalMessage(data)
})


var sec, timerflg
socket.on("changePhase", function(data){
    changePhase(data)
})

function changePhase(data){

    phase = data.phese
    $("#phase").html(data.phaseinfo)

    sec = data.sec
    clearInterval(timerflg)
    if(sec){
        $("#timer").html(` あと<span id="second">${sec}</span>秒`)
        timerflg = setInterval(function(){
            sec--
            $("#second").html(sec)
        },1000)
    } else {
        $("#timer").html("")
    }

    $("#command > div").hide()
    if(me.id in players){
        $("#talk").removeClass("hide")
        if(data.phase == "idle"){
            if(players[me.id].isgm){
                $("#command-gm").show() 
            } else {
                $("#command-logout").show()                 
            }
        } else if(data.phase == "set" && players[me.id].job == "preparer"){
            $("#command-setword").show()
        } else if(data.phase == "inversion" && players[me.id].job == "preparer"){
            $("#command-judge").show()
        }
    } else {
        $("#command-login").show()
    }
  
}

function refreshPlayers(data){
    players = data

    $("#playernum").html("入室者:"+Object.keys(data).length+"<br>")
    var ul = $("#playerlist")
    ul.empty()
    for(let key in data){
        var user = data[key];
        var vote = user.vote ? "　　→"+players[user.vote].name : "　"
        var votenum = user.votenum  ? `<span class="votenum">${user.votenum}</span>` :  ""
        $("<li></li>").html(`<span class="${user.color}">◆</span>${user.name}${votenum}<br><span class="vote">${vote}</span>`)
                      .data("id", user.id)
                      .appendTo(ul)
    }
    $("#playerlist li").click(function(){
        socket.emit("vote", {id: $(this).data("id")})
    })
}

function sendMessage(){
    var data = {
        message: $("#message").val().trim(),
        name: $("#name").val(),
        color: $("#color").val()
    }
    if(data.message == "") return false
    socket.emit('talk', data);
    $('#message').val('');
}

function appendInitialLog(logs){
    for(let log of logs){
        if(log.name == "system"){
            appendSystemMessage(log)
        } else {
            appendChatMessage(log)
        }
    }
}

function appendChatMessage(data){
    var tab = $("#discuss")
    $("<tr></tr>")
    .append(`<td class="name"><span class="${data.color}">◆</span><b>${data.name}</b>さん</td>`)
    .append(`<td class="talk">「${data.message.replace(/\n/g,"<br>")}」</td>`)
    .prependTo(tab)
}

function appendSystemMessage(data){
    var tab = $("#discuss")
    $("<tr>",{"class":"system"})
    .append(`<td colspan="2">${data.message}</td>`,{colSpan: 2})
    .prependTo(tab)
}

function appendPersonalMessage(data){
    var tab = $("#discuss")
    $("<tr>",{"class":"personal"})
    .append(`<td colspan="2">${data.message}</td>`,{colSpan: 2})
    .prependTo(tab)
}

