import { Schema } from "mongoose"
export type ITime = {
    day: number
    vote: number
    night: number
    ability: number
    nsec: number
}

export type IGame = {
    vno: number
    name: string
    pr: string
    casttype: string
    time: ITime
    capacity: number
    GMid: string
    state: string
    kariGM: boolean
}

export const GameSchema = new Schema<IGame>({
    vno: { type: Number, required: true },
    name: { type: String, required: true },
    pr: { type: String, required: true },
    casttype: { type: String, required: true },
    time: {
        day: Number,
        vote: Number,
        night: Number,
        ability: Number,
        nsec: Number,
    },
    capacity: { type: Number, required: true },
    GMid: { type: String, required: true },
    state: { type: String },
    kariGM: { type: Boolean },
})
