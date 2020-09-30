class Job {
    name: string
    nameja: string
    camp: string
    species: string
    fortuneResult: string
    necroResult: string
    desc: string
    forever: string[]
    talk: string[]
    knowFriend: string[]
    watch: string[]
    ability: string[]
    rival: string[]
    winCond: string[]

    offShowJobDead: boolean
    onlyNotDamy: boolean
    constructor(name) {
        this.name = name
        this.nameja = ""
        this.camp = "human"
        this.species = "human"
        this.fortuneResult = "村人"
        this.necroResult = "村人"
        this.desc = ""
        this.offShowJobDead = false
        this.onlyNotDamy = false

        this.ability = []
        this.knowFriend = []
        this.talk = []
        this.watch = []
        this.forever = []
        this.winCond = ["winCamp"]
        this.rival = []
    }
}

class Villager extends Job {
    constructor() {
        super("villager")
        this.nameja = "村人"
        this.desc = "何の能力も持ちませんが、知恵と勇気で村を救いましょう。"
    }
}

class Fortune extends Job {
    constructor() {
        super("fortune")
        this.nameja = "占い師"
        this.desc = "毎晩生存者一人を占い、人狼かどうか調べることが出来ます。"
        this.ability = ["fortune"]
    }
}

class Necro extends Job {
    constructor() {
        super("necro")
        this.nameja = "霊能者"
        this.desc = "前の日に処刑された人が、人狼かどうかがわかります。"
        this.ability = ["necro"]
    }
}

class Guard extends Job {
    constructor() {
        super("guard")
        this.nameja = "狩人"
        this.desc = "毎晩一人を襲撃から守ることが出来ます。人狼の心を読みましょう。"
        this.ability = ["guard"]
    }
}
class Share extends Job {
    constructor() {
        super("share")
        this.nameja = "共有者"
        this.desc = "毎晩一人を襲撃から守ることが出来ます。人狼の心を読みましょう。"
        this.talk = ["share"]
    }
}

class Cat extends Job {
    constructor() {
        super("guard")
        this.nameja = "猫又"
        this.desc =
            "狼に噛まれると、噛んだ狼を返り討ちにします。処刑されると、生存者一人を巻き添えにします。"
        this.onlyNotDamy = true
        this.forever = ["standoff"]
    }
}

class Wolf extends Job {
    constructor() {
        super("wolf")
        this.nameja = "人狼"
        this.desc = "村人を襲撃し、処刑を免れ、村を人狼のものにするのです。"
        this.camp = "wolf"
        this.species = "wolf"
        this.onlyNotDamy = true
        this.fortuneResult = "人狼"
        this.necroResult = "人狼"

        this.talk = ["wolf"]
        this.ability = ["bite"]
        this.knowFriend = ["wolf"]
        this.forever = ["notBitten"]
    }
}

class Madness extends Job {
    constructor() {
        super("madness")
        this.nameja = "狂人"
        this.desc = "人狼陣営として村を惑わしましょう。勝利のためには自らの犠牲も必要です。"
        this.camp = "wolf"
    }
}

class Fanatic extends Job {
    constructor() {
        super("fanatic")
        this.nameja = "狂信者"
        this.desc = "人狼が誰だかわかる狂人です。人狼陣営として、狼の手助けをしましょう。"
        this.camp = "wolf"

        this.knowFriend = ["wolf"]
    }
}

class Fox extends Job {
    constructor() {
        super("fox")
        this.nameja = "妖狐"
        this.desc = "占われず、処刑されず、時には抵抗して、とにかく生存しましょう。"
        this.camp = "fox"
        this.species = "fox"
        this.onlyNotDamy = true

        this.forever = ["melt", "resistBite"]
        this.knowFriend = ["fox"]
        this.talk = ["fox"]
    }
}

class NecroFox extends Job {
    constructor() {
        super("necrofox")
        this.nameja = "霊狐"
        this.desc = "初日犠牲者の役職がわかる妖狐です。情報のリードを活かしましょう。"
        this.camp = "fox"
        this.species = "fox"
        this.onlyNotDamy = true

        this.forever = ["melt", "resistBite", "knowdamy"]
        this.knowFriend = ["fox"]
        this.talk = ["fox"]
    }
}

class Immoralist extends Job {
    constructor() {
        super("immoralist")
        this.nameja = "背徳者"
        this.desc = "人間でありながら妖狐陣営です。妖狐の生存に全力を尽くしましょう。"
        this.camp = "fox"

        this.knowFriend = ["fox"]
        this.forever = ["fellowFox"]
    }
}

class Noble extends Job {
    constructor() {
        super("noble")
        this.nameja = "貴族"
        this.desc =
            "狼に襲撃された時、奴隷を身代わりにして生き延びることが出来ます。ただ、恨みを買っているようですよ。"

        this.forever = ["useDecoy"]
    }
}

class Slave extends Job {
    constructor() {
        super("slave")
        this.nameja = "奴隷"
        this.desc = "村人の勝利に加え、貴族の死亡が勝利条件です。ときには反逆も必要かもしれません。"

        this.knowFriend = ["noble"]
        this.forever = ["decoy"]
        this.winCond = ["winCamp", "killRival"]
        this.rival = ["noble"]
    }
}

class Bat extends Job {
    constructor() {
        super("bat")
        this.nameja = "蝙蝠"
        this.desc = "生存のみが勝利条件です。強いものの味方に立ち、とにかく生き延びましょう。"
        this.winCond = ["alive"]
    }
}

class Magician extends Job {
    constructor() {
        super("magician")
        this.nameja = "魔術師"
        this.desc = "3日目以降、死者を蘇生することが出来ます。ただ、その確率は…？"
        this.offShowJobDead = true

        this.ability = ["revive"]
    }
}

class GameMaster extends Job {
    constructor() {
        super("gm")
        this.nameja = "ゲームマスター"
        this.desc = "参加者が気持ちよくゲームを出来ているか見守るのが仕事です。"
    }
}

const jobenum = {
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
}

type eachcast = { [job: string]: number }
type cast = { [num: number]: eachcast }

const castList: { [type: string]: cast } = {
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
}

class CastType {
    name: string
    abbr: string
    cast: cast
    constructor(name: string, abbr: string, cast: cast) {
        this.name = name
        this.abbr = abbr
        this.cast = cast
    }

    toJobList(num: number) {
        if (!this.cast[num]) return false

        let cast = this.cast[num]

        let jobList: Job[] = []
        for (let job in cast) {
            for (let cnt = 0; cnt < cast[job]; cnt++) {
                if (/or/.test(job)) {
                    job = job.split("or").lot()
                }
                jobList.push(new jobenum[job]())
            }
        }

        do {
            jobList.shuffle()
            console.log(jobList)
        } while (jobList[0].onlyNotDamy)

        return jobList
    }

    castTxt(num: number) {
        if (!this.cast[num]) return ""

        let txts: string[] = []
        for (let job in this.cast[num]) {
            txts.push(`${job}${this.cast[num][job]}`)
        }

        return `【${this.name}】` + txts.join("、")
    }
}

class CastManager {
    list: CastType[]
    abbr2cast: { [abbr: string]: CastType }

    constructor(list: CastType[]) {
        this.list = list
        this.abbr2cast = {}
        this.makeObj()
    }

    job(name: string) {
        return new jobenum[name]()
    }

    makeObj() {
        for (let casttype of this.list) {
            this.abbr2cast[casttype.abbr] = casttype
        }
    }

    jobList(abbr: string, num: number) {
        if (!(abbr in this.abbr2cast)) return false
        return this.abbr2cast[abbr].toJobList(num)
    }

    makeCastTxt(abbr: string, num: number): string {
        if (!(abbr in this.abbr2cast)) return ""
        return this.abbr2cast[abbr].castTxt(num)
    }

    makeCastTxtAll(num: number) {
        let txts: string[] = []
        for (let casttype of this.list) {
            let txt = casttype.castTxt(num)
            if (txt) txts.push(txt)
        }
        return txts.join("<br/>")
    }

    abbr2name(abbr) {
        if (abbr in this.abbr2cast) {
            return this.abbr2cast[abbr].name
        }
        return "？"
    }
}

export const castManager = new CastManager([
    new CastType("焼肉", "Y", castList.Y),
    new CastType("わかめて", "W", castList.W),
    new CastType("桃栗なし", "M0", castList.M0),
    new CastType("桃栗あり", "M1", castList.M1),
    new CastType("桃栗A", "MA", castList.MA),
    new CastType("桃栗B", "MB", castList.MB),
    new CastType("桃栗C", "MC", castList.MC),
    new CastType("桃栗F", "MF", castList.MF),
])
