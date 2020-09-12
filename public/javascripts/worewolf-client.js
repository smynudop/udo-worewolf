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

var villageData

$(function () {
    socket = io("/room-" + vno)

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

    $("#ability").click(function () {
        var v = $("#abilityTarget").val()
        if (v == "damy") return false

        socket.emit("ability", {
            type: $(this).data("type"),
            target: v,
        })
        return false
    })

    $("#gameStart").click(function () {
        socket.emit("start")
        return false
    })

    $("#summonNPC").click(function () {
        socket.emit("summonNPC")
        return false
    })

    $("#checkCast").click(function () {
        socket.emit("checkCast")
        return false
    })

    $("#rollcall").click(function () {
        socket.emit("rollcall")
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
        socket.emit("fix-gm", {
            name: $("#fix-name").val(),
            pr: $("#fix-pr").val(),
            casttype: $("#fix-casttype").val(),
            capacity: $("#fix-capacity").val() - 0,
            time: {
                day: $("#fix-time-day").val() - 0,
                vote: $("#fix-time-vote").val() - 0,
                night: $("#fix-time-night").val() - 0,
                ability: $("#fix-time-ability").val() - 0,
                nsec: $("#fix-time-nsec").val() - 0,
            },
            isShowJobDead: $("#fix-isShowJobDead").val() == 1,
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

    $("#discuss").on("click", ".quote", function (e) {
        var day = $(this).data("day")
        var resno = $(this).data("resno")
        var res = `>>${day}-${resno}`
        $("#message").val($("#message").val() + res)
    })

    $("#memoDiscussTable").on("click", ".quote", function (e) {
        var day = $(this).data("day")
        var resno = $(this).data("resno")
        var res = `>>${day}-${resno}`
        $("#message").val($("#message").val() + res)
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

    socket.on("voteSuccess", function (no) {
        isVote = true
        $("#command-vote .alert").addClass("hide")
        $("#menu-sp-discuss").removeClass("alert")
    })

    socket.on("useAbilitySuccess", function (no) {
        isUseAbility = true
        $("#command-ability .alert").addClass("hide")
        $("#menu-sp-discuss").removeClass("alert")
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

    socket.on("banTalk", function () {
        $("#message").val(msgtmp)
    })

    // メッセージを受信する

    $("#command-login").show()
})

function setMe(data) {
    me = data
    if (me.status.desc != "") {
        $("#job").show().html(me.status.desc)
    } else {
        $("#job").hide()
    }
}

function changePhase(data) {
    villageData = data

    phase = data.phase
    targets = data.targets

    if (data.day > day) {
        for (var d = day + 1; d <= data.day; d++) {
            $("<li></li>")
                .html(d + "日目")
                .data("day", d)
                .appendTo("#memoDiscussDay")
        }
        day = data.day
    }

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
            } else if (key == "isShowJobDead") {
                $("fix-isShowJobDead").val(vinfo[key] ? 1 : 0)
            } else {
                $(`#fix-${key}`).val(vinfo[key])
            }
        }
    }

    $("body").removeClass().addClass(data.phase)

    sec = data.left
    nsec = data.nsec || 0

    clearInterval(timerflg)
    if (sec) {
        var nsectxt = ""
        if (data.nsec) {
            nsectxt = ` <span id="nsec">発言解禁まで<span id="n-second">${nsec}</span>秒</span>`
        }
        $("#timer").html(` あと<span id="second">${sec}</span>秒${nsectxt}`)
        timerflg = setInterval(function () {
            sec--
            $("#second").html(sec)

            if (--nsec <= 0) {
                $("#nsec").remove()
            } else {
                $("#n-second").html(nsec)
            }
        }, 1000)
    } else {
        $("#timer").html("")
    }

    slim()
    refresh()
}

function refresh() {
    $("#command > div").hide()
    updateCommand(me.status.talkCommand)

    if (me.isWatch) {
        if (phase == "prologue") {
            $("#command-login").show()
        }
        return false
    }

    if (me.isGM || (me.isKariGM && phase == "prologue")) {
        $("#command-gm").show()
    }
    if (!me.isGM && phase == "prologue") {
        $("#command-logout").show()
    }
    if (!me.isGM && me.isAlive) {
        switch (phase) {
            case "day":
                $("#command-vote").show()
                updateVoteTarget(targets)

                $("#command-vote .alert").addClass("hide")
                $("#menu-sp-discuss").removeClass("alert")
                break

            case "vote":
                $("#command-vote").show()
                updateVoteTarget(targets)

                isVote = me.vote !== null
                $("#command-vote .alert").toggleClass("hide", isVote)
                $("#menu-sp-discuss").toggleClass("alert", !isVote)

                break

            case "night":
                for (let com of me.status.command) {
                    if (com.since <= villageData.day) {
                        $("#command-ability").show()
                        $("#ability").data("type", com.type).val(com.text)
                        updateAbilityTarget(com.target)
                    }
                }

                $("#command-ability .alert").addClass("hide")
                $("#menu-sp-discuss").removeClass("alert")
                break

            case "ability":
                isUseAbility = me.ability !== null

                for (let com of me.status.command) {
                    if (com.since <= villageData.day) {
                        $("#command-ability").show()
                        $("#ability").data("type", com.type).val(com.text)
                        updateAbilityTarget(com.target)
                    }
                }

                $("#command-ability .alert").toggleClass("hide", isUseAbility)
                $("#menu-sp-discuss").toggleClass("alert", !isUseAbility)

                break
        }
    }
}

function updateAbilityTarget(targets) {
    var select = $("#abilityTarget")
    var v = select.val()

    select.empty()
    $("<option></option").html("▼選択").val("damy").appendTo(select)
    for (var key in targets) {
        if (me.no == key) continue
        $("<option></option").html(targets[key]).val(key).appendTo(select)
    }
    select.val(v)
}

function updateVoteTarget(targets) {
    var select = $("#voteTarget")
    var v = select.val()
    select.empty()
    $("<option></option").html("▼選択").val("damy").appendTo(select)
    let flg = false

    for (var key in targets) {
        if (me.no == key) continue
        $("<option></option").html(targets[key]).val(key).appendTo(select)
        if (key == v) {
            flg = true
        }
    }
    select.val(flg ? v : "damy")
}

function updateCommand(commands) {
    var select = $("#talkType")
    var v = select.val()
    select.empty()

    let flg = false
    for (var command of commands) {
        $("<option></option").html(command.text).val(command.type).appendTo(select)
        if (command.type == v) {
            flg = true
        }
    }
    select.val(flg ? v : commands[0].type)
}

function refreshPlayers(data) {
    players = data

    var ul = $("#playerlist")
    var memoul = $("#memoDiscussPlayer")

    ul.empty()
    memoul.empty()

    for (let player of data) {
        if (player.no > 990) continue

        var alive = player.isAlive ? "alive" : "dead"
        var li = $("<li></li>")
        li.html(`<span class="${player.color}">◆</span>${player.cn}`)
            .data("no", player.no)
            .addClass(alive)
            .toggleClass("uncall", player.waitCall)

        li.clone(true).appendTo(memoul)

        var job = player.status ? `[${player.status.nameja}]` : ""
        var userid = player.userid ? `<br>${player.userid}` : ""
        var trip = player.trip ? " " + player.trip : ""
        li.html(li.html() + job + userid + trip)
        li.appendTo(ul)
    }

    let a = players.filter((p) => p.no < 990 && p.isAlive).length
    let d = players.filter((p) => p.no < 990 && !p.isAlive).length

    var join = `参加者:${a + d} 生存:${a} 死亡${d}`
    $("#playernum").html(join)

    $("<li></li>").html("全員表示").data("no", "all").appendTo(memoul)

    if (me.isGM || me.isKariGM) {
        var select = $("#gmTarget")
        select.empty()
        $("<option></option>").html("▼選択").appendTo(select)

        for (let no in data) {
            if (no >= 990 || no == 0) continue
            var player = data[no]
            $("<option></option>").html(player.cn).val(player.no).appendTo(select)
        }
    }
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
    var memo = $("#memoDiscussTable")

    var d = "day" + data.day
    var phase = "day" + data.day + "-" + data.phase
    var cl = data.class || data.type

    var tr = $("<tr></tr>").addClass(d).addClass(phase).addClass(cl)

    if (["system", "wolf-system", "progress", "vote", "personal", "info"].includes(data.type)) {
        tr.append(`<td colspan="2">${data.message.replace(/\n/g, "<br>")}</td>`)
    } else {
        if (data.type == "wolfNeigh" && me.isGM) return false

        $("<td></td>")
            .addClass("name")
            .html(`<span class="${data.color}">◆</span>${data.cn}`)
            .appendTo(tr)
        var td = $("<td></td>")
            .addClass("talk")
            .addClass(data.size)
            .html(data.message.replace(/\n/g, "<br>"))
        if (data.type == "discuss") {
            $("<div></div>")
                .addClass("quote")
                .data("day", data.day)
                .data("resno", data.resno)
                .appendTo(td)
        }
        td.appendTo(tr)

        if (data.no) {
            tr.addClass("player-" + data.no)
        }
    }

    tr.clone(true).prependTo(tab)

    if (["progress", "discuss"].includes(data.type)) {
        tr.prependTo(memo)
    }
}

function appendTalks(data) {
    for (let t of data) {
        appendTalk(t)
    }
    slim()
}

function slim() {
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
