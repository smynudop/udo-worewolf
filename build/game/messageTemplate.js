"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageFormat = exports.messageTemplate = void 0;
exports.messageTemplate = {
    vote: {
        success: "{player}さんが{target}さんに投票しました。",
        summary: "[icon:voteResult]{day}日目 投票結果。<br>{message}",
    },
    ability: {
        fortune: "[icon:fortune]{player}さんは{target}さんを占い、結果は{fortuneResult}でした。{autoMark}",
        necro: "[icon:necro]前日処刑された{target}さんは{necroResult}でした。",
        guard: "[icon:guard]{player}さんは{target}さんを護衛します。{autoMark}",
        revive: "[icon:revive]{player}さんは{target}さんの蘇生を試みます。{autoMark}",
        bite: "[icon:wolf]{player}さんは{target}さんを狙います。{autoMark}",
        reiko: "[icon:reiko]初日犠牲者さんは{result}です。",
    },
    gameend: {
        win: "{side}陣営の勝利です！",
        draw: "引き分けです！",
    },
    death: {
        bite: "[icon:bite]{player}さんは無残な姿で発見されました……",
        fellow: "{player}さんは妖狐の後を追って命を絶ちました……",
        exec: "[icon:exec]{player}さんは村民協議の結果処刑されました……",
        standoff: "{player}さんは猫又の呪いで死亡しました……",
    },
    result: {
        win: "{player}さんは勝利しました。",
        draw: "{player}さんは引き分けました。",
        lose: "{player}さんは敗北しました。",
    },
    player: {
        add: "{player}さんが入村しました。",
        leave: "{player}さんが退村しました。",
        kick: "{player}さんは追い出されました。",
        reject: "{player}さんが村八分になりました。",
    },
    phase: {
        day: "[icon:sun]{day}日目の朝になりました。",
        vote: "[icon:vote]日が沈もうとしています。投票してください。",
        revote: "[icon:vote]再投票になりました。あと{left}回で決着がつかない場合は引き分けです。",
        night: "[icon:moon]{day}日目の夜になりました。",
        ability: "[icon:ability]まもなく夜が明けます。能力を実行して下さい。",
    },
    comeback: {
        comeback: "{player}さんは奇跡的に蘇生しました。",
    },
    system: {
        damy: "これが出てる場合は変だよ",
        system: "{message}",
        info: "{message}",
        startRollCall: "点呼が開始されました。参加者は発言してください。",
        banTalk: "まだ発言できません。",
        cast: "配役は{message}です。",
        loggedDate: "{message}にhtml化されます。",
    },
    talk: {
        talk: "{input}",
        discuss: "{input}",
        wolf: "{input}",
        tweet: "{input}",
        share: "{input}",
        fox: "{input}",
        grave: "{input}",
        gmMessage: "{input}",
        wolfNeigh: "アオォーン・・・",
    },
};
class MessageFormat {
    constructor(log) {
        this.log = log;
        this.date = log.date;
    }
    htmlEscape(text) {
        text = text
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/'/g, "&#039;");
        return text;
    }
    format(type, detail, option) {
        let message;
        if (detail in exports.messageTemplate[type]) {
            message = exports.messageTemplate[type][detail];
        }
        else {
            message = exports.messageTemplate.system.damy;
        }
        option.autoMark = option.isAuto ? "【自動実行】" : "";
        if (option.input) {
            option.input = this.htmlEscape(option.input);
        }
        message = message.replace(/\{([^\}]+?)\}/g, function (match, key) {
            if (key in option) {
                return option[key];
            }
            else {
                return match;
            }
        });
        message = message.replace(/\[icon:(.+?)\]/g, function (match, key) {
            return `<img src='../images/${key}.png'/>`;
        });
        return message;
    }
    findTarget(type, detail) {
        switch (type) {
            case "vote":
                if (detail == "success")
                    return "personal";
                break;
            case "talk":
                if (detail == "wolf" || detail == "wolfNeigh")
                    return "wolf";
                if (detail == "share")
                    return "share";
                if (detail == "fox")
                    return "fox";
                if (detail == "grave")
                    return "grave";
                if (detail == "tweet")
                    return "personal";
                break;
            case "ability":
                if (detail == "bite")
                    return "wolf";
                return "personal";
                break;
        }
        return "all";
    }
    findType(type) {
        if (type == "talk")
            return "talk";
        return "system";
    }
    findClass(type, detail) {
        switch (type) {
            case "talk":
                return detail;
            case "player":
                return "info";
            case "vote":
                return "vote";
            case "ability":
                if (detail == "bite")
                    return "wolf-system";
                return "personal";
            case "phase":
                return "progress";
            case "result":
                return "info";
            case "system":
                if (detail == "info")
                    return "info";
        }
        return "system";
    }
    makeLog(type, detail, option) {
        let target = this.findTarget(type, detail);
        let messageType = this.findType(type);
        let cl = this.findClass(type, detail);
        let message = this.format(type, detail, option);
        let no = option.no === undefined ? 999 : option.no;
        let log = {
            target: target,
            type: messageType,
            class: cl,
            message: message,
            day: this.date.day,
            phase: this.date.phase,
            no: no,
            cn: option.cn || "",
            color: option.color || "",
            size: option.size || "normal",
        };
        return log;
    }
}
exports.MessageFormat = MessageFormat;
//# sourceMappingURL=messageTemplate.js.map