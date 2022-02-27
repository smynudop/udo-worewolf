/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./public/javascripts/worewolf-client.ts":
/*!***********************************************!*\
  !*** ./public/javascripts/worewolf-client.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nexports.Client = void 0;\r\nclass Client {\r\n    constructor() {\r\n        this.socket = this.connect();\r\n        this.villageData = null;\r\n        this.msgtmp = \"\";\r\n        this.me = me;\r\n        this.size = \"normal\";\r\n        this.day = 0;\r\n        this.targets = {};\r\n        this.timerflg = null;\r\n        this.phase = \"prologue\";\r\n        this.isVote = true;\r\n        this.isUseAbility = true;\r\n        this.players = [];\r\n        this.listen();\r\n        this.on();\r\n    }\r\n    connect() {\r\n        return io(\"/room-\" + vno);\r\n    }\r\n    setMe(data) {\r\n        var _a;\r\n        this.me = data;\r\n        if (((_a = this.me.status) === null || _a === void 0 ? void 0 : _a.desc) != \"\") {\r\n            $(\"#job\").show().html(this.me.status.desc);\r\n        }\r\n        else {\r\n            $(\"#job\").hide();\r\n        }\r\n    }\r\n    changePhase(data) {\r\n        this.phase = data.phase;\r\n        this.targets = data.targets;\r\n        if (data.day > this.day) {\r\n            for (var d = this.day + 1; d <= data.day; d++) {\r\n                $(\"<li></li>\")\r\n                    .html(d + \"日目\")\r\n                    .data(\"day\", d)\r\n                    .appendTo(\"#memoDiscussDay\");\r\n            }\r\n            this.day = data.day;\r\n        }\r\n        let vinfo = data.villageInfo;\r\n        if (vinfo) {\r\n            $(\"#title\").html(vinfo.name);\r\n            $(\"#pr\").html(vinfo.pr);\r\n            $(\"title\").html(vinfo.name + \" - 焼肉鯖\");\r\n            for (var key in vinfo) {\r\n                if (key == \"time\") {\r\n                    for (var key2 in vinfo.time) {\r\n                        $(`#fix-time-${key2}`).val(vinfo.time[key2]);\r\n                    }\r\n                }\r\n                else if (key == \"isShowJobDead\") {\r\n                    $(\"fix-isShowJobDead\").val(vinfo[key] ? 1 : 0);\r\n                }\r\n                else {\r\n                    $(`#fix-${key}`).val(vinfo[key]);\r\n                }\r\n            }\r\n        }\r\n        $(\"body\").removeClass().addClass(data.phase);\r\n        let sec = data.left;\r\n        let nsec = data.nsec || 0;\r\n        if (this.timerflg)\r\n            clearInterval(this.timerflg);\r\n        if (sec) {\r\n            var nsectxt = \"\";\r\n            if (data.nsec) {\r\n                nsectxt = ` <span id=\"nsec\">発言解禁まで<span id=\"n-second\">${nsec}</span>秒</span>`;\r\n            }\r\n            $(\"#timer\").html(` あと<span id=\"second\">${sec}</span>秒${nsectxt}`);\r\n            this.timerflg = setInterval(function () {\r\n                sec--;\r\n                $(\"#second\").html(String(sec));\r\n                if (--nsec <= 0) {\r\n                    $(\"#nsec\").remove();\r\n                }\r\n                else {\r\n                    $(\"#n-second\").html(String(nsec));\r\n                }\r\n            }, 1000);\r\n        }\r\n        else {\r\n            $(\"#timer\").html(\"\");\r\n        }\r\n        this.slim();\r\n        this.refresh();\r\n    }\r\n    refresh() {\r\n        $(\"#command > div\").hide();\r\n        if (this.me.status) {\r\n            this.updateCommand(this.me.status.talkCommand);\r\n        }\r\n        let me = this.me;\r\n        if (this.me.isWatch) {\r\n            if (this.phase == \"prologue\") {\r\n                $(\"#command-login\").show();\r\n            }\r\n            return false;\r\n        }\r\n        if (me.isGM || (me.isKariGM && this.phase == \"prologue\")) {\r\n            $(\"#command-gm\").show();\r\n        }\r\n        if (!me.isGM && this.phase == \"prologue\") {\r\n            $(\"#command-logout\").show();\r\n        }\r\n        if (!me.isGM && me.isAlive) {\r\n            switch (this.phase) {\r\n                case \"day\":\r\n                    $(\"#command-vote\").show();\r\n                    this.updateVoteTarget(this.targets);\r\n                    $(\"#command-vote .alert\").addClass(\"hide\");\r\n                    $(\"#menu-sp-discuss\").removeClass(\"alert\");\r\n                    break;\r\n                case \"vote\":\r\n                    $(\"#command-vote\").show();\r\n                    this.updateVoteTarget(this.targets);\r\n                    this.isVote = me.vote !== null;\r\n                    $(\"#command-vote .alert\").toggleClass(\"hide\", this.isVote);\r\n                    $(\"#menu-sp-discuss\").toggleClass(\"alert\", !this.isVote);\r\n                    break;\r\n                case \"night\":\r\n                    for (let com of me.status.command) {\r\n                        if (com.since <= this.day) {\r\n                            console.log(com.type);\r\n                            $(\"#command-ability\").show();\r\n                            $(\"#ability\").data(\"type\", com.type).val(com.text);\r\n                            this.updateAbilityTarget(com.target);\r\n                        }\r\n                    }\r\n                    $(\"#command-ability .alert\").addClass(\"hide\");\r\n                    $(\"#menu-sp-discuss\").removeClass(\"alert\");\r\n                    break;\r\n                case \"ability\":\r\n                    this.isUseAbility = me.ability !== null;\r\n                    for (let com of me.status.command) {\r\n                        if (com.since <= this.day) {\r\n                            $(\"#command-ability\").show();\r\n                            $(\"#ability\").data(\"type\", com.type).val(com.text);\r\n                            this.updateAbilityTarget(com.target);\r\n                        }\r\n                    }\r\n                    $(\"#command-ability .alert\").toggleClass(\"hide\", this.isUseAbility);\r\n                    $(\"#menu-sp-discuss\").toggleClass(\"alert\", !this.isUseAbility);\r\n                    break;\r\n            }\r\n        }\r\n    }\r\n    slim() {\r\n        if (this.phase == \"day\") {\r\n            $(\"#discuss tr\")\r\n                .not(\".eachVote\")\r\n                .not(\".votedetail\")\r\n                .not(`.day${this.day}-day`)\r\n                .not(`.day${this.day - 1}-ability.system`)\r\n                .not(\".personal\")\r\n                .not(\".wolf-system\")\r\n                .remove();\r\n        }\r\n        if (this.phase == \"night\") {\r\n            $(\"#discuss tr\")\r\n                .not(\".eachVote\")\r\n                .not(`.day${this.day}.vote`)\r\n                .not(`.day${this.day}-night`)\r\n                .not(`.day${this.day}-vote.system`)\r\n                .remove();\r\n        }\r\n    }\r\n    appendTalks(data) {\r\n        for (let t of data) {\r\n            this.appendTalk(t);\r\n        }\r\n        this.slim();\r\n    }\r\n    appendTalk(data) {\r\n        var tab = $(\"#discuss\");\r\n        var memo = $(\"#memoDiscussTable\");\r\n        var d = \"day\" + data.day;\r\n        var phase = \"day\" + data.day + \"-\" + data.phase;\r\n        var cl = data.class;\r\n        var tr = $(\"<tr></tr>\").addClass(d).addClass(phase);\r\n        if (cl)\r\n            tr.addClass(cl);\r\n        if (data.type == \"system\") {\r\n            tr.append(`<td colspan=\"2\">${data.message.replace(/\\n/g, \"<br>\")}</td>`);\r\n        }\r\n        else {\r\n            $(\"<td></td>\")\r\n                .addClass(\"name\")\r\n                .html(`<span class=\"${data.color}\">◆</span>${data.cn}`)\r\n                .appendTo(tr);\r\n            var td = $(\"<td></td>\")\r\n                .addClass(\"talk\")\r\n                .addClass(data.size || \"\")\r\n                .html(data.message.replace(/\\n/g, \"<br>\"));\r\n            if (data.class == \"discuss\") {\r\n                $(\"<div></div>\")\r\n                    .addClass(\"quote\")\r\n                    .data(\"day\", data.day)\r\n                    .data(\"resno\", data.resno || \"\")\r\n                    .appendTo(td);\r\n            }\r\n            td.appendTo(tr);\r\n            if (data.no) {\r\n                tr.addClass(\"player-\" + data.no);\r\n            }\r\n        }\r\n        tr.clone(true).prependTo(tab);\r\n        if ([\"discuss\"].includes(data.class)) {\r\n            tr.prependTo(memo);\r\n        }\r\n    }\r\n    refreshPlayers(data) {\r\n        this.players = data;\r\n        var ul = $(\"#playerlist\");\r\n        var memoul = $(\"#memoDiscussPlayer\");\r\n        ul.empty();\r\n        memoul.empty();\r\n        for (let player of data) {\r\n            if (player.no && player.no > 990)\r\n                continue;\r\n            var alive = player.isAlive ? \"alive\" : \"dead\";\r\n            var li = $(\"<li></li>\");\r\n            li.html(`<span class=\"${player.color}\">◆</span>${player.cn}`)\r\n                .data(\"no\", Number(player.no))\r\n                .addClass(alive)\r\n                .toggleClass(\"uncall\", player.waitCall);\r\n            li.clone(true).appendTo(memoul);\r\n            var job = player.status ? `[${player.status.nameja}]` : \"\";\r\n            var userid = player.userid ? `<br>${player.userid}` : \"\";\r\n            var trip = player.trip ? \" \" + player.trip : \"\";\r\n            li.html(li.html() + job + userid + trip);\r\n            li.appendTo(ul);\r\n        }\r\n        let a = this.players.filter((p) => p.no < 990 && p.isAlive).length;\r\n        let d = this.players.filter((p) => p.no < 990 && !p.isAlive).length;\r\n        var join = `参加者:${a + d} 生存:${a} 死亡${d}`;\r\n        $(\"#playernum\").html(join);\r\n        $(\"<li></li>\").html(\"全員表示\").data(\"no\", \"all\").appendTo(memoul);\r\n        if (this.me.isGM || this.me.isKariGM) {\r\n            var select = $(\"#gmTarget\");\r\n            select.empty();\r\n            $(\"<option></option>\").html(\"▼選択\").appendTo(select);\r\n            for (let key in data) {\r\n                let no = +key;\r\n                if (no >= 990 || no == 0)\r\n                    continue;\r\n                var player = data[no];\r\n                $(\"<option></option>\").html(player.cn).val(player.no).appendTo(select);\r\n            }\r\n        }\r\n    }\r\n    sendMessage() {\r\n        var data = {\r\n            no: this.me.no,\r\n            message: String($(\"#message\").val()).trim(),\r\n            type: $(\"#talkType\").val(),\r\n            size: this.size,\r\n        };\r\n        if (data.message == \"\")\r\n            return false;\r\n        this.msgtmp = data.message;\r\n        this.socket.emit(\"talk\", data);\r\n        $(\"#message\").val(\"\");\r\n        $(\".size\").removeClass(\"selected\");\r\n        this.size = \"normal\";\r\n    }\r\n    updateCommand(commands) {\r\n        var select = $(\"#talkType\");\r\n        var v = select.val();\r\n        select.empty();\r\n        let flg = false;\r\n        for (var command of commands) {\r\n            $(\"<option></option\").html(command.text).val(command.type).appendTo(select);\r\n            if (command.type == v) {\r\n                flg = true;\r\n            }\r\n        }\r\n        if (this.phase == \"day\" || this.phase == \"night\")\r\n            flg = false;\r\n        select.val(flg ? v : commands[0].type);\r\n    }\r\n    updateVoteTarget(targets) {\r\n        var select = $(\"#voteTarget\");\r\n        var v = select.val();\r\n        select.empty();\r\n        $(\"<option></option\").html(\"▼選択\").val(\"damy\").appendTo(select);\r\n        let flg = false;\r\n        for (var key in targets) {\r\n            if (this.me.no == +key)\r\n                continue;\r\n            $(\"<option></option\").html(targets[key]).val(key).appendTo(select);\r\n            if (key == v) {\r\n                flg = true;\r\n            }\r\n        }\r\n        select.val(flg ? v : \"damy\");\r\n    }\r\n    updateAbilityTarget(targets) {\r\n        var select = $(\"#abilityTarget\");\r\n        var v = select.val();\r\n        select.empty();\r\n        $(\"<option></option\").html(\"▼選択\").val(\"damy\").appendTo(select);\r\n        for (var key in targets) {\r\n            if (this.me.no == +key)\r\n                continue;\r\n            $(\"<option></option\").html(targets[key]).val(key).appendTo(select);\r\n        }\r\n        select.val(v);\r\n    }\r\n    listen() {\r\n        this.socket.on(\"talk\", (data) => {\r\n            this.appendTalk(data);\r\n        });\r\n        this.socket.on(\"you\", (data) => {\r\n            this.setMe(data);\r\n        });\r\n        this.socket.on(\"player\", (data) => {\r\n            this.refreshPlayers(data);\r\n        });\r\n        this.socket.on(\"initialLog\", (data) => {\r\n            $(\"#discuss\").empty();\r\n            $(\"#memoDiscussTable\").empty();\r\n            this.appendTalks(data);\r\n        });\r\n        this.socket.on(\"enterSuccess\", (data) => {\r\n            $(\"#talk\").removeClass(\"hide\");\r\n            this.setMe(data);\r\n            this.refresh();\r\n        });\r\n        this.socket.on(\"leaveSuccess\", function (no) {\r\n            $(\"#command > div\").hide();\r\n            $(\"#command-login\").show();\r\n            $(\"#talk\").addClass(\"hide\");\r\n        });\r\n        this.socket.on(\"voteSuccess\", (no) => {\r\n            this.isVote = true;\r\n            $(\"#command-vote .alert\").addClass(\"hide\");\r\n            $(\"#menu-sp-discuss\").removeClass(\"alert\");\r\n        });\r\n        this.socket.on(\"useAbilitySuccess\", (no) => {\r\n            this.isUseAbility = true;\r\n            $(\"#command-ability .alert\").addClass(\"hide\");\r\n            $(\"#menu-sp-discuss\").removeClass(\"alert\");\r\n        });\r\n        this.socket.on(\"changePhase\", (data) => {\r\n            this.changePhase(data);\r\n        });\r\n        this.socket.on(\"disconnect\", (data) => {\r\n            $(\"#command > div\").hide();\r\n            $(\"#talk\").addClass(\"hide\");\r\n            $(\"#command-reload\").show();\r\n        });\r\n        this.socket.on(\"refresh\", () => {\r\n            location.reload();\r\n        });\r\n        this.socket.on(\"banTalk\", () => {\r\n            $(\"#message\").val(this.msgtmp);\r\n        });\r\n    }\r\n    on() {\r\n        const _this = this;\r\n        $(\"#enter\").click(() => {\r\n            //入室申請\r\n            var data = {\r\n                cn: String($(\"#name\").val()),\r\n                color: String($(\"#color\").val()),\r\n            };\r\n            if (data.cn.length > 8 || data.cn.length == 0) {\r\n                alert(\"名前は8文字以内にしてください\");\r\n                return false;\r\n            }\r\n            this.socket.emit(\"enter\", data);\r\n            return false;\r\n        });\r\n        $(\".exit\").click(() => {\r\n            this.socket.emit(\"leave\", \"\");\r\n            return false;\r\n        });\r\n        $(\"#chat\").click(() => {\r\n            this.sendMessage();\r\n            return false;\r\n        });\r\n        $(\"#vote\").click(() => {\r\n            var v = $(\"#voteTarget\").val();\r\n            if (v == \"damy\")\r\n                return false;\r\n            this.socket.emit(\"vote\", {\r\n                target: v,\r\n            });\r\n            return false;\r\n        });\r\n        $(\"#ability\").click(function () {\r\n            var v = $(\"#abilityTarget\").val();\r\n            if (v == \"damy\")\r\n                return false;\r\n            _this.socket.emit(\"ability\", {\r\n                type: $(\"#ability\").data(\"type\"),\r\n                target: v,\r\n            });\r\n            return false;\r\n        });\r\n        $(\"#gameStart\").click(() => {\r\n            this.socket.emit(\"start\");\r\n            return false;\r\n        });\r\n        $(\"#summonNPC\").click(() => {\r\n            this.socket.emit(\"summonNPC\");\r\n            return false;\r\n        });\r\n        $(\"#checkCast\").click(() => {\r\n            this.socket.emit(\"checkCast\");\r\n            return false;\r\n        });\r\n        $(\"#rollcall\").click(() => {\r\n            this.socket.emit(\"rollcall\");\r\n            return false;\r\n        });\r\n        $(\"#kick\").click(() => {\r\n            var target = $(\"#gmTarget\").val();\r\n            if (target === null)\r\n                return false;\r\n            this.socket.emit(\"kick\", { target: target });\r\n        });\r\n        $(\"#fix-player\").click(() => {\r\n            this.socket.emit(\"fix-player\", {\r\n                cn: $(\"#fix-cn\").val(),\r\n                color: $(\"#fix-color\").val(),\r\n            });\r\n        });\r\n        $(\"#fix-gm\").click(() => {\r\n            this.socket.emit(\"fix-gm\", {\r\n                name: $(\"#fix-name\").val(),\r\n                pr: $(\"#fix-pr\").val(),\r\n                casttype: $(\"#fix-casttype\").val(),\r\n                capacity: +$(\"#fix-capacity\").val(),\r\n                time: {\r\n                    day: +$(\"#fix-time-day\").val(),\r\n                    vote: +$(\"#fix-time-vote\").val(),\r\n                    night: +$(\"#fix-time-night\").val(),\r\n                    ability: +$(\"#fix-time-ability\").val(),\r\n                    nsec: +$(\"#fix-time-nsec\").val(),\r\n                },\r\n                isShowJobDead: $(\"#fix-isShowJobDead\").val() == 1,\r\n            });\r\n            $(\"#vinfo\").hide();\r\n        });\r\n        $(\".handle\").click(function () {\r\n            $(this).parent().find(\".detail\").toggle();\r\n        });\r\n        $(\".size\").click(function () {\r\n            var s = $(this).data(\"size\");\r\n            $(\".size\").removeClass(\"selected\");\r\n            if (_this.size == s) {\r\n                _this.size = \"normal\";\r\n            }\r\n            else {\r\n                _this.size = s;\r\n                $(this).addClass(\"selected\");\r\n            }\r\n        });\r\n        $(\"#fixVillageInfo\").click(() => {\r\n            $(\"#vinfo\").toggle();\r\n        });\r\n        $(\"#discuss\").on(\"click\", \".quote\", function (e) {\r\n            var day = $(this).data(\"day\");\r\n            var resno = $(this).data(\"resno\");\r\n            var res = `>>${day}-${resno}`;\r\n            $(\"#message\").val($(\"#message\").val() + res);\r\n        });\r\n        $(\"#memoDiscussTable\").on(\"click\", \".quote\", function (e) {\r\n            var day = $(this).data(\"day\");\r\n            var resno = $(this).data(\"resno\");\r\n            var res = `>>${day}-${resno}`;\r\n            $(\"#message\").val($(\"#message\").val() + res);\r\n        });\r\n        $(window).keydown((e) => {\r\n            if (e.ctrlKey && e.keyCode == 13) {\r\n                this.sendMessage();\r\n                return false;\r\n            }\r\n        });\r\n        // メッセージを受信する\r\n        $(\"#command-login\").show();\r\n    }\r\n}\r\nexports.Client = Client;\r\n\n\n//# sourceURL=webpack://worewolf/./public/javascripts/worewolf-client.ts?");

/***/ }),

/***/ "./public/javascripts/worewolf.ts":
/*!****************************************!*\
  !*** ./public/javascripts/worewolf.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\r\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\r\nconst worewolf_client_1 = __webpack_require__(/*! ./worewolf-client */ \"./public/javascripts/worewolf-client.ts\");\r\n$(function () {\r\n    var client = new worewolf_client_1.Client();\r\n});\r\n\n\n//# sourceURL=webpack://worewolf/./public/javascripts/worewolf.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./public/javascripts/worewolf.ts");
/******/ 	
/******/ })()
;