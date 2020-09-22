"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.talkInfo = exports.abilityInfo = exports.talkTemplate = void 0;
exports.talkTemplate = {
    discuss: ["おはよ", "おはようこ", "おはよー", "おはようございます"],
    wolf: ["誰噛む？", "よろしく", "騙ります 即抜き"],
    share: ["誰吊る？", "怪しいとこあった？", "霊能COしていい？"],
    fox: ["占いは嫌だ", "コンコン", "特攻いくかｗ"],
    tweet: ["暇だな", "誰が狼や……", "あ、ヒヒ落ちたw"],
};
exports.abilityInfo = {
    fortune: {
        type: "fortune",
        since: 1,
        text: "占う",
        targetType: "alive",
    },
    guard: {
        type: "guard",
        since: 2,
        text: "護衛",
        targetType: "alive",
    },
    bite: {
        type: "bite",
        since: 2,
        text: "襲撃",
        targetType: "alive",
    },
    revive: {
        type: "revive",
        since: 3,
        text: "蘇生",
        targetType: "death",
    },
};
exports.talkInfo = {
    discuss: {
        type: "discuss",
        text: "議論",
    },
    grave: {
        type: "grave",
        text: "霊話",
    },
    wolf: {
        type: "wolf",
        text: "狼会話",
    },
    fox: {
        type: "fox",
        text: "念話",
    },
    share: {
        type: "share",
        text: "会話",
    },
    gmMessage: {
        type: "gmMessage",
        text: "全体へ発言",
    },
    tweet: {
        type: "tweet",
        text: "独り言",
    },
};
//# sourceMappingURL=command.js.map