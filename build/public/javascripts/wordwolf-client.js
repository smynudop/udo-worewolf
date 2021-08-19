var socket
var players
var phase,
    targets,
    day = 0
var sec, nsec, timerflg
var isVote = true,
    isUseAbility = true
var size = "normal"
var msgtmp
var targetno

var villageData

$(function () {
    socket = io("../wordroom-" + vno)

    $("#enter").click(function () {
        //入室申請
        var data = {
            cn: $("#name").val(),
            color: $("#color").val(),
        }
        if (data.cn.length > 8 || data.cn.length == 0) {
            alert("名前は8文字以内にしてください")
            return false
        }
        socket.emit("enter", data)
        return false
    })

    $(".exit").click(function () {
        socket.emit("leave", "")
        return false
    })

    $("#chat").click(function () {
        sendMessage()
        return false
    })

    $("#vote").click(function () {
        var v = $("#voteTarget").val()
        if (v == "damy") return false

        socket.emit("vote", {
            target: v,
        })
        return false
    })

    $("#gameStart").click(function () {
        socket.emit("start")
        return false
    })

    $("#kick").click(function () {
        var target = $("#gmTarget").val()
        if (target === null) return false

        socket.emit("kick", { target: target })
    })

    $("#fix-player").click(function () {
        socket.emit("fix-player", {
            cn: $("#fix-cn").val(),
            color: $("#fix-color").val(),
        })
    })

    $("#fix-gm").click(function () {
        socket.emit("fix-rm", {
            name: $("#fix-name").val(),
            pr: $("#fix-pr").val(),
            time: {
                setWord: $("#fix-time-setWord").val() - 0,
                discuss: $("#fix-time-discuss").val() - 0,
                counter: $("#fix-time-counter").val() - 0,
            },
        })
        $("#vinfo").hide()
    })

    $(".handle").click(function () {
        $(this).parent().find(".detail").toggle()
    })

    $(".size").click(function () {
        var s = $(this).data("size")
        $(".size").removeClass("selected")
        if (size == s) {
            size = "normal"
        } else {
            size = s
            $(this).addClass("selected")
        }
    })

    $("#fixVillageInfo").click(() => {
        $("#vinfo").toggle()
    })

    $("#setWord").click(() => {
        socket.emit("setWord", {
            vword: $("#vword").val(),
            wword: $("#wword").val(),
            wolfNum: $("#wolfNum").val() - 0,
        })
    })

    $("#villageWin").click(() => {
        socket.emit("villageWin")
    })

    $("#wolfWin").click(() => {
        socket.emit("wolfWin")
    })

    $("#word-vote").click(function () {
        $("#right").toggle()
    })

    $("#message").keypress(function (e) {
        if (e.which == 13) {
            sendMessage()
            $("#message").blur()
            return false
        }
    })

    $("#playerlist").on("click", "li", function (e) {
        var no = $(this).data("no") - 0
        if (no == targetno) {
            targetno = null
            socket.emit("vote", {
                target: null,
            })
        } else {
            targetno = no
            socket.emit("vote", {
                target: no,
            })
        }
    })

    $(window).keydown(function (e) {
        if (e.ctrlKey && e.keyCode == 13) {
            sendMessage()
            return false
        }
    })

    socket.on("talk", function (data) {
        appendTalk(data)
    })

    socket.on("you", function (data) {
        setMe(data)
    })

    socket.on("player", function (data) {
        refreshPlayers(data)
    })

    socket.on("initialLog", function (data) {
        $("#discuss").empty()
        $("#memoDiscussTable").empty()
        appendTalks(data)
    })

    socket.on("enterSuccess", function (data) {
        $("#talk").removeClass("hide")
        setMe(data)
        refresh()
    })

    socket.on("leaveSuccess", function (no) {
        $("#command > div").hide()
        $("#command-login").show()
        $("#talk").addClass("hide")
    })

    socket.on("changePhase", function (data) {
        changePhase(data)
    })

    socket.on("disconnect", function (data) {
        $("#command > div").hide()
        $("#talk").addClass("hide")
        $("#command-reload").show()
    })

    socket.on("refresh", function () {
        location.reload()
    })

    // メッセージを受信する

    $("#command-login").show()
})

function setMe(data) {
    me = data
    targetno = data.vote.target
}

function changePhase(data) {
    villageData = data

    phase = data.phase
    targets = data.targets

    vinfo = data.villageInfo
    if (vinfo) {
        $("#title").html(vinfo.name)
        $("#pr").html(vinfo.pr)
        $("title").html(vinfo.name + " - 焼肉鯖")

        for (var key in vinfo) {
            if (key == "time") {
                for (var key2 in vinfo.time) {
                    $(`#fix-time-${key2}`).val(vinfo.time[key2])
                }
            } else {
                $(`#fix-${key}`).val(vinfo[key])
            }
        }
    }

    $("body").removeClass().addClass(data.phase)

    sec = data.left

    clearInterval(timerflg)
    if (sec) {
        $("#timer").html(` あと<span id="second">${sec}</span>秒`)
        timerflg = setInterval(function () {
            sec--
            $("#second").html(sec)
        }, 1000)
    } else {
        $("#timer").html("")
    }
    refresh()
}

function refresh() {
    $("#command > div").hide()

    if (me.isWatch && phase == "idol") {
        $("#command-login").show()
    }
    if (me.isWatch) return false
    switch (phase) {
        case "setWord":
            if (me.job == "GM") {
                $("#command-gm-setWord").show()
            }

        case "discuss":
            break

        case "counter":
            if (me.job == "GM") {
                $("#command-gm-judge").show()
            }
            break

        case "idol":
            $("#command-logout").show()
            if (me.isRM) {
                $("#command-rm").show()
            }
            break
    }
}

function updateVoteTarget(targets) {
    var select = $("#voteTarget")
    var v = select.val()
    select.empty()
    $("<option></option>").html("▼選択").val("damy").appendTo(select)
    let flg = false
    for (var key in targets) {
        if (me.no == key) continue

        let opt = $("<option></option>").html(targets[key]).val(key)
        opt.appendTo($("#voteTarget"))
        if (key == v) {
            flg = true
        }
    }
    //select.val(flg ? v : "damy")
}

function refreshPlayers(data) {
    players = data

    var ul = $("#playerlist")

    ul.empty()

    for (let player of data) {
        if (player.no > 990) continue

        var li = $("<li></li>")

        li.data("no", player.no)
        li.toggleClass("selected", player.no === targetno)
        li.toggleClass("gm", player.isGM)

        var job = player.job ? `（${player.job}）` : ""
        job = player.isGM ? "（GM）" : job
        var vote = player.vote.target !== null ? "→" + player.vote.targetName : "　"
        li.html(`<span class="${player.color}">◆</span>${player.cn}` + job + "<br>" + vote)
        li.appendTo(ul)
    }

    var join = `参加者:${players.length}`
    $("#playernum").html(join)

    if (me.isRM) {
        var select = $("#gmTarget")
        select.empty()
        $("<option></option>").html("▼選択").appendTo(select)

        for (let no in data) {
            if (no >= 990 || no == 0) continue
            var player = data[no]
            $("<option></option>").html(player.cn).val(player.no).appendTo(select)
        }
    }

    let ts = {}
    for (let player of data) {
        ts[player.no] = player.cn
    }
    updateVoteTarget(ts)
}

function sendMessage() {
    var data = {
        no: me.no,
        message: $("#message").val().trim(),
        type: $("#talkType").val(),
        size: size,
    }
    if (data.message == "") return false

    msgtmp = data.message
    socket.emit("talk", data)
    $("#message").val("")
    $(".size").removeClass("selected")
    size = "normal"
}

function appendTalk(data) {
    var tab = $("#discuss")

    var cl = data.class || data.type

    var tr = $("<tr></tr>").addClass(cl)

    if (data.type == "system" || data.type == "personal") {
        tr.append(`<td colspan="2">${data.message.replace(/\n/g, "<br>")}</td>`)
    } else {
        $("<td></td>")
            .addClass("name")
            .html(`<span class="${data.color}">◆</span>${data.cn}`)
            .appendTo(tr)
        $("<td></td>")
            .addClass("talk")
            .addClass(data.size)
            .html(data.message.replace(/\n/g, "<br>"))
            .appendTo(tr)
    }
    tr.prependTo(tab)
}

function appendTalks(data) {
    for (let t of data) {
        appendTalk(t)
    }
    slim()
}

function slim() {
    return false
    if (phase == "day") {
        $("#discuss tr")
            .not(".eachVote")
            .not(".votedetail")
            .not(`.day${villageData.day}-day`)
            .not(`.day${villageData.day - 1}-ability.system`)
            .not(".personal")
            .not(".wolf-system")
            .remove()
    }

    if (phase == "night") {
        $("#discuss tr")
            .not(".eachVote")
            .not(`.day${villageData.day}.votedetail`)
            .not(`.day${villageData.day}-night`)
            .not(`.day${villageData.day}-vote.system`)
            .remove()
    }
}
