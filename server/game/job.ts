import { IStatus, IAbility } from "./status"

export class Job {
    /** 一位な名前です。 */
    name: string
    /** 日本語の役職名です。 */
    nameja: string
    /** 勝敗を決めるときの陣営を表します。 */
    camp: "human" | "wolf" | "fox"
    /** 終了判定などに使用する種族を表します。 */
    species: "human" | "wolf" | "fox"
    /** 占いの結果です。 */
    fortuneResult: "村人" | "人狼"
    /** 霊能の結果です。 */
    necroResult: "村人" | "人狼"
    /** 役職の説明文 */
    desc: string
    /** 種類です。 */
    talk: string[]
    knowFriend: string[]
    watch: string[]
    /** 能力を表します。 */
    ability: IAbility[]
    /** 受動的な能力を表します */
    forever: IStatus[]
    rival: string[]
    winCond: string[]

    offShowJobDead: boolean
    onlyNotDamy: boolean
    constructor(name: string) {
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

export const JobEnum = {
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
} as const
export type JobName = keyof typeof JobEnum