import { IPhase, ITalkType } from "./constants"

export class VillageDate {
    day: number
    phase: IPhase

    constructor() {
        this.day = 1
        this.phase = "prologue"
    }

    sunrise() {
        this.day++
    }

    pass(phase: IPhase) {
        this.phase = phase
        if (phase == "day") {
            this.sunrise()
        }
    }

    is(phase: IPhase) {
        return phase == this.phase
    }

    canTalk(type: ITalkType): boolean {
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

        return false
    }

    canVote() {
        return this.is("day") || this.is("vote")
    }

    canUseAbility() {
        return this.is("night") || this.is("ability")
    }
}
