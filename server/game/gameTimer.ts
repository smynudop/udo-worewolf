import moment from "moment"
import { ITimer } from "./ITimer"

export class GameTimer implements ITimer {
    phaseLimit: string | null
    timerFlg: NodeJS.Timeout | null
    isBanTalk: boolean

    constructor() {
        this.phaseLimit = null
        this.timerFlg = null
        this.isBanTalk = false
    }

    setLimit(sec: number) {
        this.phaseLimit = moment().add(sec, "seconds").format()
    }

    clearLimit() {
        this.phaseLimit = null
    }

    leftSeconds() {
        return this.phaseLimit ? moment().diff(this.phaseLimit, "seconds") * -1 : null
    }

    setNsec(sec: number) {
        this.isBanTalk = true
        setTimeout(() => {
            this.isBanTalk = false
        }, sec * 1000)
    }

    setTimer(callback: () => void, sec: number) {
        this.clearTimer()
        this.timerFlg = setTimeout(callback, sec * 1000)
        this.setLimit(sec)
    }

    clearTimer() {
        if (this.timerFlg) {
            clearTimeout(this.timerFlg)
        }
        this.clearLimit()
    }
}
