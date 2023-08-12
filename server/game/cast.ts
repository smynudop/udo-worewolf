import { Job, JobEnum, JobName } from "./job"
import Yakiniku from "./cast/Yakiniku"
import WakameteCast from "./cast/Wakamete"
import MomokuriNasi from "./cast/MomokuriNasi"
import MomokuriAri from "./cast/MomokuriAri"
import MomokuriA from "./cast/MomokuriA"
import MomokuriB from "./cast/MomokuriB"
import MomokuriC from "./cast/MomokuriC"
import MomokuriF from "./cast/MomokuriF"

export type EachCast = { [job: string]: number }
export type Cast = { [num: number]: EachCast }

class CastType {
  name: string
  abbr: string
  cast: Cast
  constructor(name: string, abbr: string, cast: Cast) {
    this.name = name
    this.abbr = abbr
    this.cast = cast
  }

  toJobList(num: number): Job[] | undefined {
    if (!this.cast[num]) return undefined

    const cast = this.cast[num]

    const jobList: Job[] = []
    for (let job in cast) {
      for (let cnt = 0; cnt < cast[job]; cnt++) {
        if (/or/.test(job)) {
          job = job.split("or").lot()
        }
        // TODO: 暫定的な処置…
        jobList.push(new JobEnum[job as keyof typeof JobEnum]())
      }
    }

    do {
      jobList.shuffle()
    } while (jobList[0].onlyNotDamy)

    return jobList
  }

  castTxt(num: number) {
    if (!this.cast[num]) return ""
    const cast = this.cast[num]

    const txts: string[] = []
    for (const job in cast) {
      txts.push(`${job}${cast[job]}`)
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

  job(name: JobName) {
    // TODO: 暫定的な処置…
    return new JobEnum[name]()
  }

  makeObj() {
    for (const casttype of this.list) {
      this.abbr2cast[casttype.abbr] = casttype
    }
  }

  getCast(abbr: string): CastType | null {
    return this.abbr2cast[abbr]
  }

  jobList(abbr: string, num: number): Job[] | undefined {
    return this.getCast(abbr)?.toJobList(num) ?? undefined
  }

  makeCastTxt(abbr: string, num: number): string {
    return this.getCast(abbr)?.castTxt(num) ?? ""
  }

  makeCastTxtAll(num: number) {
    const txts: string[] = []
    for (const casttype of this.list) {
      const txt = casttype.castTxt(num)
      if (txt) txts.push(txt)
    }
    return txts.join("<br/>")
  }

  abbr2name(abbr: string) {
    return this.getCast(abbr)?.name ?? "？"
  }
}

export const castManager = new CastManager([
  new CastType("焼肉", "Y", Yakiniku),
  new CastType("わかめて", "W", WakameteCast),
  new CastType("桃栗なし", "M0", MomokuriNasi),
  new CastType("桃栗あり", "M1", MomokuriAri),
  new CastType("桃栗A", "MA", MomokuriA),
  new CastType("桃栗B", "MB", MomokuriB),
  new CastType("桃栗C", "MC", MomokuriC),
  new CastType("桃栗F", "MF", MomokuriF),
])
