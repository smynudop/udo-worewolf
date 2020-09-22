"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = void 0;
var Log = /** @class */ (function () {
    function Log(nsp) {
        this.list = [];
        this.nsp = nsp;
        this.count = 1;
    }
    Log.prototype.all = function () {
        return this.list;
    };
    Log.prototype.initial = function () {
        return this.list.filter(function (l) { return l.type != "personal"; });
    };
    Log.prototype.escape = function (text) {
        text = text
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/'/g, "&#039;");
        return text;
    };
    Log.prototype.add = function (type, option) {
        var data = {
            type: "system",
            message: "このメッセージが出ている場合は分岐に失敗しています",
        };
        switch (type) {
            case "addPlayer":
                data = {
                    type: "system",
                    message: option.player + "\u3055\u3093\u304C\u5165\u5BA4\u3057\u307E\u3057\u305F",
                };
                break;
            case "leavePlayer":
                data = {
                    type: "system",
                    message: option.player + "\u3055\u3093\u304C\u9000\u5BA4\u3057\u307E\u3057\u305F",
                };
                break;
            case "kick":
                data = {
                    type: "system",
                    message: option.player + "\u3055\u3093\u304C\u6751\u516B\u5206\u306B\u306A\u308A\u307E\u3057\u305F",
                };
                break;
            case "talk":
                data = {
                    type: "discuss",
                    message: this.escape(option.message),
                    color: option.color,
                    cn: option.cn,
                };
                break;
            case "selectGM":
                data = {
                    type: "system",
                    class: "progress",
                    message: option.gm.cn + "\u3055\u3093\u304C\u51FA\u984C\u8005\u3067\u3059\u3002\u304A\u984C\u3092\u8003\u3048\u3066\u4E0B\u3055\u3044",
                };
                break;
            case "discussStart":
                data = {
                    type: "system",
                    class: "progress",
                    message: "議論を開始して下さい。",
                };
                break;
            case "word":
                data = {
                    type: "personal",
                    message: "\u304A\u984C\u306F" + option.word + "\u3067\u3059\u3002",
                    no: option.player.no,
                };
                break;
            case "gmword":
                data = {
                    type: "personal",
                    message: "\u6751\u306E\u304A\u984C\u306F" + option.vword + "\u3001\u72FC\u306E\u304A\u984C\u306F" + option.wword + "\u3067\u3059",
                    no: option.player.no,
                };
                break;
            case "counter":
                data = {
                    type: "system",
                    class: "progress",
                    message: "\u9006\u8EE2\u306E\u30C1\u30E3\u30F3\u30B9\u3067\u3059\u3002\u6751\u4EBA\u9663\u55B6\u306E\u304A\u984C\u3092\u5F53\u3066\u3066\u4E0B\u3055\u3044",
                };
                break;
            case "release":
                data = {
                    type: "system",
                    message: "\u6751\u30EF\u30FC\u30C9\u306F" + option.vword + "\u3001\u72FC\u30EF\u30FC\u30C9\u306F" + option.wword + "\u3067\u3057\u305F",
                };
                break;
            case "finish":
                data = {
                    type: "system",
                    class: "progress",
                    message: option.side + "\u9663\u55B6\u306E\u52DD\u5229\u3067\u3059",
                };
                break;
            case "exec":
                data = {
                    type: "system",
                    message: option.player.cn + "\u3055\u3093\u304C\u51E6\u5211\u3055\u308C\u307E\u3057\u305F\u3002" + option.player.cn + "\u3055\u3093\u306F" + option.player.job + "\u3067\u3057\u305F",
                };
                break;
            case "noexec":
                data = {
                    type: "system",
                    message: "\u51E6\u5211\u306F\u884C\u308F\u308C\u307E\u305B\u3093\u3067\u3057\u305F\u3002",
                };
                break;
            case "break":
                data = {
                    type: "system",
                    message: "\u30B2\u30FC\u30E0\u3092\u4E2D\u65AD\u3057\u307E\u3057\u305F\u3002",
                };
                break;
            case "vinfo":
                data = {
                    type: "system",
                    message: option.no + "\u756A " + option.name + "\u6751\n\u304A\u984C\u8A2D\u5B9A:" + option.time.setWord + "\u79D2 \u8B70\u8AD6:" + option.time.discuss + "\u79D2 \u9006\u8EE2:" + option.time.counter + "\u79D2\n\u30EB\u30FC\u30E0\u30DE\u30B9\u30BF\u30FC\uFF1A" + option.RMid,
                };
                break;
        }
        this.list.push(data);
        switch (data.type) {
            case "system":
            case "discuss":
                this.nsp.emit("talk", data);
                break;
            case "personal":
                this.nsp.to("player-" + data.no).emit("talk", data);
                break;
        }
    };
    return Log;
}());
exports.Log = Log;
//# sourceMappingURL=word-log.js.map