const abilityInfo = {
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
}

const talkInfo = {
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
}

module.exports = {
    ability: abilityInfo,
    talk: talkInfo,
}
