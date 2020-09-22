"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerSocket = void 0;
var SocketLike = /** @class */ (function () {
    function SocketLike() {
        this.id = "this is not socket";
        this.rooms = {};
    }
    SocketLike.prototype.emit = function () {
        return false;
    };
    SocketLike.prototype.join = function () {
        return false;
    };
    SocketLike.prototype.leave = function () {
        return false;
    };
    return SocketLike;
}());
var PlayerSocket = /** @class */ (function () {
    function PlayerSocket(socket) {
        this.socket = socket || new SocketLike();
        this.rooms = new Set();
    }
    PlayerSocket.prototype.emit = function (type, data) {
        this.socket.emit(type, data);
    };
    PlayerSocket.prototype.join = function (name) {
        this.socket.join(name);
        this.rooms.add(name);
    };
    PlayerSocket.prototype.leave = function (name) {
        this.socket.leave(name);
        this.rooms.delete(name);
    };
    PlayerSocket.prototype.leaveAll = function () {
        var e_1, _a;
        try {
            for (var _b = __values(this.rooms), _c = _b.next(); !_c.done; _c = _b.next()) {
                var room = _c.value;
                this.leave(room);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    PlayerSocket.prototype.updateSocket = function (socket) {
        var e_2, _a;
        this.socket = socket;
        try {
            for (var _b = __values(this.rooms), _c = _b.next(); !_c.done; _c = _b.next()) {
                var room = _c.value;
                this.join(room);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    return PlayerSocket;
}());
exports.PlayerSocket = PlayerSocket;
//# sourceMappingURL=socket.js.map