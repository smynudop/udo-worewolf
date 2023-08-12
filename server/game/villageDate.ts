import moment from "moment"

import { Game } from "./game"

export class VillageDate {
    day: number
    phase: string
    phaseLimit: any
    timerFlg: any
    game: Game
    isBanTalk: boolean

    constructor(game: Game) {
        this.day = 1
        this.phase = "prologue"
        this.phaseLimit = null
        this.timerFlg = null
        this.isBanTalk = false
        this.game = game
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

    sunrise() {
        this.day++
    }

    pass(phase: string) {
        this.phase = phase
        if (phase == "day") {
            this.sunrise()
        }
    }

    forLog() {
        return { day: this.day, phase: this.phase }
    }

    is(phase: string) {
        return phase == this.phase
    }

    canTalk(type: string) {
        switch (type) {
            case "share":
            case "fox":
                return this.is("night") || this.is("ability")
            case "wolf":
                return this.is("night")
            case "discuss":
                return ["prologue", "day", "epilogue"].includes(this.phase)
            case "tweet":
                return ["day", "vote", "night", "ability"].includes(this.phase)
        }
    }

    canVote() {
        return this.is("day") || this.is("vote")
    }

    canUseAbility() {
        return this.is("night") || this.is("ability")
    }

    setNsec(sec: number) {
        this.isBanTalk = true
        setTimeout(() => {
            this.isBanTalk = false
        }, sec * 1000)
    }

    setTimer(nextPhase: string, sec: number) {
        this.clearTimer()
        this.timerFlg = setTimeout(() => {
            this.game.changePhase(nextPhase)
        }, sec * 1000)
        this.setLimit(sec)
    }

    clearTimer() {
        clearTimeout(this.timerFlg)
        this.clearLimit()
    }
}
