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
exports.FlagManager = void 0;
var FlagManager = /** @class */ (function () {
    function FlagManager(pm) {
        this.players = pm;
        this.date = pm.date;
        this.log = pm.log;
    }
    FlagManager.prototype.reset = function () {
        var e_1, _a;
        try {
            for (var _b = __values(this.players), _c = _b.next(); !_c.done; _c = _b.next()) {
                var player = _c.value;
                player.reset();
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
    FlagManager.prototype.updateStatus = function () {
        var e_2, _a;
        try {
            for (var _b = __values(this.players), _c = _b.next(); !_c.done; _c = _b.next()) {
                var player = _c.value;
                player.status.update();
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
    FlagManager.prototype.resetVote = function () {
        var e_3, _a;
        try {
            for (var _b = __values(this.players), _c = _b.next(); !_c.done; _c = _b.next()) {
                var player = _c.value;
                player.status.vote = null;
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
    };
    FlagManager.prototype.npcVote = function () {
        var e_4, _a;
        try {
            for (var _b = __values(this.players.NPC()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var npc = _c.value;
                npc.randomVote();
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
    };
    FlagManager.prototype.morningProgress = function () {
        this.autoUseAbility();
        this.guard();
        this.attack();
        this.killStand();
        this.revive();
        this.fellow();
    };
    FlagManager.prototype.nightProgress = function () {
        this.execution();
        this.killStandoff();
        this.fellow();
    };
    FlagManager.prototype.useNightAbility = function () {
        var e_5, _a, e_6, _b;
        if (this.date.day == 1) {
            var damy = this.players.damy();
            damy.status.add("bitten");
            this.log.add("ability", "bite", { player: "狼", target: damy.cn });
            try {
                for (var _c = __values(this.players.has("knowdamy")), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var reiko = _d.value;
                    reiko.noticeDamy(damy);
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_5) throw e_5.error; }
            }
        }
        if (this.date.day < 2)
            return false;
        var exec = this.players.selectAll(function (p) { return p.has("executed"); })[0];
        if (!exec)
            return false;
        try {
            for (var _e = __values(this.players.select(function (p) { return p.status.can("necro"); })), _f = _e.next(); !_f.done; _f = _e.next()) {
                var player = _f.value;
                player.useAbility({ type: "necro", target: exec });
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
            }
            finally { if (e_6) throw e_6.error; }
        }
    };
    FlagManager.prototype.execution = function () {
        var e_7, _a;
        try {
            for (var _b = __values(this.players.has("maxVoted")), _c = _b.next(); !_c.done; _c = _b.next()) {
                var player = _c.value;
                player.kill("exec");
                player.status.add("executed");
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_7) throw e_7.error; }
        }
    };
    FlagManager.prototype.killStandoff = function () {
        var e_8, _a;
        try {
            for (var _b = __values(this.players.has("stand")), _c = _b.next(); !_c.done; _c = _b.next()) {
                var player = _c.value;
                player.kill("standoff");
            }
        }
        catch (e_8_1) { e_8 = { error: e_8_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_8) throw e_8.error; }
        }
    };
    FlagManager.prototype.fellow = function () {
        var e_9, _a;
        if (this.players.isDeadAllFox()) {
            try {
                for (var _b = __values(this.players.has("fellowFox")), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var imo = _c.value;
                    imo.kill("fellow");
                }
            }
            catch (e_9_1) { e_9 = { error: e_9_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_9) throw e_9.error; }
            }
        }
    };
    FlagManager.prototype.killStand = function () {
        var e_10, _a;
        try {
            for (var _b = __values(this.players.has("stand")), _c = _b.next(); !_c.done; _c = _b.next()) {
                var stand = _c.value;
                stand.kill("bite");
            }
        }
        catch (e_10_1) { e_10 = { error: e_10_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_10) throw e_10.error; }
        }
    };
    FlagManager.prototype.autoUseAbility = function () {
        /*自動噛み処理*/
        var e_11, _a, e_12, _b;
        var biter = this.players.has("biter");
        if (!biter.length && this.date.day >= 2) {
            var autobiter = this.players.select(function (p) { return p.status.can("bite"); }).lot();
            var target = this.players.select(function (p) { return !p.status.can("bite"); }).lot();
            autobiter.useAbility({ type: "bite", target: target }, true);
        }
        try {
            /*自動占い*/
            for (var _c = __values(this.players.savoAbility("fortune")), _d = _c.next(); !_d.done; _d = _c.next()) {
                var player = _d.value;
                player.randomUseAbility("fortune");
            }
        }
        catch (e_11_1) { e_11 = { error: e_11_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_11) throw e_11.error; }
        }
        /*自動護衛*/
        if (this.date.day < 2)
            return false;
        try {
            for (var _e = __values(this.players.savoAbility("guard")), _f = _e.next(); !_f.done; _f = _e.next()) {
                var player = _f.value;
                player.randomUseAbility("guard");
            }
        }
        catch (e_12_1) { e_12 = { error: e_12_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
            }
            finally { if (e_12) throw e_12.error; }
        }
    };
    FlagManager.prototype.guard = function () {
        var e_13, _a;
        if (this.date.day >= 2) {
            try {
                for (var _b = __values(this.players.select(function (p) { return p.status.can("guard"); })), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var player = _c.value;
                    var target = this.players.pick(player.status.target);
                    target.status.add("guarded");
                }
            }
            catch (e_13_1) { e_13 = { error: e_13_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_13) throw e_13.error; }
            }
        }
    };
    FlagManager.prototype.revive = function () {
        var e_14, _a, e_15, _b;
        try {
            for (var _c = __values(this.players.select(function (p) { return p.status.can("revive"); })), _d = _c.next(); !_d.done; _d = _c.next()) {
                var player = _d.value;
                if (!player.isUsedAbility)
                    continue;
                var target = this.players.pick(player.status.target);
                var threshold = target.isDamy ? 50 : 30;
                if (Math.floor(Math.random() * 100) < threshold) {
                    target.status.add("revive");
                }
            }
        }
        catch (e_14_1) { e_14 = { error: e_14_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_14) throw e_14.error; }
        }
        try {
            for (var _e = __values(this.players.has("revive")), _f = _e.next(); !_f.done; _f = _e.next()) {
                var player = _f.value;
                player.revive();
            }
        }
        catch (e_15_1) { e_15 = { error: e_15_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
            }
            finally { if (e_15) throw e_15.error; }
        }
    };
    FlagManager.prototype.attack = function () {
        var e_16, _a, e_17, _b, e_18, _c, e_19, _d, e_20, _e, e_21, _f;
        try {
            for (var _g = __values(this.players.has("biter")), _h = _g.next(); !_h.done; _h = _g.next()) {
                var player = _h.value;
                var target_1 = this.players.pick(player.status.target);
                target_1.status.add("bitten", player);
            }
        }
        catch (e_16_1) { e_16 = { error: e_16_1 }; }
        finally {
            try {
                if (_h && !_h.done && (_a = _g.return)) _a.call(_g);
            }
            finally { if (e_16) throw e_16.error; }
        }
        try {
            for (var _j = __values(this.players.has("bitten")), _k = _j.next(); !_k.done; _k = _j.next()) {
                var player = _k.value;
                if (player.has("guarded") || player.has("resistBite"))
                    continue;
                if (player.has("useDecoy") && player.status.hasAliveDecoy) {
                    try {
                        for (var _l = (e_18 = void 0, __values(this.players.select(function (p) { return p.status.name == "slave"; }))), _m = _l.next(); !_m.done; _m = _l.next()) {
                            var decoy = _m.value;
                            decoy.status.add("stand");
                        }
                    }
                    catch (e_18_1) { e_18 = { error: e_18_1 }; }
                    finally {
                        try {
                            if (_m && !_m.done && (_c = _l.return)) _c.call(_l);
                        }
                        finally { if (e_18) throw e_18.error; }
                    }
                    continue;
                }
                player.status.add("eaten");
            }
        }
        catch (e_17_1) { e_17 = { error: e_17_1 }; }
        finally {
            try {
                if (_k && !_k.done && (_b = _j.return)) _b.call(_j);
            }
            finally { if (e_17) throw e_17.error; }
        }
        try {
            for (var _o = __values(this.players.select(function (p) { return p.can("fortune"); })), _p = _o.next(); !_p.done; _p = _o.next()) {
                var fortune = _p.value;
                var target = this.players.pick(fortune.status.target);
                target.status.add("fortuned");
            }
        }
        catch (e_19_1) { e_19 = { error: e_19_1 }; }
        finally {
            try {
                if (_p && !_p.done && (_d = _o.return)) _d.call(_o);
            }
            finally { if (e_19) throw e_19.error; }
        }
        try {
            for (var _q = __values(this.players.has("fortuned")), _r = _q.next(); !_r.done; _r = _q.next()) {
                var fortuned = _r.value;
                if (fortuned.has("melt")) {
                    fortuned.status.add("eaten");
                }
            }
        }
        catch (e_20_1) { e_20 = { error: e_20_1 }; }
        finally {
            try {
                if (_r && !_r.done && (_e = _q.return)) _e.call(_q);
            }
            finally { if (e_20) throw e_20.error; }
        }
        try {
            for (var _s = __values(this.players.has("eaten")), _t = _s.next(); !_t.done; _t = _s.next()) {
                var eaten = _t.value;
                eaten.kill("bite");
            }
        }
        catch (e_21_1) { e_21 = { error: e_21_1 }; }
        finally {
            try {
                if (_t && !_t.done && (_f = _s.return)) _f.call(_s);
            }
            finally { if (e_21) throw e_21.error; }
        }
    };
    FlagManager.prototype.startRollcall = function () {
        var e_22, _a;
        try {
            for (var _b = __values(this.players), _c = _b.next(); !_c.done; _c = _b.next()) {
                var player = _c.value;
                if (player.isBot)
                    continue;
                player.startRollcall();
            }
        }
        catch (e_22_1) { e_22 = { error: e_22_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_22) throw e_22.error; }
        }
    };
    FlagManager.prototype.assignRoom = function (isShowJobDead) {
        var e_23, _a;
        try {
            for (var _b = __values(this.players.listAll), _c = _b.next(); !_c.done; _c = _b.next()) {
                var player = _c.value;
                var socket = player.socket;
                socket.join("player-" + player.no);
                if (player.isGM) {
                    socket.join("gm");
                }
                if (player.isDead) {
                    socket.join("grave");
                    if (isShowJobDead) {
                        socket.join("all");
                    }
                }
                else {
                    socket.leave("grave");
                }
                if (player.status.canWatch("share")) {
                    socket.join("share");
                }
                if (player.status.canWatch("wolf")) {
                    socket.join("wolf");
                }
                if (player.status.canWatch("fox")) {
                    socket.join("fox");
                }
            }
        }
        catch (e_23_1) { e_23 = { error: e_23_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_23) throw e_23.error; }
        }
    };
    return FlagManager;
}());
exports.FlagManager = FlagManager;
//# sourceMappingURL=flagManager.js.map