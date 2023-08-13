export interface IVillageSetting {
    vno: number
    name: string
    pr: string
    casttype: string
    time: { [k: string]: number }
    GMid: string
    capacity: number
    isShowJobDead: boolean
    kariGM?: boolean
    state?: string
}

export class VillageSetting implements IVillageSetting {
    vno: number
    name: string
    pr: string
    casttype: string
    time: { [k: string]: number }
    GMid: string
    capacity: number
    isShowJobDead: boolean

    constructor(data: Partial<IVillageSetting>) {
        this.vno = data.vno || 1
        this.name = data.name || "とある村"
        this.pr = data.pr || "宣伝文が設定されていません"
        this.casttype = data.casttype || "Y"
        this.time = data.time || {
            day: 285,
            vote: 150,
            night: 180,
            ability: 120,
            nsec: 15,
        }
        this.GMid = data.GMid || "damyGMId"
        this.capacity = data.capacity || 17
        this.isShowJobDead = data.isShowJobDead || true
    }

    update(data: Partial<IVillageSetting>) {
        this.name = data.name || this.name
        this.pr = data.pr || this.pr
        this.casttype = data.casttype || this.casttype
        this.time = data.time || this.time
        this.capacity = data.capacity || this.capacity
        this.isShowJobDead = data.isShowJobDead || this.isShowJobDead
    }

    villageInfo(): IVillageSetting {
        return {
            vno: this.vno,
            name: this.name,
            pr: this.pr,
            casttype: this.casttype,
            time: this.time,
            GMid: this.GMid,
            capacity: this.capacity,
            isShowJobDead: this.isShowJobDead,
        }
    }

    text(): string {
        return `${this.vno}番 ${this.name} 定員${this.capacity}名
${this.pr}
昼${this.time.day}秒 投票${this.time.vote}秒 夜${this.time.night}秒 能力${this.time.ability}秒
配役:${this.casttype}

GM:${this.GMid}`
    }
}
