import { Job, JobEnum, JobName } from "./job"
import Yakiniku from "./cast/Yakiniku"
import WakameteCast from "./cast/Wakamete"
import MomokuriNasi from "./cast/MomokuriNasi"
import MomokuriAri from "./cast/MomokuriAri"
import MomokuriA from "./cast/MomokuriA"
import MomokuriB from "./cast/MomokuriB"
import MomokuriC from "./cast/MomokuriC"
import MomokuriF from "./cast/MomokuriF"

type EachCast = (JobName | JobName[])[]
export type Cast = {
    name: string
    mark: string
    [num: number]: EachCast
}

class CastManager {
    list: Cast[]
    abbr2cast: Map<string, Cast> = new Map()

    constructor(list: Cast[]) {
        this.list = list
        this.makeObj()
    }

    job(name: JobName) {
        // TODO: 暫定的な処置…
        return new JobEnum[name]()
    }

    makeObj() {
        for (const cast of this.list) {
            this.abbr2cast.set(cast.mark, cast)
        }
    }

    getCast(abbr: string, num: number): EachCast | undefined {
        return this.abbr2cast.get(abbr)?.[num]
    }

    jobList(abbr: string, num: number): Job[] | undefined {
        const eachCast = this.getCast(abbr, num)
        if (!eachCast) return undefined

        const names = eachCast.map((name) => (Array.isArray(name) ? name.lot() : name))
        return names.map((name) => new JobEnum[name]())
    }

    makeCastTxt(abbr: string, num: number): string | undefined {
        const cast = this.abbr2cast.get(abbr)
        if (!cast) return undefined

        const eachCast = cast[num]
        if (!eachCast) return undefined

        const cnts: Record<string, number> = {}

        for (const job of eachCast) {
            const name = Array.isArray(job) ? job.join("or") : job
            cnts[name] ??= 0
            cnts[name]++
        }

        const txts = Object.entries(cnts).map(([name, cnt]) => `${name}${cnt}`)

        return `【${cast.name}】` + txts.join("、")
    }

    makeCastTxtAll(num: number) {
        const txts: string[] = []
        for (const casttype of this.list) {
            const txt = this.makeCastTxt(casttype.mark, num)
            if (txt) txts.push(txt)
        }
        return txts.join("<br/>")
    }
}

export const castManager = new CastManager([
    Yakiniku,
    WakameteCast,
    MomokuriA,
    MomokuriB,
    MomokuriC,
    MomokuriF,
    MomokuriAri,
    MomokuriNasi,
])
