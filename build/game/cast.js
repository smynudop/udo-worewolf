"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.castManager = void 0;
var Job = /** @class */ (function () {
    function Job(name) {
        this.name = name;
        this.nameja = "";
        this.camp = "human";
        this.species = "human";
        this.fortuneResult = "村人";
        this.necroResult = "村人";
        this.desc = "";
        this.offShowJobDead = false;
        this.onlyNotDamy = false;
        this.ability = [];
        this.knowFriend = [];
        this.talk = [];
        this.watch = [];
        this.forever = [];
        this.winCond = ["winCamp"];
        this.rival = [];
    }
    return Job;
}());
var Villager = /** @class */ (function (_super) {
    __extends(Villager, _super);
    function Villager() {
        var _this = _super.call(this, "villager") || this;
        _this.nameja = "村人";
        _this.desc = "何の能力も持ちませんが、知恵と勇気で村を救いましょう。";
        return _this;
    }
    return Villager;
}(Job));
var Fortune = /** @class */ (function (_super) {
    __extends(Fortune, _super);
    function Fortune() {
        var _this = _super.call(this, "fortune") || this;
        _this.nameja = "占い師";
        _this.desc = "毎晩生存者一人を占い、人狼かどうか調べることが出来ます。";
        _this.ability = ["fortune"];
        return _this;
    }
    return Fortune;
}(Job));
var Necro = /** @class */ (function (_super) {
    __extends(Necro, _super);
    function Necro() {
        var _this = _super.call(this, "necro") || this;
        _this.nameja = "霊能者";
        _this.desc = "前の日に処刑された人が、人狼かどうかがわかります。";
        _this.ability = ["necro"];
        return _this;
    }
    return Necro;
}(Job));
var Guard = /** @class */ (function (_super) {
    __extends(Guard, _super);
    function Guard() {
        var _this = _super.call(this, "guard") || this;
        _this.nameja = "狩人";
        _this.desc = "毎晩一人を襲撃から守ることが出来ます。人狼の心を読みましょう。";
        _this.ability = ["guard"];
        return _this;
    }
    return Guard;
}(Job));
var Share = /** @class */ (function (_super) {
    __extends(Share, _super);
    function Share() {
        var _this = _super.call(this, "share") || this;
        _this.nameja = "共有者";
        _this.desc = "毎晩一人を襲撃から守ることが出来ます。人狼の心を読みましょう。";
        _this.talk = ["share"];
        return _this;
    }
    return Share;
}(Job));
var Cat = /** @class */ (function (_super) {
    __extends(Cat, _super);
    function Cat() {
        var _this = _super.call(this, "guard") || this;
        _this.nameja = "猫又";
        _this.desc =
            "狼に噛まれると、噛んだ狼を返り討ちにします。処刑されると、生存者一人を巻き添えにします。";
        _this.onlyNotDamy = true;
        _this.forever = ["standoff"];
        return _this;
    }
    return Cat;
}(Job));
var Wolf = /** @class */ (function (_super) {
    __extends(Wolf, _super);
    function Wolf() {
        var _this = _super.call(this, "wolf") || this;
        _this.nameja = "人狼";
        _this.desc = "村人を襲撃し、処刑を免れ、村を人狼のものにするのです。";
        _this.camp = "wolf";
        _this.species = "wolf";
        _this.onlyNotDamy = true;
        _this.fortuneResult = "人狼";
        _this.necroResult = "人狼";
        _this.talk = ["wolf"];
        _this.ability = ["bite"];
        _this.knowFriend = ["wolf"];
        _this.forever = ["notBitten"];
        return _this;
    }
    return Wolf;
}(Job));
var Madness = /** @class */ (function (_super) {
    __extends(Madness, _super);
    function Madness() {
        var _this = _super.call(this, "madness") || this;
        _this.nameja = "狂人";
        _this.desc = "人狼陣営として村を惑わしましょう。勝利のためには自らの犠牲も必要です。";
        _this.camp = "wolf";
        return _this;
    }
    return Madness;
}(Job));
var Fanatic = /** @class */ (function (_super) {
    __extends(Fanatic, _super);
    function Fanatic() {
        var _this = _super.call(this, "fanatic") || this;
        _this.nameja = "狂信者";
        _this.desc = "人狼が誰だかわかる狂人です。人狼陣営として、狼の手助けをしましょう。";
        _this.camp = "wolf";
        _this.knowFriend = ["wolf"];
        return _this;
    }
    return Fanatic;
}(Job));
var Fox = /** @class */ (function (_super) {
    __extends(Fox, _super);
    function Fox() {
        var _this = _super.call(this, "fox") || this;
        _this.nameja = "妖狐";
        _this.desc = "占われず、処刑されず、時には抵抗して、とにかく生存しましょう。";
        _this.camp = "fox";
        _this.species = "fox";
        _this.onlyNotDamy = true;
        _this.forever = ["melt", "resistBite"];
        _this.knowFriend = ["fox"];
        _this.talk = ["fox"];
        return _this;
    }
    return Fox;
}(Job));
var NecroFox = /** @class */ (function (_super) {
    __extends(NecroFox, _super);
    function NecroFox() {
        var _this = _super.call(this, "necrofox") || this;
        _this.nameja = "霊狐";
        _this.desc = "初日犠牲者の役職がわかる妖狐です。情報のリードを活かしましょう。";
        _this.camp = "fox";
        _this.species = "fox";
        _this.onlyNotDamy = true;
        _this.forever = ["melt", "resistBite", "knowdamy"];
        _this.knowFriend = ["fox"];
        _this.talk = ["fox"];
        return _this;
    }
    return NecroFox;
}(Job));
var Immoralist = /** @class */ (function (_super) {
    __extends(Immoralist, _super);
    function Immoralist() {
        var _this = _super.call(this, "immoralist") || this;
        _this.nameja = "背徳者";
        _this.desc = "人間でありながら妖狐陣営です。妖狐の生存に全力を尽くしましょう。";
        _this.camp = "fox";
        _this.knowFriend = ["fox"];
        _this.forever = ["fellowFox"];
        return _this;
    }
    return Immoralist;
}(Job));
var Noble = /** @class */ (function (_super) {
    __extends(Noble, _super);
    function Noble() {
        var _this = _super.call(this, "noble") || this;
        _this.nameja = "貴族";
        _this.desc =
            "狼に襲撃された時、奴隷を身代わりにして生き延びることが出来ます。ただ、恨みを買っているようですよ。";
        _this.forever = ["useDecoy"];
        return _this;
    }
    return Noble;
}(Job));
var Slave = /** @class */ (function (_super) {
    __extends(Slave, _super);
    function Slave() {
        var _this = _super.call(this, "slave") || this;
        _this.nameja = "奴隷";
        _this.desc = "村人の勝利に加え、貴族の死亡が勝利条件です。ときには反逆も必要かもしれません。";
        _this.knowFriend = ["noble"];
        _this.forever = ["decoy"];
        _this.winCond = ["winCamp", "killRival"];
        _this.rival = ["noble"];
        return _this;
    }
    return Slave;
}(Job));
var Bat = /** @class */ (function (_super) {
    __extends(Bat, _super);
    function Bat() {
        var _this = _super.call(this, "bat") || this;
        _this.nameja = "蝙蝠";
        _this.desc = "生存のみが勝利条件です。強いものの味方に立ち、とにかく生き延びましょう。";
        _this.winCond = ["alive"];
        return _this;
    }
    return Bat;
}(Job));
var Magician = /** @class */ (function (_super) {
    __extends(Magician, _super);
    function Magician() {
        var _this = _super.call(this, "magician") || this;
        _this.nameja = "魔術師";
        _this.desc = "3日目以降、死者を蘇生することが出来ます。ただ、その確率は…？";
        _this.offShowJobDead = true;
        _this.ability = ["revive"];
        return _this;
    }
    return Magician;
}(Job));
var GameMaster = /** @class */ (function (_super) {
    __extends(GameMaster, _super);
    function GameMaster() {
        var _this = _super.call(this, "gm") || this;
        _this.nameja = "ゲームマスター";
        _this.desc = "参加者が気持ちよくゲームを出来ているか見守るのが仕事です。";
        return _this;
    }
    return GameMaster;
}(Job));
var jobenum = {
    村人: Villager,
    占い: Fortune,
    霊能: Necro,
    狩人: Guard,
    共有: Share,
    猫又: Cat,
    狂人: Madness,
    狂信: Fanatic,
    人狼: Wolf,
    妖狐: Fox,
    霊狐: NecroFox,
    背徳: Immoralist,
    貴族: Noble,
    奴隷: Slave,
    蝙蝠: Bat,
    魔術: Magician,
    GM: GameMaster,
};
var castList = {
    Y: {
        4: { 村人: 1, 占い: 1, 狂人: 1, 人狼: 1 },
        5: { 村人: 1, 占い: 1, 狩人: 1, 狂人: 1, 人狼: 1 },
        6: { 村人: 2, 占い: 1, 霊能: 1, 狂人: 1, 人狼: 1 },
        7: { 村人: 2, 占い: 1, 霊能: 1, 狩人: 1, 狂人: 1, 人狼: 1 },
        8: { 村人: 1, 占い: 1, 霊能: 1, 共有: 2, 狂人: 1, 人狼: 2 },
        9: { 村人: 3, 占い: 1, 霊能: 1, 狩人: 1, 人狼: 2, 蝙蝠: 1 },
        10: { 村人: 3, 占い: 1, 霊能: 1, 狂人: 1, 人狼: 2, 奴隷: 1, 貴族: 1 },
        11: { 村人: 5, 占い: 1, 霊能: 1, 狩人: 1, 狂人: 1, 人狼: 2 },
        12: { 村人: 5, 占い: 1, 霊能: 1, 狩人: 1, 狂人: 1, 人狼: 2, 妖狐: 1 },
        13: { 村人: 6, 占い: 1, 霊能: 1, 狩人: 1, 狂人: 1, 人狼: 2, 妖狐: 1 },
        14: { 村人: 5, 占い: 1, 霊能: 1, 狩人: 1, 共有: 2, 狂信: 1, 人狼: 2, 霊狐: 1 },
        15: { 村人: 5, 占い: 1, 霊能: 1, 狩人: 1, 共有: 2, 狂信: 1, 人狼: 2, 霊狐: 1, 背徳: 1 },
        16: { 村人: 6, 占い: 1, 霊能: 1, 狩人: 1, 共有: 2, 狂人: 1, 人狼: 3, 妖狐: 1 },
        17: { 村人: 7, 占い: 1, 霊能: 1, 狩人: 1, 共有: 2, 狂人: 1, 人狼: 3, 妖狐: 1 },
        18: { 村人: 6, 占い: 1, 霊能: 1, 狩人: 1, 共有: 2, 猫又: 1, 狂人: 1, 人狼: 4, 妖狐: 1 },
        19: {
            村人: 6,
            占い: 1,
            霊能: 1,
            狩人: 1,
            共有: 2,
            猫又: 1,
            狂人: 1,
            人狼: 4,
            霊狐: 1,
            背徳: 1,
        },
    },
    W: {
        4: { 村人: 2, 占い: 1, 人狼: 1 },
        5: { 村人: 3, 占い: 1, 人狼: 1 },
        6: { 村人: 4, 占い: 1, 人狼: 1 },
        7: { 村人: 5, 占い: 1, 人狼: 1 },
        8: { 村人: 5, 占い: 1, 人狼: 2 },
        9: { 村人: 5, 占い: 1, 霊能: 1, 人狼: 2 },
        10: { 村人: 5, 占い: 1, 霊能: 1, 狂人: 1, 人狼: 2 },
        11: { 村人: 5, 占い: 1, 霊能: 1, 狩人: 1, 狂人: 1, 人狼: 2 },
        12: { 村人: 6, 占い: 1, 霊能: 1, 狩人: 1, 狂人: 1, 人狼: 2 },
        13: { 村人: 4, 占い: 1, 霊能: 1, 共有: 2, 狩人: 1, 狂人: 1, 人狼: 2, 妖狐: 1 },
        14: { 村人: 5, 占い: 1, 霊能: 1, 狩人: 1, 共有: 2, 狂人: 1, 人狼: 2, 妖狐: 1 },
        15: { 村人: 6, 占い: 1, 霊能: 1, 狩人: 1, 共有: 2, 狂人: 1, 人狼: 2, 妖狐: 1 },
        16: { 村人: 6, 占い: 1, 霊能: 1, 狩人: 1, 共有: 2, 狂人: 1, 人狼: 3, 妖狐: 1 },
        17: { 村人: 7, 占い: 1, 霊能: 1, 狩人: 1, 共有: 2, 狂人: 1, 人狼: 3, 妖狐: 1 },
        18: { 村人: 6, 占い: 1, 霊能: 1, 狩人: 1, 共有: 2, 猫又: 1, 狂人: 1, 人狼: 4, 妖狐: 1 },
        19: { 村人: 7, 占い: 1, 霊能: 1, 狩人: 1, 共有: 2, 猫又: 1, 狂人: 1, 人狼: 4, 妖狐: 1 },
    },
    M0: {
        4: { 村人: 2, 人狼: 1, 占いor村人: 1 },
        5: { 村人: 3, 人狼: 1, 占い: 1 },
        6: { 村人: 4, 人狼: 1, 占い: 1 },
        7: { 村人: 5, 人狼: 1, 占い: 1 },
        8: { 村人: 5, 人狼: 1, 占い: 1, 村人or人狼: 1 },
        9: { 村人: 5, 人狼: 2, 占い: 1, 霊能: 1 },
        10: { 村人: 5, 人狼: 2, 占い: 1, 霊能: 1, 狂人: 1 },
    },
    M1: {
        4: { 村人: 2, 人狼: 1, 村人or占い: 1 },
        5: { 村人: 2, 人狼: 1, 占い: 1, 妖狐: 1 },
        6: { 村人: 3, 人狼: 1, 占い: 1, 妖狐: 1 },
        7: { 村人: 4, 人狼: 1, 占い: 1, 妖狐: 1 },
        8: { 村人: 4, 人狼: 1, 占い: 1, 妖狐: 1, 村人or狂人: 1 },
        9: { 村人: 3, 人狼: 2, 占い: 1, 霊能: 1, 狩人: 1, 妖狐: 1 },
        10: { 村人: 4, 人狼: 2, 占い: 1, 霊能: 1, 狩人: 1, 妖狐: 1 },
    },
    MA: {
        4: { 村人: 1, 人狼: 1, 占い: 1, 霊能: 1 },
        5: { 村人: 1, 人狼: 1, 占い: 1, 狂人: 1, 狩人: 1 },
        6: { 人狼: 1, 占い: 1, 狂人: 3, 狩人: 1 },
        7: { 村人: 2, 人狼: 1, 占い: 1, 霊能: 1, 狂人: 1, 狩人: 1 },
        8: { 村人: 1, 人狼: 2, 占い: 1, 霊能: 1, 狂人: 1, 共有: 2 },
        9: { 村人: 3, 人狼: 1, 占い: 1, 霊能: 1, 狂人: 1, 狩人: 1, 妖狐: 1 },
        10: { 村人: 2, 人狼: 2, 占い: 2, 狂人: 1, 狩人: 1, 妖狐: 1, 蝙蝠: 1 },
    },
    MB: {
        4: { 村人: 2, 人狼: 1, 占い: 1 },
        5: { 村人: 3, 人狼: 1, 占い: 1 },
        6: { 村人: 3, 人狼: 1, 占い: 1, 霊能: 1 },
        7: { 村人: 3, 人狼: 1, 占い: 1, 霊能: 1, 狩人: 1 },
        8: { 村人: 4, 人狼: 1, 占い: 1, 霊能: 1, 狂人: 1 },
        9: { 村人: 3, 人狼: 2, 占い: 1, 霊能: 1, 狩人: 1, 蝙蝠: 1 },
        10: { 村人: 3, 人狼: 2, 占い: 1, 霊能: 1, 狂人: 1, 奴隷: 1, 貴族: 1 },
    },
    MC: {
        4: { 村人: 3, 人狼: 1 },
        5: { 村人: 3, 人狼: 1, 狩人: 1 },
        6: { 村人: 4, 人狼: 1, 狩人: 1 },
        7: { 村人: 5, 人狼: 1, 狩人: 1 },
        8: { 村人: 1, 人狼: 2, 占い: 1, 霊能: 1, 狂人: 1, 狩人: 1, 魔術: 1 },
        9: { 村人: 7, 人狼: 1, 狩人: 1 },
        10: { 村人: 2, 人狼: 2, 占い: 1, 霊能: 1, 狂人: 1, 狩人: 1, 妖狐: 1, 魔術: 1 },
    },
    MF: {
        4: { 村人: 2, 人狼: 1, 蝙蝠: 1 },
        5: { 村人: 3, 人狼: 1, 蝙蝠: 1 },
        6: { 村人: 2, 人狼: 1, 狩人: 3 },
        7: { 村人: 1, 人狼: 2, 占い: 1, 狩人: 3 },
        8: { 人狼: 2, 占い: 1, 霊能: 1, 狂人: 1, 狩人: 3 },
        9: { 村人: 3, 人狼: 2, 狩人: 3, 蝙蝠: 1 },
        10: { 村人: 2, 人狼: 2, 占い: 1, 霊能: 1, 狩人: 2, 妖狐: 1, 狂人or狂信: 1 },
    },
};
var CastType = /** @class */ (function () {
    function CastType(name, abbr, cast) {
        this.name = name;
        this.abbr = abbr;
        this.cast = cast;
    }
    CastType.prototype.toJobList = function (num) {
        if (!this.cast[num])
            return false;
        var jobList = [];
        for (var job in this.cast[num]) {
            for (var cnt = 0; cnt < this.cast[num][job]; cnt++) {
                if (/or/.test(job)) {
                    job = job.split("or").lot();
                }
                jobList.push(new jobenum[job]());
            }
        }
        return jobList;
    };
    CastType.prototype.castTxt = function (num) {
        if (!this.cast[num])
            return false;
        var txts = [];
        for (var job in this.cast[num]) {
            txts.push("" + job + this.cast[num][job]);
        }
        return "\u3010" + this.name + "\u3011" + txts.join("、");
    };
    return CastType;
}());
var CastManager = /** @class */ (function () {
    function CastManager(list) {
        this.list = list;
        this.abbr2cast = {};
        this.makeObj();
    }
    CastManager.prototype.job = function (name) {
        return new jobenum[name]();
    };
    CastManager.prototype.makeObj = function () {
        var e_1, _a;
        try {
            for (var _b = __values(this.list), _c = _b.next(); !_c.done; _c = _b.next()) {
                var casttype = _c.value;
                this.abbr2cast[casttype.abbr] = casttype;
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
    CastManager.prototype.jobList = function (abbr, num) {
        if (!(abbr in this.abbr2cast))
            return false;
        return this.abbr2cast[abbr].toJobList(num);
    };
    CastManager.prototype.makeCastTxt = function (abbr, num) {
        if (!(abbr in this.abbr2cast))
            return false;
        return this.abbr2cast[abbr].castTxt(num);
    };
    CastManager.prototype.makeCastTxtAll = function (num) {
        var e_2, _a;
        var txts = [];
        try {
            for (var _b = __values(this.list), _c = _b.next(); !_c.done; _c = _b.next()) {
                var casttype = _c.value;
                var txt = casttype.castTxt(num);
                if (txt)
                    txts.push(txt);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return txts.join("<br/>");
    };
    CastManager.prototype.abbr2name = function (abbr) {
        if (abbr in this.abbr2cast) {
            return this.abbr2cast[abbr].name;
        }
        return "？";
    };
    return CastManager;
}());
exports.castManager = new CastManager([
    new CastType("焼肉", "Y", castList.Y),
    new CastType("わかめて", "W", castList.W),
    new CastType("桃栗なし", "M0", castList.M0),
    new CastType("桃栗あり", "M1", castList.M1),
    new CastType("桃栗A", "MA", castList.MA),
    new CastType("桃栗B", "MB", castList.MB),
    new CastType("桃栗C", "MC", castList.MC),
    new CastType("桃栗F", "MF", castList.MF),
]);
//# sourceMappingURL=cast.js.map